"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useUser, SignOutButton } from "@clerk/nextjs";

export default function RoomPage() {
  const { isLoaded, user } = useUser();
  const params = useParams();
  const roomId = params.roomId as string;

  const socketRef = useRef<Socket | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:3005");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      socket.emit("join_room", roomId);
      console.log("Joined room:", roomId);
    });

    socket.on("chat message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    const canvas = canvasRef.current;
    const toolbar = toolbarRef.current;

    if (!canvas || !toolbar) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasOffsetX = canvas.offsetLeft;
    const canvasOffsetY = canvas.offsetTop;

    canvas.width = window.innerWidth - canvasOffsetX;
    canvas.height = window.innerHeight - canvasOffsetY;

    let isPainting = false;
    let lineWidth = 5;

    let prevX = 0;
    let prevY = 0;

    ctx.lineCap = "round";

    socket.on("drawing_history", (history) => {
      history.forEach((stroke: any) => {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;

        ctx.beginPath();
        ctx.moveTo(stroke.prev_x, stroke.prev_y);
        ctx.lineTo(stroke.x, stroke.y);
        ctx.stroke();
      });
    });

    socket.on("draw", (art) => {
      ctx.strokeStyle = art.color;
      ctx.lineWidth = art.width;

      ctx.beginPath();
      ctx.moveTo(art.prevX, art.prevY);
      ctx.lineTo(art.x, art.y);
      ctx.stroke();
    });

    const draw = (e: MouseEvent) => {
      if (!isPainting) return;

      const x = e.clientX - canvasOffsetX;
      const y = e.clientY - canvasOffsetY;

      ctx.lineWidth = lineWidth;

      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();

      const art = {
        prevX,
        prevY,
        x,
        y,
        color: ctx.strokeStyle,
        width: lineWidth,
      };

      socketRef.current?.emit("draw", {
        room: roomId,
        art,
      });

      prevX = x;
      prevY = y;
    };

    const mouseDown = (e: MouseEvent) => {
      isPainting = true;
      prevX = e.clientX - canvasOffsetX;
      prevY = e.clientY - canvasOffsetY;

      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
    };

    const mouseUp = () => {
      isPainting = false;
      ctx.beginPath();
    };

    const toolbarClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.id === "clear") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const toolbarChange = (e: Event) => {
      const target = e.target as HTMLInputElement;

      if (target.id === "stroke") ctx.strokeStyle = target.value;
      if (target.id === "lineWidth") lineWidth = Number(target.value);
    };

    canvas.addEventListener("mousedown", mouseDown);
    canvas.addEventListener("mouseup", mouseUp);
    canvas.addEventListener("mousemove", draw);

    toolbar.addEventListener("click", toolbarClick);
    toolbar.addEventListener("change", toolbarChange);

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!socketRef.current || !isLoaded || !user) return;

    setMessages((prev) => [
      ...prev,
      { msg: message, user_name: user.firstName },
    ]);

    socketRef.current.emit("chat message", {
      room: roomId,
      msg: message,
      user_id: user.id,
      user_name: user.firstName,
    });

    setMessage("");
  };

  return (
    <div className="relative h-screen w-screen bg-[#121212] overflow-hidden font-sans antialiased text-slate-200">
      {/* --- Floating Dark Glass Toolbar --- */}
      <div
        ref={toolbarRef}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6 px-6 py-3 bg-[#1e1e1e]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all hover:border-white/20"
      >
        <div className="flex items-center gap-4 pr-6 border-r border-white/10">
          <div className="relative group">
            <input
              id="stroke"
              type="color"
              className="w-8 h-8 rounded-lg border border-white/10 bg-transparent cursor-pointer overflow-hidden transition-transform hover:scale-110"
            />
          </div>

          <div className="flex flex-col w-24">
            <input
              id="lineWidth"
              type="range"
              min="1"
              max="20"
              defaultValue={5}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="clear"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
            title="Clear Canvas"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-xl transition-all ${
              isSidebarOpen
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* --- Main Canvas Area (Pure White) --- */}
      <div className="h-full w-full bg-white flex items-center justify-center">
        <canvas ref={canvasRef} className="block cursor-crosshair" />
      </div>

      {/* --- Dark Themed Slide-out Chat --- */}
      <div
        className={`fixed top-0 right-0 h-full bg-[#18181b]/95 backdrop-blur-2xl border-l border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.7)] transition-all duration-500 ease-in-out z-30 flex flex-col ${
          isSidebarOpen ? "w-80 translate-x-0" : "w-0 translate-x-full"
        }`}
      >
        {isSidebarOpen && (
          <div className="flex flex-col h-full w-80">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Chat
              </h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-right-4 duration-300"
                >
                  <span className="text-[10px] font-bold text-blue-400/80 ml-1 uppercase tracking-wider">
                    {m.user_name}
                  </span>
                  <div className="bg-white/5 text-slate-200 px-4 py-2.5 rounded-2xl rounded-tl-none text-sm inline-block max-w-[95%] border border-white/5 shadow-inner">
                    {m.msg}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-black/20 border-t border-white/5">
              <div className="relative flex items-center">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Say something..."
                  className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all text-sm text-white placeholder:text-slate-600"
                />
                <button
                  onClick={sendMessage}
                  className="absolute right-2 p-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
    <div className="flex h-screen bg-black text-white overflow-hidden">
      
      <div
        ref={toolbarRef}
        className="flex flex-col gap-2 p-4 w-48 bg-neutral-900"
      >
        <h1 className="text-xl font-bold">Draw</h1>

        <label>Stroke</label>
        <input id="stroke" type="color" />

        <label>Width</label>
        <input id="lineWidth" type="number" defaultValue={5} />

        <button id="clear" className="bg-blue-500 p-1 rounded">
          Clear
        </button>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="mt-4 bg-zinc-700 p-2 rounded"
        >
          {isSidebarOpen ? "Close Chat" : "Open Chat"}
        </button>
      </div>

      <div className="flex-1 bg-white">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      <div
        className={`bg-zinc-900 transition-all duration-300 overflow-hidden ${
          isSidebarOpen ? "w-80 p-4" : "w-0"
        }`}
      >
        {isSidebarOpen && (
          <div className="flex flex-col h-full gap-3">
            <h2 className="text-lg font-semibold">Chat</h2>

            <div className="flex-1 overflow-y-auto text-sm space-y-2">
              {messages.map((m, i) => (
                <div key={i}>
                  <span className="font-semibold text-white">
                    {m.user_name}:
                  </span>{" "}
                  <span className="text-zinc-300">{m.msg}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type message..."
                className="flex-1 px-2 py-1 rounded text-black"
              />

              <button
                onClick={sendMessage}
                className="bg-white text-black px-3 rounded"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
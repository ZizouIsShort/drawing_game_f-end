"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const socketRef = useRef<Socket | null>(null);
  const [message, setMessage] = useState("");

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

    socket.on("message", (msg) => {
      console.log("Received message:", msg);
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

    socket.on("draw", (art) => {
      if (!ctx) return;

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
      ctx.lineCap = "round";

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
      if (!isPainting) return;

      isPainting = false;
      ctx.stroke();
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

      if (target.id === "stroke") {
        ctx.strokeStyle = target.value;
      }

      if (target.id === "lineWidth") {
        lineWidth = Number(target.value);
      }
    };

    canvas.addEventListener("mousedown", mouseDown);
    canvas.addEventListener("mouseup", mouseUp);
    canvas.addEventListener("mousemove", draw);

    toolbar.addEventListener("click", toolbarClick);
    toolbar.addEventListener("change", toolbarChange);

    return () => {
      canvas.removeEventListener("mousedown", mouseDown);
      canvas.removeEventListener("mouseup", mouseUp);
      canvas.removeEventListener("mousemove", draw);

      toolbar.removeEventListener("click", toolbarClick);
      toolbar.removeEventListener("change", toolbarChange);

      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!socketRef.current) return;

    socketRef.current.emit("chat message", {
      room: roomId,
      msg: message,
    });

    console.log("Sent:", message);
    setMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-zinc-50 dark:bg-black">
      <section className="h-screen flex text-white overflow-hidden">
        <div
          id="toolbar"
          ref={toolbarRef}
          className="flex flex-col gap-[6px] p-4 w-48 bg-neutral-900"
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#91EAE4] via-[#86A8E7] to-[#7F7FD5] bg-clip-text text-transparent">
            Draw.
          </h1>

          <label htmlFor="stroke" className="text-[12px]">
            Stroke
          </label>
          <input id="stroke" type="color" className="w-full" />

          <label htmlFor="lineWidth" className="text-[12px]">
            Line Width
          </label>
          <input
            id="lineWidth"
            type="number"
            defaultValue={5}
            className="w-full text-black px-1"
          />

          <button
            id="clear"
            className="bg-blue-500 rounded-[4px] text-white px-[2px] py-[2px] hover:bg-blue-600"
          >
            Clear
          </button>
        </div>

        <div className="flex-1 bg-white">
          <canvas
            id="drawing-board"
            ref={canvasRef}
            className="w-full h-full"
          />
        </div>
      </section>

      <h1 className="text-xl font-semibold">Room: {roomId}</h1>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
          className="border rounded px-3 py-2"
        />

        <button
          onClick={sendMessage}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>

      <p className="text-sm text-zinc-500">
        Messages will appear in the console
      </p>
    </div>
  );
}

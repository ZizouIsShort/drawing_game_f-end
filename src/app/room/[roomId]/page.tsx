"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const socketRef = useRef<Socket | null>(null);
  const [message, setMessage] = useState("");

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

    return () => {
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

      <h1 className="text-xl font-semibold">
        Room: {roomId}
      </h1>

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
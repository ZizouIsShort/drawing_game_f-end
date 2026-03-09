"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function SocketTestPage() {
  const socketRef = useRef<Socket | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const socket = io("http://localhost:3005");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("connected:", socket.id);
    });

    socket.on("message", (msg: string) => {
      console.log("received:", msg);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!socketRef.current) return;

    socketRef.current.emit("chat message", message);
    console.log("sent:", message);

    setMessage("");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Socket Test</h1>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="type message"
      />

      <button onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}
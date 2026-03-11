"use client";

import { useState } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { isLoaded, user } = useUser();
  const [roomNumber, setRoomNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3005/create", {
        method: "POST",
      });

      const roomId = await response.text();

      if (response.ok && roomId) {
        router.push(`/room/${roomId}`);
      }
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Server is offline or unreachable.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();

    if (roomNumber.trim()) {
      router.push(`/room/${roomNumber}`);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full max-w-md flex-col items-center gap-8 px-8 py-12 bg-white shadow-sm border border-zinc-200 rounded-2xl dark:bg-zinc-950 dark:border-zinc-800">

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Welcome, {user?.firstName || "User"}
          </h1>
        </div>

        <div className="w-full flex flex-col gap-6">

          {/* Create Room */}
          <button
            onClick={handleCreate}
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-black px-5 font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 dark:bg-zinc-100 dark:text-black"
          >
            {isLoading ? "Generating..." : "Create New Room"}
          </button>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-zinc-100 dark:border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-xs text-zinc-400">
              OR JOIN EXISTING
            </span>
            <div className="flex-grow border-t border-zinc-100 dark:border-zinc-800"></div>
          </div>

          {/* Join Room */}
          <form onSubmit={handleJoin} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Room ID"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              required
            />

            <button
              type="submit"
              className="text-sm font-semibold text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              Join via ID →
            </button>
          </form>
        </div>

        <div className="pt-6 border-t border-zinc-50 dark:border-zinc-900 w-full text-center">
          <SignOutButton>
            <button className="text-xs text-zinc-400 hover:text-red-500">
              Sign Out
            </button>
          </SignOutButton>
        </div>

      </main>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { isLoaded, user } = useUser();
  const [roomNumber, setRoomNumber] = useState("");
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomNumber.trim()) {
      // Navigate to the specific room route
      router.push(`/room/${roomNumber}`);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-8 px-8 py-12 bg-white shadow-sm border border-zinc-200 rounded-2xl dark:bg-zinc-950 dark:border-zinc-800">
        
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Welcome back, {user?.firstName || "User"}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter a room number to get started.
          </p>
        </div>

        <form onSubmit={handleJoin} className="flex w-full flex-col gap-4">
          <input
            type="text"
            placeholder="Room Number (e.g. 101)"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-base outline-none transition-all focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
            required
          />
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-black px-5 font-medium text-white transition-opacity hover:opacity-90 dark:bg-zinc-100 dark:text-black"
          >
            Join Room
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 w-full text-center">
          <SignOutButton>
            <button className="text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </main>
    </div>
  );
}
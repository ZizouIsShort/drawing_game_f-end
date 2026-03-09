"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (hasSynced.current) return;

    hasSynced.current = true;

    const syncUser = async () => {
      const res = await fetch("/api/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          email: user.emailAddresses[0].emailAddress,
        }),
      });

      if (res.ok) {
        router.replace("/home");
      } else {
        console.error("Auth sync failed");
      }
    };

    syncUser();
  }, [isLoaded, user, router]);

  return null;
}

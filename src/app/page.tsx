"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatHistory } from "@/hooks/useChatHistory";
import PulseLoader from "react-spinners/PulseLoader";

export default function HomePage() {
  const router = useRouter();
  const { history, createNewChat, isLoaded } = useChatHistory();

  useEffect(() => {
    if (isLoaded) {
      if (history.length > 0) {
        router.replace(`/chat/${history[0].id}`);
      } else {
        const newChat = createNewChat();
        router.replace(`/chat/${newChat.id}`);
      }
    }
  }, [isLoaded, history, createNewChat, router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-900">
      <PulseLoader color="white" size={12} />
      <p className="mt-4">Loading your chats...</p>
    </div>
  );
}

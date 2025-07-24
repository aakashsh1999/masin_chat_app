"use client";

import React from "react";
import { useChat } from "@/context/ChatProvider";
import {
  PlusIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

export default function Sidebar() {
  const {
    history,
    createNewChat,
    deleteChat,
    currentChatId,
    isLoaded: isChatContextLoaded,
  } = useChat();

  const router = useRouter();
  const params = useParams();
  const urlActiveChatId = params.id as string | undefined;

  const handleNewChat = () => {
    const newChat = createNewChat();
    router.push(`/chat/${newChat.id}`);
  };

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat?")) {
      deleteChat(chatId);
      if (urlActiveChatId === chatId) {
        router.push("/");
      }
    }
  };

  if (!isChatContextLoaded) {
    return (
      <div className="w-80 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl flex flex-col justify-center items-center">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <span className="text-gray-500 text-sm">Loading history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">Echo AI</h1>
            <p className="text-sm text-gray-500">Your AI Assistant</p>
          </div>
        </div>
        <button
          onClick={handleNewChat}
          className="flex items-center justify-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="font-medium">New Conversation</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="flex items-center gap-2 mb-4">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-600">Recent Chats</h2>
        </div>

        {history.length > 0 ? (
          <div className="space-y-2">
            {history.map((chat, index) => (
              <div
                key={chat.id}
                className="slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`group flex justify-between items-center w-full text-left p-3 rounded-xl text-sm transition-all duration-200 ${
                    currentChatId === chat.id
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-md"
                      : "hover:bg-gray-50 hover:shadow-sm"
                  }`}
                >
                  <Link
                    href={`/chat/${chat.id}`}
                    className="flex-1 min-w-0 block"
                  >
                    <p
                      className={`truncate font-medium ${
                        currentChatId === chat.id
                          ? "text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      {chat.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {chat.messages.length} messages
                    </p>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (
                        window.confirm(
                          "Are you sure you want to delete this chat?"
                        )
                      ) {
                        handleDelete(e, chat.id);
                      }
                    }}
                    className="ml-2 p-2 rounded-lg opacity-60 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all duration-200 flex-shrink-0"
                    title="Delete chat"
                  >
                    <TrashIcon className="w-4 h-4 text-red-500 cursor-pointer" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No conversations yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Start a new chat to begin
            </p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="text-center"></div>
      </div>
    </div>
  );
}

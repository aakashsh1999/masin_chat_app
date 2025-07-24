"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChat } from "@/context/ChatProvider";
import type { Message } from "@/lib/types";
import SystemPrompt from "./SystemPrompt";
import UserPrompt from "./UserPrompt";
import { PaperAirplaneIcon, SparklesIcon } from "@heroicons/react/24/solid";

type ChatInterfaceProps = {
  chatId: string;
};

export default function ChatInterface({ chatId }: ChatInterfaceProps) {
  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    streamedResponse,
    setStreamedResponse,
    isStreaming,
    setIsStreaming,
    currentChatId,
    getChatById,
    isLoaded: isChatContextLoaded,
  } = useChat();

  const [input, setInput] = useState("");
  const chatLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId && (currentChatId !== chatId || !isChatContextLoaded)) {
      getChatById(chatId);
      setInput("");
      setStreamedResponse("");
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [
    chatId,
    currentChatId,
    getChatById,
    setMessages,
    setInput,
    setStreamedResponse,
    setIsLoading,
    setIsStreaming,
    isChatContextLoaded,
  ]);

  useEffect(() => {
    if (chatLogRef.current && (messages.length > 0 || isStreaming)) {
      chatLogRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, streamedResponse, isStreaming]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isStreaming) return;

    const newUserMessage: Message = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    setInput("");
    setIsLoading(true);
    setIsStreaming(true);
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      timeoutId = setTimeout(() => {
        const errorMessage: Message = {
          role: "model",
          content:
            "The server is taking too long to respond. Please check your connection or API key and try again.",
        };
        setStreamedResponse("");
        setIsLoading(false);
        setIsStreaming(false);
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }, 15000);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: [...messages, newUserMessage] }),
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let completeResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        completeResponse += chunk;
        setStreamedResponse((prev) => prev + chunk);
      }

      const finalModelMessage: Message = {
        role: "model",
        content: completeResponse,
      };
      setMessages((prevMessages) => [...prevMessages, finalModelMessage]);
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error("Error fetching chat response:", error);
      const errorMessage: Message = {
        role: "model",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamedResponse("");
    }
  };

  const displayMessages = messages;
  const isEmpty = displayMessages.length === 0;

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden bg-gradient-to-br from-blue-50/50 via-white/50 to-purple-50/50 backdrop-blur-sm">
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">Echo AI Assistant</h2>
            <p className="text-sm text-gray-500">
              {currentChatId
                ? `Chat ID: ${currentChatId.substring(0, 6)}...`
                : "Select or create a chat"}
            </p>
          </div>
        </div>
      </div>

      <div
        ref={chatLogRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6"
      >
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold gradient-text mb-3">
              Welcome to Echo AI
            </h3>
            <p className="text-gray-600 mb-8 max-w-md">
              I'm here to help you with questions, creative tasks,
              problem-solving, and more. What would you like to explore today?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              {[
                "✨ Help me brainstorm ideas",
                "📝 Write and edit content",
                "🔍 Research and analyze",
                "💡 Solve complex problems",
              ].map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-white/80"
                  onClick={() =>
                    setInput(suggestion.split(" ").slice(1).join(" "))
                  }
                >
                  <p className="text-sm text-gray-700">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {displayMessages.map((msg, index) =>
              msg.role === "user" ? (
                <UserPrompt
                  key={`${chatId}-user-${index}`}
                  chatPrompt={msg.content}
                />
              ) : (
                <SystemPrompt
                  key={`${chatId}-model-${index}`}
                  botMessage={msg.content}
                  isStreaming={
                    isStreaming &&
                    streamedResponse.length > 0 &&
                    msg.content === streamedResponse
                  }
                />
              )
            )}
            {isLoading && !isStreaming && (
              <div className="flex items-start w-full mb-6 fade-in">
                <div className="flex justify-center items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full mr-4 w-10 h-10 flex-shrink-0 shadow-lg">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div className="max-w-2xl bg-white/90 backdrop-blur-sm text-gray-800 px-6 py-4 rounded-2xl rounded-tl-md shadow-lg border border-white/20 message-bubble">
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
                    <span className="text-gray-500 text-sm">
                      Echo is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-xl border-t border-white/20 shadow-lg p-6 sticky bottom-0 z-10">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-4 max-w-4xl mx-auto"
        >
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here... (Press Enter to send)"
              className="w-full p-4 pr-12 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm transition-all duration-200 min-h-[56px] max-h-32"
              disabled={isLoading || isStreaming}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="absolute right-3 bottom-3 text-xs text-gray-400">
              {input.length}/2000
            </div>
          </div>
          <button
            type="submit"
            className={`p-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isLoading || isStreaming || !input.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            }`}
            disabled={isLoading || isStreaming || !input.trim()}
          >
            <PaperAirplaneIcon className="w-6 h-6 text-white" />
          </button>
        </form>
        <p className="text-xs text-gray-500 text-center mt-3">
          Echo AI can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
}

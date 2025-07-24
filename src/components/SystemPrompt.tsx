"use client";
import { useState, useEffect, useRef } from "react";
import { SparklesIcon } from "@heroicons/react/24/solid";

interface SystemPromptProps {
  botMessage: string;
  isStreaming?: boolean;
}

function SystemPrompt({ botMessage, isStreaming = false }: SystemPromptProps) {
  const [displayedMessage, setDisplayedMessage] = useState("");
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isStreaming) {
      setDisplayedMessage(botMessage);
    } else {
      // Only start the typing effect if botMessage has changed and is not empty
      if (botMessage) {
        setDisplayedMessage(""); // Reset the message for the new botMessage
        let index = 0;
        const interval = setInterval(() => {
          if (!isMounted.current) {
            clearInterval(interval);
            return;
          }
          // *** FIX IS HERE ***
          // Check if the character at the current index is defined
          if (index < botMessage.length) {
            setDisplayedMessage((prev) => prev + botMessage[index]);
            index++;
          } else {
            // If we've reached the end, clear the interval
            clearInterval(interval);
          }
        }, 20);

        return () => clearInterval(interval);
      } else {
        // If botMessage is empty and not streaming, reset displayedMessage
        setDisplayedMessage("");
      }
    }
  }, [botMessage, isStreaming]); // Dependency array is correct

  const isEmpty =
    botMessage === undefined || botMessage === null || botMessage === "";

  return (
    <div className="flex items-start w-full mb-6 fade-in">
      <div className="flex justify-center items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full mr-4 w-10 h-10 flex-shrink-0 shadow-lg">
        <SparklesIcon className="w-5 h-5" />
      </div>
      <div className="max-w-2xl bg-white/90 backdrop-blur-sm text-gray-800 px-6 py-4 rounded-2xl rounded-tl-md shadow-lg border border-white/20 message-bubble">
        {isEmpty && !isStreaming ? (
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
            <span className="text-gray-500 text-sm">Echo is thinking...</span>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed m-0">
              {isStreaming
                ? botMessage
                : displayedMessage?.replaceAll("undefined", "")}
              {isStreaming && (
                <span className="inline-block w-2 h-5 bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse ml-1 rounded-sm" />
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SystemPrompt;

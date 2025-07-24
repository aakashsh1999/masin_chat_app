"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useChatHistory } from "@/hooks/useChatHistory";
import { Chat, Message } from "@/lib/types";

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  streamedResponse: string;
  setStreamedResponse: React.Dispatch<React.SetStateAction<string>>;
  isStreaming: boolean;
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  currentChatId: string | null;
  setCurrentChatId: React.Dispatch<React.SetStateAction<string | null>>;
  history: Chat[];
  createNewChat: () => Chat;
  updateChat: (chatId: string, updatedMessages: Message[]) => Chat | undefined;
  deleteChat: (chatId: string) => Chat[];
  getChatById: (chatId: string) => Chat | undefined;
  isLoaded: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const {
    history: hookHistory,
    setHistory: setHookHistory,
    isLoaded: isHistoryLoaded,
    createNewChat: hookCreateNewChat,
    updateChat: hookUpdateChat,
    deleteChat: hookDeleteChat,
    getChatById: hookGetChatById,
  } = useChatHistory();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isHistoryLoaded) {
      let initialChatId: string | null = null;
      let initialMessages: Message[] = [];

      const storedChatId = localStorage.getItem("currentChatId");

      if (
        storedChatId &&
        hookHistory.some((chat) => chat.id === storedChatId)
      ) {
        const chat = hookGetChatById(storedChatId);
        if (chat) {
          initialChatId = chat.id;
          initialMessages = chat.messages;
        }
      }

      if (!initialChatId && hookHistory.length > 0) {
        const firstChat = hookHistory[0];
        initialChatId = firstChat.id;
        initialMessages = firstChat.messages;
      }

      if (!initialChatId && hookHistory.length === 0) {
        const newChat = hookCreateNewChat();
        initialChatId = newChat.id;
        initialMessages = newChat.messages;
      }

      setCurrentChatId(initialChatId);
      setMessages(initialMessages);
      setIsLoaded(true);
    }
  }, [isHistoryLoaded, hookHistory, hookGetChatById, hookCreateNewChat]);

  useEffect(() => {
    if (currentChatId !== null) {
      localStorage.setItem("currentChatId", currentChatId);
    } else {
      localStorage.removeItem("currentChatId");
    }
  }, [currentChatId]);

  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      hookUpdateChat(currentChatId, messages);
    }
  }, [messages, currentChatId, hookUpdateChat]);

  const handleCreateNewChat = () => {
    const newChat = hookCreateNewChat();
    setCurrentChatId(newChat.id);
    setMessages(newChat.messages);
    return newChat;
  };

  const handleDeleteChat = (chatId: string) => {
    const newHistory = hookDeleteChat(chatId);

    if (currentChatId === chatId) {
      let nextChatId: string | null = null;
      let nextMessages: Message[] = [];

      if (newHistory.length > 0) {
        const firstChat = newHistory[0];
        nextChatId = firstChat.id;
        nextMessages = firstChat.messages;
      } else {
        const newlyCreatedChat = hookCreateNewChat();
        nextChatId = newlyCreatedChat.id;
        nextMessages = newlyCreatedChat.messages;
      }

      setCurrentChatId(nextChatId);
      setMessages(nextMessages);
    }
  };

  const handleGetChatById = (chatId: string) => {
    const chat = hookGetChatById(chatId);
    if (chat) {
      setCurrentChatId(chat.id);
      setMessages(chat.messages);
    }
    return chat;
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        isLoading,
        setIsLoading,
        streamedResponse,
        setStreamedResponse,
        isStreaming,
        setIsStreaming,
        currentChatId,
        setCurrentChatId,
        history: hookHistory,
        createNewChat: handleCreateNewChat,
        updateChat: hookUpdateChat,
        deleteChat: handleDeleteChat,
        getChatById: handleGetChatById,
        isLoaded,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

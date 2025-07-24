import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Chat, Message } from "@/lib/types";

const CHAT_HISTORY_KEY = "chatHistory";

export const useChatHistory = () => {
  const [history, setHistory] = useState<Chat[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        setHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage", error);
      setHistory([]);
    }
    setIsLoaded(true);
  }, []);

  const saveHistoryToLocalStorage = useCallback((currentHistory: Chat[]) => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(currentHistory));
    } catch (error) {
      console.error("Failed to save chat history to localStorage", error);
    }
  }, []);

  const createNewChat = useCallback((): Chat => {
    const newChat: Chat = {
      id: uuidv4(),
      title: "New Chat",
      messages: [],
    };

    setHistory((prevHistory) => {
      const newHistory = [newChat, ...prevHistory];
      saveHistoryToLocalStorage(newHistory);
      return newHistory;
    });

    return newChat;
  }, [saveHistoryToLocalStorage]);

  const updateChat = useCallback(
    (chatId: string, updatedMessages: Message[]): Chat | undefined => {
      let updatedChat: Chat | undefined;
      setHistory((prevHistory) => {
        const chatExists = prevHistory.some((c) => c.id === chatId);
        if (!chatExists) {
          console.warn(`Chat with ID ${chatId} not found for update.`);
          return prevHistory;
        }

        const userMessage = updatedMessages.find((m) => m.role === "user");
        const newTitle = userMessage
          ? userMessage.content.substring(0, 35) +
            (userMessage.content.length > 35 ? "..." : "")
          : prevHistory.find((c) => c.id === chatId)?.title || "New Chat";

        updatedChat = {
          ...prevHistory.find((c) => c.id === chatId)!,
          messages: updatedMessages,
          title: newTitle,
        };

        const newHistory = prevHistory.map((c) =>
          c.id === chatId ? updatedChat! : c
        );
        saveHistoryToLocalStorage(newHistory);
        return newHistory;
      });
      return updatedChat;
    },
    [saveHistoryToLocalStorage]
  );

  const deleteChat = useCallback(
    (chatId: string): Chat[] => {
      let newHistory: Chat[] = [];
      setHistory((prevHistory) => {
        newHistory = prevHistory.filter((c) => c.id !== chatId);
        saveHistoryToLocalStorage(newHistory);
        return newHistory;
      });
      return newHistory;
    },
    [saveHistoryToLocalStorage]
  );

  const getChatById = useCallback(
    (chatId: string): Chat | undefined => {
      return history.find((c) => c.id === chatId);
    },
    [history]
  );

  return {
    history,
    setHistory,
    isLoaded,
    createNewChat,
    updateChat,
    getChatById,
    deleteChat,
    saveHistoryToLocalStorage,
  };
};

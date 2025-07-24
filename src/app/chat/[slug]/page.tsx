"use client"; // Keep this if ChatInterface requires it or if this page has client-side effects

// Adjust the import path if necessary based on your project structure
import ChatInterface from "../../../components/ChatInterface";

interface ChatPageParams {
  id: string; // This matches the [id] in your folder structure
}

// Define the props for your page component
interface ChatPageProps {
  params: ChatPageParams;
}

export default function ChatPage({ params }: ChatPageProps) {
  // Access the dynamic segment using params.id
  const chatId = params.id;

  return <ChatInterface chatId={chatId} />;
}

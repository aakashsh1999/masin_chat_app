import ChatInterface from "../../../components/ChatInterface";

export default function ChatPage({ params }: { params: { slug: string } }) {
  return <ChatInterface chatId={params.slug} />;
}

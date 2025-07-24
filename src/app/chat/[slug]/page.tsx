import ChatInterface from "../../../components/ChatInterface";
type ChatPageProps = {
  params: {
    id: string;
  };
};

export default function ChatPage({ params }: ChatPageProps) {
  return <ChatInterface chatId={params.id} />;
}

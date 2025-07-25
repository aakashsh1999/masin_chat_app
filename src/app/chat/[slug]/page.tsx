import ChatInterface from "../../../components/ChatInterface";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // Use await in Server Components

  return <ChatInterface chatId={slug} />;
}

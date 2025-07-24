import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { ChatProvider } from "@/context/ChatProvider";
import "../../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Chatbot",
  description: "An AI Chatbot with local storage history",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ChatProvider>
          <div className="flex h-screen bg-gray-900 text-white">
            <Sidebar />
            <main className="flex-1 flex flex-col">{children}</main>
          </div>
        </ChatProvider>
      </body>
    </html>
  );
}

export interface Message {
  role: "user" | "model";
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

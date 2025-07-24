import { UserIcon } from "@heroicons/react/24/solid";

function UserPrompt({ chatPrompt }: { chatPrompt: string }) {
  console.log(chatPrompt, "sss");
  return (
    <div className="flex items-start w-full mb-6 justify-end fade-in">
      <div className="max-w-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-2xl rounded-tr-md shadow-lg message-bubble">
        <p className="whitespace-pre-wrap leading-relaxed">{chatPrompt}</p>
      </div>
      <div className="flex justify-center items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full ml-4 w-10 h-10 flex-shrink-0 shadow-lg">
        <UserIcon className="w-5 h-5" />
      </div>
    </div>
  );
}

export default UserPrompt;

import CustomSelect from "@/components/shared/custom-select";
import User1 from "@/public/assets/images/users/user1.png";
import User2 from "@/public/assets/images/users/user2.png";
import { MessageCircle, Send, Share2, Smile, Trash2 } from "lucide-react";
import Image, { StaticImageData } from "next/image";

interface Message {
  side: "in" | "out";
  author?: string;
  time: string;
  text: string;
  bold?: string;
  avatar?: StaticImageData;
  reactions?: boolean;
}

const messages: Message[] = [
  { side: "in", author: "Eleanor", time: "9 hours ago", text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.", avatar: User1, reactions: true },
  { side: "out", time: "8 hours ago", text: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.", reactions: true },
  { side: "in", author: "Eleanor", time: "6 hours ago", text: "When an unknown printer took a galley of type and scrambled it to make a type specimen book. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.", avatar: User2, reactions: true },
  { side: "out", time: "8 hours ago", text: "Lorem Ipsum has been the industry's standard dummy", reactions: true },
  { side: "in", author: "Eleanor", time: "8 hours ago", text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.", avatar: User1 },
  { side: "out", time: "1 hours ago", text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.", bold: "Thanks a lot..." },
];

const Reactions = ({ end }: { end?: boolean }) => (
  <div className={`flex items-center gap-3 mt-1 text-neutral-500 dark:text-neutral-400 ${end ? "justify-end" : ""}`}>
    <Smile className="w-4 h-4" /><Trash2 className="w-4 h-4" /><Share2 className="w-4 h-4" />
  </div>
);

const ChatProjectsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-600 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 bg-green-50 dark:bg-green-600/10 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold mb-0 text-base text-neutral-900 dark:text-white">Chat Projects User</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-xs font-normal">2025-11-10 09:15 AM</span>
          </div>
        </div>
        <CustomSelect placeholder="Jenny Wilson" options={["Jenny Wilson", "Darrell Steward"]} />
      </div>

      <div className="grow max-h-[720px] overflow-y-auto pr-1.5 flex flex-col">
        {messages.map((m, i) =>
          m.side === "in" ? (
            <div key={i} className="flex gap-2.5 mb-4">
              {m.avatar && <Image src={m.avatar} alt={m.author ?? ""} className="w-8 h-8 rounded-full shrink-0 object-cover" />}
              <div className="max-w-[80%]">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">{m.author}, {m.time}</span>
                <div className="bg-[#fef9e7] dark:bg-amber-600/10 rounded-xl rounded-tl-none px-3.5 py-2.5 text-sm text-neutral-700 dark:text-neutral-200">{m.text}</div>
                {m.reactions && <Reactions />}
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-2.5 justify-end mb-4">
              <div className="max-w-[80%]">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1 text-right">{m.time}</span>
                <div className="bg-neutral-100 dark:bg-neutral-700 rounded-xl rounded-tr-none px-3.5 py-2.5 text-sm text-neutral-700 dark:text-neutral-200">
                  {m.bold && <span className="font-semibold block mb-1">{m.bold}</span>}
                  {m.text}
                </div>
                {m.reactions && <Reactions end />}
              </div>
            </div>
          )
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <input type="text" className="bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white rounded-full px-5 py-3 text-sm w-full focus:outline-none" placeholder="Say Something..." />
        <button type="button" className="bg-primary hover:bg-primary/90 text-white rounded-full px-5 py-3 inline-flex items-center gap-2 text-sm font-medium shrink-0">
          Send <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatProjectsCard;

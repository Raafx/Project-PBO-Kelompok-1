import PmProgressRing from "@/components/charts/pm-progress-ring";
import Avatar1 from "@/public/assets/images/user-list/user-list1.png";
import Avatar10 from "@/public/assets/images/user-list/user-list10.png";
import Avatar2 from "@/public/assets/images/user-list/user-list2.png";
import Avatar3 from "@/public/assets/images/user-list/user-list3.png";
import Avatar4 from "@/public/assets/images/user-list/user-list4.png";
import Avatar5 from "@/public/assets/images/user-list/user-list5.png";
import Avatar6 from "@/public/assets/images/user-list/user-list6.png";
import Avatar7 from "@/public/assets/images/user-list/user-list7.png";
import Avatar8 from "@/public/assets/images/user-list/user-list8.png";
import Avatar9 from "@/public/assets/images/user-list/user-list9.png";
import CustomSelect from "@/components/shared/custom-select";
import { ArrowRight, Users } from "lucide-react";
import Image, { StaticImageData } from "next/image";

interface Member {
  name: string;
  role: string;
  avatar: StaticImageData;
  hours: string;
  value: number;
  color: string;
}

const members: Member[] = [
  { name: "Fülöp Kata", role: "Project Manager", avatar: Avatar1, hours: "120 hrs", value: 53, color: "#06b6d4" },
  { name: "Molnár Fruzsina", role: "Scrum Master", avatar: Avatar2, hours: "85 hrs", value: 73, color: "#f87171" },
  { name: "Molnár Fruzsina", role: "Team Leader", avatar: Avatar3, hours: "85 hrs", value: 20, color: "#f87171" },
  { name: "Molnár Fruzsina", role: "Software Developer", avatar: Avatar4, hours: "85 hrs", value: 53, color: "#06b6d4" },
  { name: "Molnár Fruzsina", role: "Software Tester", avatar: Avatar5, hours: "85 hrs", value: 73, color: "#8b5cf6" },
  { name: "Nagy Timea", role: "UI/UX Designer", avatar: Avatar6, hours: "96 hrs", value: 36, color: "#facc15" },
  { name: "Dudás Nikolett", role: "Software Tester", avatar: Avatar7, hours: "45 hrs", value: 92, color: "#22c55e" },
  { name: "Dudás Nikolett", role: "Software Development", avatar: Avatar8, hours: "74 hrs", value: 20, color: "#f87171" },
  { name: "Dudás Nikolett", role: "Software Developer", avatar: Avatar9, hours: "85 hrs", value: 53, color: "#06b6d4" },
  { name: "Dudás Nikolett", role: "Software Tester", avatar: Avatar10, hours: "45 hrs", value: 92, color: "#22c55e" },
  { name: "Dudás Nikolett", role: "Ethical Hacker", avatar: Avatar1, hours: "15 hrs", value: 73, color: "#8b5cf6" },
  { name: "Kiss Laura", role: "Ethical Hacker", avatar: Avatar2, hours: "97 hrs", value: 20, color: "#f87171" },
];

const TeamMembersCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 bg-sky-50 dark:bg-sky-600/10 text-sky-600 dark:text-sky-500 rounded-full flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold mb-0 text-base text-neutral-900 dark:text-white">Team Members</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-xs font-normal">Team member&apos;s task progress</span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month"]} />
      </div>

      <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg px-4 py-3 mb-2">
        <span className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold grow">Client</span>
        <span className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold w-[70px]">Hours</span>
        <span className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold w-[52px]">Status</span>
      </div>

      <div className="grow max-h-[705px] overflow-y-auto pr-1.5 divide-y divide-neutral-100 dark:divide-neutral-700">
        {members.map((m, i) => (
          <div key={i} className="flex items-center gap-3 py-2 px-2 rounded-[10px]">
            <div className="flex items-center gap-2.5 grow min-w-0">
              <Image src={m.avatar} alt={m.name} className="w-9 h-9 rounded-full shrink-0 object-cover" />
              <div className="min-w-0">
                <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white truncate">{m.name}</h2>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{m.role}</span>
              </div>
            </div>
            <span className="text-sm font-medium text-neutral-900 dark:text-white w-[70px]">{m.hours}</span>
            <div className="w-12 shrink-0 flex justify-center">
              <PmProgressRing value={m.value} color={m.color} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button type="button" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium">
          See All Members <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TeamMembersCard;

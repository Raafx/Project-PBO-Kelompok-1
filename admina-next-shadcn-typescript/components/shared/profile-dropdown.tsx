import Logout from "@/components/auth/logout";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import userImg from "@/public/assets/images/user.png";
import { ChevronDown, Mail, Settings, User } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

const ProfileDropdown = () => {
  const { data: session } = useSession();
  const name =
    session?.user?.image && session?.user?.name ? session.user.name : "Robert Fox";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 h-auto ps-1 pe-2 py-1 rounded-full hover:bg-gray-50 dark:hover:bg-slate-700 focus-visible:ring-0 cursor-pointer data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-slate-600"
          )}
        >
          <Image
            src={session?.user?.image ?? userImg}
            className="rounded-full w-9 h-9 object-cover shrink-0"
            width={36}
            height={36}
            alt={name}
          />
          <span className="hidden sm:flex flex-col items-start leading-tight text-start">
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
              {name}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-300">Admin</span>
          </span>
          <ChevronDown className="hidden sm:block w-4 h-4 text-neutral-500 dark:text-neutral-300 shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="sm:w-[300px] min-w-[250px] right-[40px] absolute p-4 rounded-2xl overflow-hidden shadow-lg"
        side="bottom"
        align="end"
      >
        <div className="py-3 px-4 rounded-lg bg-primary/10 dark:bg-primar flex items-center justify-between">
          <div>
            <h6 className="text-lg text-neutral-900 dark:text-white font-semibold mb-0">
              {name}
            </h6>
            <span className="text-sm text-neutral-500 dark:text-neutral-300">
              Admin
            </span>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto scroll-sm pt-4">
          <ul className="flex flex-col gap-3">
            <li>
              <Link
                href="/view-profile"
                className="text-black dark:text-white hover:text-primary dark:hover:text-primary flex items-center gap-3"
              >
                <User className="w-5 h-5" /> My Profile
              </Link>
            </li>
            <li>
              <Link
                href="/email"
                className="text-black dark:text-white hover:text-primary dark:hover:text-primary flex items-center gap-3"
              >
                <Mail className="w-5 h-5" /> Inbox
              </Link>
            </li>
            <li>
              <Link
                href="/company"
                className="text-black dark:text-white hover:text-primary dark:hover:text-primary flex items-center gap-3"
              >
                <Settings className="w-5 h-5" /> Settings
              </Link>
            </li>
            <li>
              <Logout />
            </li>
          </ul>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;

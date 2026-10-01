"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";

interface CardDropdownProps {
  /** Tailwind classes for the trigger icon color (defaults to neutral). */
  triggerClassName?: string;
}

/**
 * The recurring "three-dot" View / Edit / Delete menu used across the
 * dashboard cards.
 */
const CardDropdown = ({ triggerClassName }: CardDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open card menu"
        className={
          triggerClassName ??
          "text-neutral-400 hover:text-neutral-600 dark:hover:text-white outline-none"
        }
      >
        <MoreVertical className="w-5 h-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem className="cursor-pointer">
          <Eye className="w-4 h-4" /> View
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Pencil className="w-4 h-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
          <Trash2 className="w-4 h-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CardDropdown;

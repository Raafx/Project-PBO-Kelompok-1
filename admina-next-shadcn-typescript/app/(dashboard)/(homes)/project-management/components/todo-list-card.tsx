"use client";

import CustomSelect from "@/components/shared/custom-select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, ListChecks } from "lucide-react";
import { useState } from "react";
import CardDropdown from "@/components/shared/card-dropdown";

type Status = "Cancelled" | "Completed" | "In Progress" | "Pending";

interface Todo {
  id: string;
  task: string;
  assignee: string;
  priority: string;
  due: string;
  status: Status;
}

const statusClass: Record<Status, string> = {
  Cancelled: "border-red-200 dark:border-red-600/20 text-red-600 dark:text-red-500",
  Completed: "border-green-200 dark:border-green-600/20 text-green-600 dark:text-green-500",
  "In Progress": "border-amber-200 dark:border-amber-600/20 text-amber-600 dark:text-amber-500",
  Pending: "border-primary/20 text-primary",
};

const todos: Todo[] = [
  { id: "#546", task: "Hotel management system", assignee: "Devon Lane", priority: "High", due: "12/08/26", status: "Cancelled" },
  { id: "#435", task: "Python upgrade", assignee: "Kristin Watson", priority: "Medium", due: "12/08/26", status: "Completed" },
  { id: "#324", task: "Schedule meeting with Fila", assignee: "Dianne Russell", priority: "Low", due: "12/08/26", status: "Cancelled" },
  { id: "#456", task: "Next JS upgrade", assignee: "Robert Fox", priority: "High", due: "12/08/26", status: "In Progress" },
  { id: "#213", task: "Send proposal to APR Ltd", assignee: "Jerome Bell", priority: "Medium", due: "12/08/26", status: "Pending" },
];

const checkboxClass = "w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-[#487fff] focus:ring-0 cursor-pointer";

const TodoListCard = () => {
  const [checked, setChecked] = useState<boolean[]>(() => todos.map(() => false));
  const allChecked = checked.every(Boolean);

  const toggleAll = (val: boolean) => setChecked(todos.map(() => val));
  const toggleOne = (i: number, val: boolean) =>
    setChecked((prev) => prev.map((c, idx) => (idx === i ? val : c)));

  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-full flex items-center justify-center shrink-0">
            <ListChecks className="text-red-600 dark:text-red-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">To Do List</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Organize tasks efficiently with this handy to-do list.</span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="py-4 px-5 w-5">
                <input type="checkbox" className={checkboxClass} checked={allChecked} onChange={(e) => toggleAll(e.target.checked)} aria-label="Select all" />
              </TableHead>
              {["Task ID", "Task Description | Assigned To", "Priority | Due Date", "Status", "Action"].map((col) => (
                <TableHead key={col} className="text-neutral-500 dark:text-neutral-400 text-sm font-semibold py-4 px-5 text-left whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">{col}<ArrowUpDown className="w-3.5 h-3.5" /></span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {todos.map((t, i) => (
              <TableRow key={t.id} className="border-0 hover:bg-neutral-50 dark:hover:bg-slate-700">
                <TableCell className="py-3 px-5">
                  <input type="checkbox" className={checkboxClass} checked={checked[i]} onChange={(e) => toggleOne(i, e.target.checked)} aria-label={`Select ${t.task}`} />
                </TableCell>
                <TableCell className="py-3 px-5 text-sm font-medium text-neutral-900 dark:text-white">{t.id}</TableCell>
                <TableCell className="py-3 px-5">
                  <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{t.task}</h2>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{t.assignee}</span>
                </TableCell>
                <TableCell className="py-3 px-5">
                  <span className="block text-sm font-semibold text-neutral-900 dark:text-white leading-none mb-1">{t.priority}</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{t.due}</span>
                </TableCell>
                <TableCell className="py-3 px-5">
                  <span className={`inline-flex rounded-full border px-4 py-1.5 font-medium text-sm ${statusClass[t.status]}`}>{t.status}</span>
                </TableCell>
                <TableCell className="py-3 px-5"><CardDropdown /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TodoListCard;

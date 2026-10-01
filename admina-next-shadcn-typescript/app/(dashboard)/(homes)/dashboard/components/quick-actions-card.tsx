import { BarChart3, FileText, Mail, PlusCircle, Tag, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

interface QuickAction {
  label: string;
  icon: LucideIcon;
}

const actions: QuickAction[] = [
  { label: "Add Product", icon: PlusCircle },
  { label: "Create Discount", icon: Tag },
  { label: "Generate Invoice", icon: FileText },
  { label: "Send Email", icon: Mail },
  { label: "View Reports", icon: BarChart3 },
];

const QuickActionsCard = () => {
  return (
    <div className="p-6 rounded-[20px] mb-6 bg-primary">
      <div className="flex items-start justify-between gap-2 pb-5 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white/15">
            <Zap className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-white">Quick Actions</h2>
            <span className="text-sm font-normal text-white/75">Create products, coupons, &amp; invoices quickly.</span>
          </div>
        </div>
        <CardDropdown triggerClassName="text-white/75 hover:text-white outline-none" />
      </div>

      <div className="flex flex-col gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              className="flex items-center justify-center gap-2.5 py-2 px-5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-base transition"
            >
              <Icon className="w-5 h-5" />
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsCard;

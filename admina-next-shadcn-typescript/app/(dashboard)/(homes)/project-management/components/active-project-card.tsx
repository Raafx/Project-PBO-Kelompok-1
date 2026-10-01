import CustomSelect from "@/components/shared/custom-select";
import { Clock, FileText, Flower, Sparkles } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

interface Step {
  n: string;
  label: string;
  percent: string;
  color: string;
  labelTop: boolean;
}

const steps: Step[] = [
  { n: "1st Step", label: "Planning", percent: "0%", color: "#008198", labelTop: true },
  { n: "2nd Step", label: "Design", percent: "25%", color: "#ca8a04", labelTop: false },
  { n: "3rd Step", label: "Development", percent: "50%", color: "#188A42", labelTop: true },
  { n: "4th Step", label: "Testing", percent: "75%", color: "#AC534D", labelTop: false },
  { n: "5th Step", label: "Launch", percent: "100%", color: "", labelTop: true },
];

const Label = ({ step }: { step: Step }) => (
  <div className="text-center">
    <span className="inline-block shadow-[0_4px_14px_rgba(17,24,39,0.08)] rounded-full px-4 py-1.5 text-xs font-medium text-primary mb-2 bg-white dark:bg-[#273142]">{step.n}</span>
    <h2 className="text-[15px] font-semibold m-0 text-neutral-900 dark:text-white">{step.label}</h2>
  </div>
);

const Circle = ({ step }: { step: Step }) => (
  <span
    className={`w-[72px] h-[72px] rounded-full flex items-center justify-center text-white font-bold text-[17px] ${step.color ? "" : "bg-primary"}`}
    style={step.color ? { background: step.color } : undefined}
  >
    {step.percent}
  </span>
);

const ActiveProjectCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px]">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-600/10 border border-sky-200 dark:border-sky-600/20 rounded-full flex items-center justify-center shrink-0">
            <FileText className="text-sky-600 dark:text-sky-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Active Project</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">
              This project is currently in progress, focusing on innovative solutions and collaboration to achieve our goals efficiently.
            </span>
          </div>
        </div>
        <CustomSelect placeholder="Project 01" options={["Project 01", "Project 02", "Project 03"]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="bg-green-50 dark:bg-green-600/10 rounded-2xl p-5 h-full">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 bg-black text-white rounded-full flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5" /></span>
              <div>
                <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal block">Project Alpho</span>
                <h2 className="text-xl font-bold mb-0 text-neutral-500 dark:text-neutral-400">Client: <span className="text-neutral-900 dark:text-white">Shawn Kennedy</span></h2>
              </div>
            </div>
            <CardDropdown />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Clock className="text-primary w-4 h-4" />
            <span className="text-primary font-semibold text-sm">10:30 AM</span>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">In 15 Feb, 2026</span>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-600/10 rounded-2xl p-5 h-full">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 bg-black text-white rounded-full flex items-center justify-center shrink-0"><Flower className="w-5 h-5" /></span>
              <div>
                <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal block">Assigned To</span>
                <h2 className="text-xl font-bold mb-0 text-neutral-900 dark:text-white">Vaxo Corporation</h2>
              </div>
            </div>
            <CardDropdown />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Clock className="text-primary w-4 h-4" />
            <span className="text-primary font-semibold text-sm">05:17 PM</span>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">In 21 Mar, 2026</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-primary/10 rounded-2xl p-6">
        <div className="relative py-2">
          <div className="absolute left-[10%] right-[10%] top-1/2 h-[3px] bg-neutral-300 dark:bg-neutral-600 rounded-full -translate-y-1/2 z-[1]">
            <div className="absolute left-0 top-0 h-full bg-primary rounded-full w-1/4" />
          </div>
          <div className="relative z-[2] grid grid-cols-2 md:grid-cols-5 gap-y-4 md:gap-y-0">
            {steps.map((step, i) => (
              <div key={i} className="grid grid-rows-[1fr_auto_1fr] justify-items-center items-center gap-y-4">
                {step.labelTop ? <Label step={step} /> : <Circle step={step} />}
                <span className="w-3 h-3 rounded-full bg-primary border-2 border-white shadow-[0_0_0_3px_rgba(99,102,241,0.15)]" />
                {step.labelTop ? <Circle step={step} /> : <Label step={step} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-5 flex-wrap">
        <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Project Total Hours : <span className="text-primary font-bold">384 hrs</span></span>
        <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Project Hours Left : <span className="text-primary font-bold">144 hrs</span></span>
      </div>
    </div>
  );
};

export default ActiveProjectCard;

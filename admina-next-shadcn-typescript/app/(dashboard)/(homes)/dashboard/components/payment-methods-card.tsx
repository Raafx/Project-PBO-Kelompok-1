import EcommercePaymentMethodsChart from "@/components/charts/ecommerce-payment-methods-chart";
import CustomSelect from "@/components/shared/custom-select";
import { CreditCard } from "lucide-react";

const PaymentMethodsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px]">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 border-b border-neutral-200 dark:border-neutral-600 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-600/10 border border-amber-200 dark:border-amber-600/20 rounded-full flex items-center justify-center shrink-0">
            <CreditCard className="text-amber-600 dark:text-amber-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Payment Methods</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Customer most used payment options</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>
      <EcommercePaymentMethodsChart />
    </div>
  );
};

export default PaymentMethodsCard;

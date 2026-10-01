const ImpressionsClicksCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px]">
      <div className="flex gap-1 w-full">
        <div className="grow">
          <span className="text-neutral-500 dark:text-neutral-400 text-base font-medium block mb-3">Impressions</span>
          <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">48.7%</h2>
          <div className="h-3 w-full rounded-s-full" style={{ backgroundColor: "#00B8D9" }} />
          <span className="text-neutral-500 dark:text-neutral-400 text-base font-normal block mt-2">12,547</span>
        </div>
        <div className="grow">
          <span className="text-neutral-500 dark:text-neutral-400 text-base font-medium block mb-3">Clicks</span>
          <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">62.7%</h2>
          <div className="h-3 w-full rounded-e-full" style={{ backgroundColor: "#FDC70F" }} />
          <span className="text-neutral-500 dark:text-neutral-400 text-base font-normal block mt-2">25,478</span>
        </div>
      </div>
    </div>
  );
};

export default ImpressionsClicksCard;

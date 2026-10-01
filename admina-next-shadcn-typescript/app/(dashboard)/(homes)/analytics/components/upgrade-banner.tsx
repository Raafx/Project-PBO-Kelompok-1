import HeroBg from "@/public/assets/images/homes/dashboard-two-bg-img.png";
import HeroImg from "@/public/assets/images/homes/dashboard-two-img1.png";
import Image from "next/image";


const UpgradeBanner = () => {
  return (
 <div
      className="bg-cover bg-center bg-no-repeat py-10 rounded-2xl ps-6 lg:ps-[60px] pe-6 flex items-center h-full"
      style={{ backgroundImage: `url(${HeroBg.src})` }}
    >
      <div className="flex items-center justify-between gap-4 md:flex-nowrap flex-wrap w-full">
        <div className="max-w-[440px] w-full">
          <span className="inline-block py-1 px-3 bg-white/15 text-white font-semibold text-lg mb-2 rounded">
            Get Full Access For Upgrade
          </span>
          <h2 className="text-2xl font-semibold text-white mb-5 mt-4">
            <span className="text-amber-300 italic underline">Upgrade</span> to Premium
          </h2>
          <p className="font-normal text-sm text-white mb-10">
            Your free trial expired in just 7 days, and we truly hope you enjoyed exploring our amazing features!
          </p>
          <button
            type="button"
            className="inline-block py-3 px-6 bg-white rounded-full text-primary font-semibold"
          >
            Upgrade Now
          </button>
        </div>
          <div className="text-center hidden lg:block shrink-0">
          <Image src={HeroImg} alt="NFT showcase" className="h-auto w-auto" />
        </div>
      </div>
    </div>
  );
};

export default UpgradeBanner;

import HeroImg from "@/public/assets/images/homes/nft-card-img.png";
import HeroBg from "@/public/assets/images/homes/nft-card-bg.png";
import Image from "next/image";

const NftHeroCard = () => {
  return (
    <div
      className="bg-cover bg-center bg-no-repeat py-10 rounded-2xl ps-6 lg:ps-[60px] pe-6 flex items-center h-full"
      style={{ backgroundImage: `url(${HeroBg.src})` }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap md:flex-nowrap">
        <div className="max-w-[440px] w-full">
          <span
            className="inline-block text-white font-semibold text-sm mb-2 px-3 py-1 rounded"
            style={{ background: "linear-gradient(90deg,#0e5d43,#1a7d5a)" }}
          >
            Discover, Collect, Sell and Create NFTs.
          </span>
          <h2 className="text-4xl font-semibold text-white mb-5 mt-2">
            <span className="text-amber-500 italic underline">Create</span> &amp;{" "}
            <span className="text-amber-500 italic underline">Sell</span> NFTs
          </h2>
          <p className="font-normal text-sm text-white mb-10">
            The world&apos;s first and largest digital marketplace, you need to be sure there isn&apos;t anything.
          </p>
          <div className="flex items-center gap-2">
            <button type="button" className="py-3 px-6 bg-white rounded-full text-red-700 font-semibold">
              Discover Now
            </button>
            <button type="button" className="py-3 px-6 bg-white rounded-full text-green-700 font-semibold">
              Create NFT
            </button>
          </div>
        </div>
        <div className="text-center hidden lg:block shrink-0">
          <Image src={HeroImg} alt="NFT showcase" className="h-auto w-auto" />
        </div>
      </div>
    </div>
  );
};

export default NftHeroCard;

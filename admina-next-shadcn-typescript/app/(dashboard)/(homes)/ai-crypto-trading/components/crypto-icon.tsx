interface CryptoIconProps {
  symbol: string;
  size?: number;
}

/**
 * Colored monogram badge standing in for the template's iconify crypto logos
 * (cryptocurrency-color:* / token:*), which aren't bundled in this project.
 */
const COLORS: Record<string, string> = {
  BTC: "#f7931a",
  ETH: "#627eea",
  USDT: "#26a17b",
  ADA: "#0033ad",
  BNB: "#f3ba2f",
  SOL: "#14f195",
  XRP: "#23292f",
  DOT: "#e6007a",
  AVAX: "#e84142",
  UNI: "#ff007a",
  LTC: "#345d9d",
};

const CryptoIcon = ({ symbol, size = 40 }: CryptoIconProps) => {
  const color = COLORS[symbol] ?? "#6366f1";
  return (
    <span
      className="rounded-full flex items-center justify-center shrink-0 text-white font-bold"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.3 }}
    >
      {symbol.slice(0, 3)}
    </span>
  );
};

export default CryptoIcon;

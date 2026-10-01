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
  SOL: "#14f195",
  AVAX: "#e84142",
  LINK: "#2a5ada",
  BNB: "#f3ba2f",
  ADA: "#0033ad",
  XRP: "#23292f",
  DOT: "#e6007a",
};

const CryptoIcon = ({ symbol, size = 40 }: CryptoIconProps) => {
  const color = COLORS[symbol] ?? "#6366f1";
  return (
    <span
      className="rounded-full flex items-center justify-center shrink-0 text-white font-bold"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.32 }}
    >
      {symbol.slice(0, 3)}
    </span>
  );
};

export default CryptoIcon;

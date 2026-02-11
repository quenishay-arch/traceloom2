import { cn } from "@/lib/utils";

export default function RiskGauge({ score, size = "lg" }) {
  const getColor = (score) => {
    if (score >= 80) return { bg: "bg-emerald-500", text: "text-emerald-600", label: "Excellent" };
    if (score >= 60) return { bg: "bg-blue-500", text: "text-blue-600", label: "Good" };
    if (score >= 40) return { bg: "bg-amber-500", text: "text-amber-600", label: "Medium" };
    if (score >= 20) return { bg: "bg-orange-500", text: "text-orange-600", label: "At Risk" };
    return { bg: "bg-red-500", text: "text-red-600", label: "Critical" };
  };

  const { bg, text, label } = getColor(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36"
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl"
  };

  return (
    <div className="flex flex-col items-center">
      <div className={cn("relative", sizeClasses[size])}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn("transition-all duration-1000 ease-out", text)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", textSizes[size])}>{score}</span>
          {size === "lg" && <span className="text-xs text-slate-500 uppercase tracking-wider">Trust Score</span>}
        </div>
      </div>
      <span className={cn("mt-2 text-sm font-semibold", text)}>{label}</span>
    </div>
  );
}
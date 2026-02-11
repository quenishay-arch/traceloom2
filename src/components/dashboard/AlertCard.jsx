import { AlertTriangle, TrendingDown, CloudRain, Ship, Factory, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const iconMap = {
  delay_risk: TrendingDown,
  quality_issue: AlertTriangle,
  port_congestion: Ship,
  weather_risk: CloudRain,
  supplier_issue: Factory,
  inventory: Package,
};

const severityStyles = {
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "bg-blue-100 text-blue-600",
    badge: "bg-blue-100 text-blue-700"
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "bg-amber-100 text-amber-600",
    badge: "bg-amber-100 text-amber-700"
  },
  critical: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "bg-red-100 text-red-600",
    badge: "bg-red-100 text-red-700"
  }
};

export default function AlertCard({ alert, compact = false }) {
  const Icon = iconMap[alert.type] || AlertTriangle;
  const styles = severityStyles[alert.severity] || severityStyles.info;

  if (compact) {
    return (
      <div className={cn(
        "flex items-start gap-3 p-3 rounded-xl border transition-all hover:shadow-sm cursor-pointer",
        styles.bg, styles.border
      )}>
        <div className={cn("p-2 rounded-lg", styles.icon)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{alert.title}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{alert.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-4 rounded-2xl border transition-all hover:shadow-md",
      styles.bg, styles.border
    )}>
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-xl", styles.icon)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-800">{alert.title}</h4>
            <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", styles.badge)}>
              {alert.severity}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{alert.description}</p>
          {alert.suggested_action && (
            <div className="mt-3 p-2 bg-white/60 rounded-lg">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Suggested Action</p>
              <p className="text-sm text-slate-700">{alert.suggested_action}</p>
            </div>
          )}
          {alert.affected_pos?.length > 0 && (
            <div className="flex gap-2 mt-3">
              {alert.affected_pos.slice(0, 3).map((po, idx) => (
                <span key={idx} className="px-2 py-1 bg-white/80 rounded text-xs font-mono text-slate-600">
                  {po}
                </span>
              ))}
              {alert.affected_pos.length > 3 && (
                <span className="px-2 py-1 text-xs text-slate-500">+{alert.affected_pos.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-200/50 flex justify-between items-center">
        <span className="text-xs text-slate-400">
          {alert.created_date && format(new Date(alert.created_date), "MMM d, h:mm a")}
        </span>
      </div>
    </div>
  );
}
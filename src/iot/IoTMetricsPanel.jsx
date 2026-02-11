import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Activity, Thermometer, Droplets, Zap, WifiOff, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const iconMap = {
  production_rate: Activity,
  temperature: Thermometer,
  humidity: Droplets,
  machine_status: Zap,
  defect_detection: AlertTriangle,
};

const statusColors = {
  normal: "text-emerald-500",
  warning: "text-amber-500",
  critical: "text-red-500",
};

export default function IoTMetricsPanel({ poId }) {
  const [metrics, setMetrics] = useState([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!poId) return;

    // Initial load
    const loadMetrics = async () => {
      const data = await base44.entities.IoTData.filter({ po_id: poId }, "-timestamp", 10);
      setMetrics(data);
    };
    loadMetrics();

    // Real-time subscription
    const unsubscribe = base44.entities.IoTData.subscribe((event) => {
      if (event.data.po_id === poId) {
        setMetrics((prev) => {
          const updated = [event.data, ...prev.filter(m => m.id !== event.data.id)];
          return updated.slice(0, 10);
        });
      }
    });

    return unsubscribe;
  }, [poId]);

  const latestMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.metric_type] || new Date(metric.timestamp) > new Date(acc[metric.metric_type].timestamp)) {
      acc[metric.metric_type] = metric;
    }
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Live IoT Metrics</h3>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            isLive ? "bg-emerald-500" : "bg-slate-300"
          )} />
          <span className="text-xs text-slate-500">{isLive ? "Live" : "Offline"}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.values(latestMetrics).map((metric, index) => {
          const Icon = iconMap[metric.metric_type] || Activity;
          const StatusIcon = metric.status === "normal" ? CheckCircle : 
                           metric.status === "warning" ? AlertTriangle : 
                           WifiOff;

          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "p-4 rounded-xl border transition-all",
                metric.status === "normal" ? "bg-emerald-50/50 border-emerald-100" :
                metric.status === "warning" ? "bg-amber-50/50 border-amber-100" :
                "bg-red-50/50 border-red-100"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={cn("w-4 h-4", statusColors[metric.status])} />
                <StatusIcon className={cn("w-3 h-3", statusColors[metric.status])} />
              </div>
              <p className="text-xs text-slate-500 capitalize mb-1">
                {metric.metric_type.replace(/_/g, " ")}
              </p>
              <p className="text-xl font-bold text-slate-800">
                {metric.metric_value}
                <span className="text-xs font-normal text-slate-500 ml-1">
                  {metric.metric_unit}
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-1">{metric.location}</p>
            </motion.div>
          );
        })}
      </div>

      {metrics.length === 0 && (
        <div className="py-8 text-center text-slate-400">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No IoT data available</p>
        </div>
      )}
    </div>
  );
}
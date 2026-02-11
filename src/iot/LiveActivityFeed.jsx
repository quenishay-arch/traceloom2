import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Activity, Package, AlertTriangle, CheckCircle, Factory } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const eventIcons = {
  factory_machine: Factory,
  warehouse_sensor: Package,
  qa_scanner: CheckCircle,
  logistics_tracker: Activity,
};

const statusColors = {
  normal: "text-emerald-600",
  warning: "text-amber-600",
  critical: "text-red-600",
};

export default function LiveActivityFeed({ limit = 5 }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Load initial activities
    const loadActivities = async () => {
      const data = await base44.entities.IoTData.list("-timestamp", limit);
      setActivities(data);
    };
    loadActivities();

    // Subscribe to real-time updates
    const unsubscribe = base44.entities.IoTData.subscribe((event) => {
      if (event.type === "create" || event.type === "update") {
        setActivities((prev) => {
          const updated = [event.data, ...prev.filter(a => a.id !== event.data.id)];
          return updated.slice(0, limit);
        });
      }
    });

    return unsubscribe;
  }, [limit]);

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {activities.map((activity) => {
          const Icon = eventIcons[activity.source] || Activity;
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:shadow-sm transition-all"
            >
              <div className={cn(
                "p-2 rounded-lg",
                activity.status === "normal" ? "bg-emerald-50" :
                activity.status === "warning" ? "bg-amber-50" :
                "bg-red-50"
              )}>
                <Icon className={cn("w-4 h-4", statusColors[activity.status])} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 capitalize">
                  {activity.metric_type.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activity.location} • {activity.metric_value} {activity.metric_unit}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {activity.timestamp && formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
              {activity.status !== "normal" && (
                <AlertTriangle className={cn("w-4 h-4 mt-1", statusColors[activity.status])} />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
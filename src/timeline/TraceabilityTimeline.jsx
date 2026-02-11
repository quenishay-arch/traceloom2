import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, AlertCircle, ChevronDown, MapPin, Building2, Calendar, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const stageIcons = {
  yarn_sourcing: "🧶",
  knitting: "🧵",
  dyeing: "🎨",
  qa_check: "✅",
  packing: "📦",
  shipping: "🚢",
  delivered: "🏠"
};

const stageLabels = {
  yarn_sourcing: "Yarn Sourcing",
  knitting: "Knitting",
  dyeing: "Dyeing",
  qa_check: "QA Check",
  packing: "Packing",
  shipping: "Shipping",
  delivered: "Delivered"
};

export default function TraceabilityTimeline({ timeline, currentStatus }) {
  const [expandedStage, setExpandedStage] = useState(null);

  const stages = ["yarn_sourcing", "knitting", "dyeing", "qa_check", "packing", "shipping", "delivered"];
  const currentIndex = stages.indexOf(currentStatus);

  const getStageStatus = (stage, index) => {
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "pending";
  };

  const getTimelineItem = (stage) => {
    return timeline?.find(t => t.stage === stage) || {};
  };

  return (
    <div className="relative">
      {/* Connection Line */}
      <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-slate-200" />
      <div 
        className="absolute left-6 top-12 w-0.5 bg-gradient-to-b from-emerald-500 to-blue-500 transition-all duration-700"
        style={{ height: `${(currentIndex / (stages.length - 1)) * 100}%`, maxHeight: 'calc(100% - 96px)' }}
      />

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage, index);
          const item = getTimelineItem(stage);
          const isExpanded = expandedStage === stage;

          return (
            <motion.div
              key={stage}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div
                onClick={() => setExpandedStage(isExpanded ? null : stage)}
                className={cn(
                  "relative z-10 flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300",
                  status === "completed" && "bg-emerald-50/50 hover:bg-emerald-50",
                  status === "current" && "bg-blue-50 shadow-md shadow-blue-100",
                  status === "pending" && "bg-slate-50/50 hover:bg-slate-50"
                )}
              >
                {/* Status Icon */}
                <div className={cn(
                  "relative z-20 w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all",
                  status === "completed" && "bg-emerald-500 text-white shadow-lg shadow-emerald-200",
                  status === "current" && "bg-blue-500 text-white shadow-lg shadow-blue-200 animate-pulse",
                  status === "pending" && "bg-slate-200 text-slate-500"
                )}>
                  {status === "completed" ? <Check className="w-5 h-5" /> : stageIcons[stage]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={cn(
                        "font-semibold",
                        status === "completed" && "text-emerald-700",
                        status === "current" && "text-blue-700",
                        status === "pending" && "text-slate-400"
                      )}>
                        {stageLabels[stage]}
                      </h4>
                      {item.date && (
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(item.date), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.insight && status !== "pending" && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Insight
                        </span>
                      )}
                      <ChevronDown className={cn(
                        "w-4 h-4 text-slate-400 transition-transform",
                        isExpanded && "rotate-180"
                      )} />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mt-2">
                    {status === "current" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        <Clock className="w-3 h-3" />
                        In Progress
                      </span>
                    )}
                    {item.status === "delayed" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        Delayed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && status !== "pending" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-16 mt-2 overflow-hidden"
                  >
                    <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm space-y-3">
                      {item.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{item.location}</span>
                        </div>
                      )}
                      {item.supplier && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{item.supplier}</span>
                        </div>
                      )}
                      {item.insight && (
                        <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI Insight
                          </p>
                          <p className="text-sm text-amber-800">{item.insight}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
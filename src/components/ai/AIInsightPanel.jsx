import { useState } from "react";
import { Sparkles, Brain, AlertTriangle, TrendingUp, Lightbulb, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AIInsightPanel({ po, onGenerateInsight, isLoading }) {
  const [expanded, setExpanded] = useState(false);

  const riskFactors = [
    {
      label: "Delay Probability",
      value: `${po?.delay_probability || 0}%`,
      icon: TrendingUp,
      status: po?.delay_probability > 50 ? "warning" : "good"
    },
    {
      label: "Quality Risk",
      value: po?.qa_score ? `${100 - po.qa_score}%` : "N/A",
      icon: AlertTriangle,
      status: po?.qa_score < 95 ? "warning" : "good"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-xl shadow-lg shadow-purple-500/30">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI Intelligence</h3>
            <p className="text-xs text-slate-400">Powered by HK Observatory & shipping data</p>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {riskFactors.map((factor, index) => (
            <motion.div
              key={factor.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-3 rounded-xl",
                factor.status === "warning" ? "bg-amber-500/20" : "bg-emerald-500/20"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <factor.icon className={cn(
                  "w-4 h-4",
                  factor.status === "warning" ? "text-amber-400" : "text-emerald-400"
                )} />
                <span className="text-xs text-slate-400">{factor.label}</span>
              </div>
              <p className="text-xl font-bold">{factor.value}</p>
            </motion.div>
          ))}
        </div>

        {/* AI Insight */}
        {po?.ai_insight && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white/5 rounded-xl border border-white/10 mb-4"
          >
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
                  AI Explanation
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {po.ai_insight}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Generate Button */}
        <Button
          onClick={onGenerateInsight}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-purple-500/30"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing multi-source data...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Insight
            </>
          )}
        </Button>

        {/* Expand for more */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {expanded ? "Show less" : "View detailed analysis"}
          <ChevronRight className={cn("w-3 h-3 transition-transform", expanded && "rotate-90")} />
        </button>

        {/* Expanded Details */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 pt-4 border-t border-white/10 space-y-3"
          >
            <div className="text-xs text-slate-400 space-y-2">
              <div className="flex justify-between">
                <span>Historical Pattern Match</span>
                <span className="text-purple-400">87%</span>
              </div>
              <div className="flex justify-between">
                <span>Data Sources</span>
                <span className="text-white">HK Observatory, Port Stats, Factory IoT</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence Score</span>
                <span className="text-cyan-400">High</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft, Package, Calendar, MapPin, Factory, Ship,
  AlertTriangle, CheckCircle, Clock, RefreshCw, Share2, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import TraceabilityTimeline from "@/components/timeline/TraceabilityTimeline";
import SupplyChainMap from "@/components/map/SupplyChainMap";
import AIInsightPanel from "@/components/ai/AIInsightPanel";
import TrustSummary from "@/components/trust/TrustSummary";
import DataSourcesBadge from "@/components/dashboard/DataSourcesBadge";
import IoTMetricsPanel from "@/components/iot/IoTMetricsPanel";
import ProductionMonitor from "@/components/iot/ProductionMonitor";

const statusConfig = {
  yarn_sourcing: { label: "Yarn Sourcing", color: "bg-purple-100 text-purple-700" },
  knitting: { label: "Knitting", color: "bg-blue-100 text-blue-700" },
  dyeing: { label: "Dyeing", color: "bg-indigo-100 text-indigo-700" },
  qa_check: { label: "QA Check", color: "bg-cyan-100 text-cyan-700" },
  packing: { label: "Packing", color: "bg-amber-100 text-amber-700" },
  shipping: { label: "Shipping", color: "bg-emerald-100 text-emerald-700" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700" },
};

export default function PODetail() {
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const poId = urlParams.get("id");

  const queryClient = useQueryClient();

  const { data: po, isLoading } = useQuery({
    queryKey: ["purchaseOrder", poId],
    queryFn: async () => {
      const pos = await base44.entities.PurchaseOrder.list();
      return pos.find(p => p.id === poId);
    },
    enabled: !!poId,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.PurchaseOrder.update(poId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchaseOrder", poId] }),
  });

  const handleGenerateInsight = async () => {
    if (!po) return;
    
    setIsGeneratingInsight(true);
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI supply chain analyst with access to multiple data sources including Hong Kong Observatory weather data, Hong Kong shipping statistics (port congestion, dwell times), factory production logs, and logistics tracking.

Analyze this purchase order and provide a detailed, data-driven insight:

PO Number: ${po.po_number}
Product: ${po.product_name}
Current Status: ${po.status}
Risk Score: ${po.risk_score || 0}
Delay Probability: ${po.delay_probability || 0}%
Estimated Delay: ${po.estimated_delay_days || 0} days
Yarn Supplier: ${po.yarn_supplier || "Unknown"}
QA Score: ${po.qa_score || "N/A"}%
Shipment Vessel: ${po.shipment_vessel || "Not assigned"}

Consider these contextual factors:
- Weather conditions from HK Observatory (typhoons, severe weather warnings)
- Port congestion levels from HK shipping statistics vs. baseline norms
- Historical production times for this supplier/factory
- Geospatial routing and distance analysis

Provide a 2-3 sentence explanation mentioning specific data sources (e.g., "Based on HK Observatory data..." or "Port statistics show...") and actionable insights about risks.`,
      response_json_schema: {
        type: "object",
        properties: {
          insight: { type: "string" },
          risk_factors: { type: "array", items: { type: "string" } }
        }
      }
    });

    updateMutation.mutate({ ai_insight: response.insight });
    setIsGeneratingInsight(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto" />
          <p className="text-slate-500 mt-2">Loading PO details...</p>
        </div>
      </div>
    );
  }

  if (!po) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Purchase order not found</p>
          <Link to={createPageUrl("PurchaseOrders")}>
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Purchase Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const trustScore = 100 - (po.risk_score || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <Link to={createPageUrl("PurchaseOrders")}>
              <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-slate-500 hover:text-slate-700">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Purchase Orders
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {po.po_number}
              </h1>
              <Badge className={cn("text-sm", statusConfig[po.status]?.color)}>
                {statusConfig[po.status]?.label}
              </Badge>
            </div>
            <p className="text-slate-500 mt-1">{po.product_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 border border-slate-100"
          >
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Expected Delivery</span>
            </div>
            <p className="font-semibold text-slate-800">
              {po.expected_delivery ? format(new Date(po.expected_delivery), "MMM d, yyyy") : "TBD"}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 border border-slate-100"
          >
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Factory className="w-4 h-4" />
              <span className="text-xs font-medium">Supplier</span>
            </div>
            <p className="font-semibold text-slate-800 truncate">
              {po.yarn_supplier || "Not assigned"}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 border border-slate-100"
          >
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Package className="w-4 h-4" />
              <span className="text-xs font-medium">Quantity</span>
            </div>
            <p className="font-semibold text-slate-800">
              {po.quantity?.toLocaleString() || 0} units
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "rounded-xl p-4 border",
              po.estimated_delay_days > 0
                ? "bg-amber-50 border-amber-200"
                : "bg-emerald-50 border-emerald-200"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              {po.estimated_delay_days > 0 ? (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              )}
              <span className={cn(
                "text-xs font-medium",
                po.estimated_delay_days > 0 ? "text-amber-700" : "text-emerald-700"
              )}>
                Delay Status
              </span>
            </div>
            <p className={cn(
              "font-semibold",
              po.estimated_delay_days > 0 ? "text-amber-800" : "text-emerald-800"
            )}>
              {po.estimated_delay_days > 0
                ? `+${po.estimated_delay_days} days risk`
                : "On Track"}
            </p>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timeline & Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Production Monitor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <ProductionMonitor poId={po.id} />
            </motion.div>

            {/* Journey Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">Supply Chain Journey</h2>
                <p className="text-sm text-slate-500 mt-1">Real-time tracking across all stages</p>
              </div>
              <div className="h-[300px]">
                <SupplyChainMap currentStage={po.status} />
              </div>
            </motion.div>

            {/* Traceability Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-slate-800 mb-6">Traceability Timeline</h2>
              <TraceabilityTimeline
                timeline={po.timeline || []}
                currentStatus={po.status}
              />
            </motion.div>
          </div>

          {/* Right Column - AI & Trust */}
          <div className="space-y-6">
            {/* AI Intelligence Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <AIInsightPanel
                po={po}
                onGenerateInsight={handleGenerateInsight}
                isLoading={isGeneratingInsight}
              />
            </motion.div>

            {/* Trust Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <TrustSummary po={po} score={trustScore} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <DataSourcesBadge />
            </motion.div>

            {/* IoT Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <IoTMetricsPanel poId={po.id} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

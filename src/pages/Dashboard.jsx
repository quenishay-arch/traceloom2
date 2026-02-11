import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Package, TrendingUp, AlertTriangle, Clock,
  ChevronRight, RefreshCw, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/dashboard/StatsCard";
import POTable from "@/components/dashboard/POTable";
import AlertCard from "@/components/dashboard/AlertCard";
import RiskGauge from "@/components/dashboard/RiskGauge";
import { motion } from "framer-motion";
import LiveActivityFeed from "@/components/iot/LiveActivityFeed";

export default function Dashboard() {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: purchaseOrders = [], isLoading: loadingPOs, refetch: refetchPOs } = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: () => base44.entities.PurchaseOrder.list("-created_date", 100),
  });

  const { data: alerts = [], isLoading: loadingAlerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.Alert.list("-created_date", 10),
  });

  const stats = {
    activePOs: purchaseOrders.filter(po => po.status !== "delivered").length,
    delayedPOs: purchaseOrders.filter(po => po.estimated_delay_days > 0).length,
    delayRate: purchaseOrders.length > 0
      ? Math.round((purchaseOrders.filter(po => po.estimated_delay_days > 0).length / purchaseOrders.length) * 100)
      : 0,
    avgTrustScore: purchaseOrders.length > 0
      ? Math.round(purchaseOrders.reduce((acc, po) => acc + (100 - (po.risk_score || 0)), 0) / purchaseOrders.length)
      : 95
  };

  const filteredPOs = statusFilter === "all"
    ? purchaseOrders
    : purchaseOrders.filter(po =>
        statusFilter === "at_risk" ? po.risk_level === "high" || po.risk_level === "critical" : po.status === statusFilter
      );

  const criticalAlerts = alerts.filter(a => a.severity === "critical" || a.severity === "warning");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Control Tower
            </h1>
            <p className="text-slate-500 mt-1">Real-time supply chain intelligence</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchPOs()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Link to={createPageUrl("PurchaseOrders")}>
              <Button className="gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 shadow-lg shadow-purple-500/30">
                View All POs
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <StatsCard
              title="Active POs"
              value={stats.activePOs}
              subtitle="Currently in transit"
              icon={Package}
              color="blue"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatsCard
              title="Delayed POs"
              value={stats.delayedPOs}
              subtitle="Require attention"
              icon={Clock}
              color="amber"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatsCard
              title="Delay Rate"
              value={`${stats.delayRate}%`}
              subtitle="Last 30 days"
              icon={TrendingUp}
              trend={stats.delayRate < 30 ? "5% better than last month" : null}
              trendUp={stats.delayRate < 30}
              color={stats.delayRate > 30 ? "red" : "green"}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Trust Score</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.avgTrustScore}</p>
                  <p className="text-sm text-emerald-600 mt-1">Excellent</p>
                </div>
                <RiskGauge score={stats.avgTrustScore} size="sm" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PO Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-lg font-semibold text-slate-800">Purchase Orders</h2>
                  <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                    <TabsList className="bg-slate-100">
                      <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                      <TabsTrigger value="at_risk" className="text-xs">At Risk</TabsTrigger>
                      <TabsTrigger value="shipping" className="text-xs">Shipping</TabsTrigger>
                      <TabsTrigger value="knitting" className="text-xs">Production</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              {loadingPOs ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 text-slate-300 animate-spin mx-auto" />
                  <p className="text-sm text-slate-500 mt-2">Loading purchase orders...</p>
                </div>
              ) : filteredPOs.length > 0 ? (
                <POTable purchaseOrders={filteredPOs} />
              ) : (
                <div className="p-12 text-center">
                  <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500">No purchase orders found</p>
                  <Link to={createPageUrl("PurchaseOrders")}>
                    <Button variant="outline" size="sm" className="mt-4">
                      Add Purchase Order
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Alerts & Activity Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Live Activity */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Live Activity
                </h2>
              </div>
              <LiveActivityFeed limit={4} />
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Alerts
                </h2>
                {criticalAlerts.length > 0 && (
                  <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                    {criticalAlerts.length}
                  </span>
                )}
              </div>
              
              {loadingAlerts ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <AlertCard key={alert.id} alert={alert} compact />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-slate-500 text-sm">No alerts at this time</p>
                  <p className="text-xs text-slate-400 mt-1">All systems operational</p>
                </div>
              )}
              
              {alerts.length > 5 && (
                <Link to={createPageUrl("Alerts")}>
                  <Button variant="ghost" className="w-full mt-4 text-slate-600">
                    View all alerts
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

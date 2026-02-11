import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  Bell, Filter, RefreshCw, CheckCheck, X, AlertTriangle, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AlertCard from "@/components/dashboard/AlertCard";
import { motion } from "framer-motion";

export default function Alerts() {
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.Alert.list("-created_date", 100),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Alert.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "all") return true;
    if (filter === "unread") return !alert.is_read;
    return alert.severity === filter;
  });

  const unreadCount = alerts.filter(a => !a.is_read).length;
  const criticalCount = alerts.filter(a => a.severity === "critical").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Alerts</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-slate-500 mt-1">AI-powered exception detection & risk alerts</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Bell className="w-4 h-4" />
              <span className="text-xs font-medium">Total Alerts</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{alerts.length}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Critical</span>
            </div>
            <p className="text-2xl font-bold text-red-700">{criticalCount}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Info className="w-4 h-4" />
              <span className="text-xs font-medium">Unread</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{unreadCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-slate-100">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="critical">Critical</TabsTrigger>
              <TabsTrigger value="warning">Warning</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Alerts List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredAlerts.length > 0 ? (
          <div className="space-y-4">
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <AlertCard alert={alert} />
                {!alert.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markReadMutation.mutate(alert.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">All Clear!</h3>
            <p className="text-slate-500">No alerts match your current filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
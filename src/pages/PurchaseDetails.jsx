import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Plus, Search, Filter, Download, RefreshCw, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import POTable from "@/components/dashboard/POTable";
import { motion } from "framer-motion";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "yarn_sourcing", label: "Yarn Sourcing" },
  { value: "knitting", label: "Knitting" },
  { value: "dyeing", label: "Dyeing" },
  { value: "qa_check", label: "QA Check" },
  { value: "packing", label: "Packing" },
  { value: "shipping", label: "Shipping" },
  { value: "delivered", label: "Delivered" },
];

const riskOptions = [
  { value: "all", label: "All Risk Levels" },
  { value: "low", label: "Low Risk" },
  { value: "medium", label: "Medium Risk" },
  { value: "high", label: "High Risk" },
  { value: "critical", label: "Critical" },
];

export default function PurchaseOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [showNewPODialog, setShowNewPODialog] = useState(false);
  const [newPO, setNewPO] = useState({
    po_number: "",
    product_name: "",
    customer: "",
    quantity: 0,
    status: "yarn_sourcing",
    yarn_supplier: "",
    expected_delivery: "",
  });

  const queryClient = useQueryClient();

  const { data: purchaseOrders = [], isLoading, refetch } = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: () => base44.entities.PurchaseOrder.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PurchaseOrder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      setShowNewPODialog(false);
      setNewPO({
        po_number: "",
        product_name: "",
        customer: "",
        quantity: 0,
        status: "yarn_sourcing",
        yarn_supplier: "",
        expected_delivery: "",
      });
    },
  });

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesSearch = !searchQuery ||
      po.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.customer?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    const matchesRisk = riskFilter === "all" || po.risk_level === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const handleCreatePO = () => {
    const poData = {
      ...newPO,
      risk_score: Math.floor(Math.random() * 40) + 10,
      risk_level: "low",
      delay_probability: Math.floor(Math.random() * 30),
      esg_certified: true,
      organic_cotton: Math.random() > 0.5,
      timeline: [
        {
          stage: "yarn_sourcing",
          status: "in_progress",
          date: new Date().toISOString().split("T")[0],
          location: "Vietnam",
          supplier: newPO.yarn_supplier,
          insight: "Order placed with supplier"
        }
      ]
    };
    createMutation.mutate(poData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Purchase Orders
            </h1>
            <p className="text-slate-500 mt-1">{purchaseOrders.length} total orders</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Dialog open={showNewPODialog} onOpenChange={setShowNewPODialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 shadow-lg shadow-purple-500/30">
                  <Plus className="w-4 h-4" />
                  New PO
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Purchase Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>PO Number</Label>
                      <Input
                        placeholder="e.g. KT1024"
                        value={newPO.po_number}
                        onChange={(e) => setNewPO({ ...newPO, po_number: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={newPO.quantity}
                        onChange={(e) => setNewPO({ ...newPO, quantity: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Product Name</Label>
                    <Input
                      placeholder="e.g. Women's Knit Sweater"
                      value={newPO.product_name}
                      onChange={(e) => setNewPO({ ...newPO, product_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Customer</Label>
                    <Input
                      placeholder="Customer name"
                      value={newPO.customer}
                      onChange={(e) => setNewPO({ ...newPO, customer: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Yarn Supplier</Label>
                    <Input
                      placeholder="e.g. Vietnam Textile Co."
                      value={newPO.yarn_supplier}
                      onChange={(e) => setNewPO({ ...newPO, yarn_supplier: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Expected Delivery</Label>
                    <Input
                      type="date"
                      value={newPO.expected_delivery}
                      onChange={(e) => setNewPO({ ...newPO, expected_delivery: e.target.value })}
                    />
                  </div>
                  <Button
                    onClick={handleCreatePO}
                    className="w-full"
                    disabled={createMutation.isPending || !newPO.po_number || !newPO.product_name}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Purchase Order"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by PO number, product, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  {riskOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(statusFilter !== "all" || riskFilter !== "all" || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setRiskFilter("all");
                  }}
                  className="gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          {isLoading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-slate-300 animate-spin mx-auto" />
              <p className="text-sm text-slate-500 mt-2">Loading purchase orders...</p>
            </div>
          ) : filteredPOs.length > 0 ? (
            <POTable purchaseOrders={filteredPOs} />
          ) : (
            <div className="p-12 text-center">
              <Filter className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500">No purchase orders match your filters</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setRiskFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

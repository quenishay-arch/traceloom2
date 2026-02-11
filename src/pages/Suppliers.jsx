import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  Plus, Search, Factory, MapPin, Star, Package, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const typeConfig = {
  yarn: { label: "Yarn Supplier", color: "bg-purple-100 text-purple-700" },
  knitting: { label: "Knitting Factory", color: "bg-blue-100 text-blue-700" },
  dyeing: { label: "Dyeing Factory", color: "bg-indigo-100 text-indigo-700" },
  logistics: { label: "Logistics Partner", color: "bg-emerald-100 text-emerald-700" },
};

const esgColors = {
  A: "bg-emerald-100 text-emerald-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-red-100 text-red-700",
};

export default function Suppliers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    location: "",
    country: "",
    type: "yarn",
    reliability_score: 85,
    esg_rating: "B",
    avg_lead_time: 14,
  });

  const queryClient = useQueryClient();

  const { data: suppliers = [], isLoading, refetch } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => base44.entities.Supplier.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Supplier.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setShowNewDialog(false);
      setNewSupplier({
        name: "",
        location: "",
        country: "",
        type: "yarn",
        reliability_score: 85,
        esg_rating: "B",
        avg_lead_time: 14,
      });
    },
  });

  const filteredSuppliers = suppliers.filter((s) =>
    !searchQuery ||
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Suppliers</h1>
            <p className="text-slate-500 mt-1">Manage your supply chain partners</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 shadow-lg shadow-purple-500/30">
                  <Plus className="w-4 h-4" />
                  Add Supplier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Supplier Name</Label>
                    <Input
                      placeholder="e.g. Vietnam Textile Co."
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Location</Label>
                      <Input
                        placeholder="e.g. Ho Chi Minh City"
                        value={newSupplier.location}
                        onChange={(e) => setNewSupplier({ ...newSupplier, location: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Input
                        placeholder="e.g. Vietnam"
                        value={newSupplier.country}
                        onChange={(e) => setNewSupplier({ ...newSupplier, country: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={newSupplier.type}
                        onValueChange={(value) => setNewSupplier({ ...newSupplier, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yarn">Yarn Supplier</SelectItem>
                          <SelectItem value="knitting">Knitting Factory</SelectItem>
                          <SelectItem value="dyeing">Dyeing Factory</SelectItem>
                          <SelectItem value="logistics">Logistics Partner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>ESG Rating</Label>
                      <Select
                        value={newSupplier.esg_rating}
                        onValueChange={(value) => setNewSupplier({ ...newSupplier, esg_rating: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A - Excellent</SelectItem>
                          <SelectItem value="B">B - Good</SelectItem>
                          <SelectItem value="C">C - Average</SelectItem>
                          <SelectItem value="D">D - Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Average Lead Time (days)</Label>
                    <Input
                      type="number"
                      value={newSupplier.avg_lead_time}
                      onChange={(e) => setNewSupplier({ ...newSupplier, avg_lead_time: parseInt(e.target.value) })}
                    />
                  </div>
                  <Button
                    onClick={() => createMutation.mutate(newSupplier)}
                    className="w-full"
                    disabled={createMutation.isPending || !newSupplier.name}
                  >
                    {createMutation.isPending ? "Adding..." : "Add Supplier"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Suppliers Grid */}
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-slate-300 animate-spin mx-auto" />
            <p className="text-sm text-slate-500 mt-2">Loading suppliers...</p>
          </div>
        ) : filteredSuppliers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier, index) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Factory className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{supplier.name}</h3>
                      <Badge className={cn("mt-1", typeConfig[supplier.type]?.color)}>
                        {typeConfig[supplier.type]?.label}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={esgColors[supplier.esg_rating]}>
                    ESG: {supplier.esg_rating}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {supplier.location}, {supplier.country}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Star className="w-4 h-4 text-amber-400" />
                    Reliability: {supplier.reliability_score || 85}%
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Package className="w-4 h-4 text-slate-400" />
                    Avg Lead Time: {supplier.avg_lead_time || 14} days
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-400">
                    {supplier.active_pos || 0} active POs
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <Factory className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No suppliers found</p>
            <Button variant="outline" className="mt-4" onClick={() => setShowNewDialog(true)}>
              Add your first supplier
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
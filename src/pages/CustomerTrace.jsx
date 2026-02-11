import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Search, Package, Leaf, Shield, Check, Clock, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import TraceabilityTimeline from "@/components/timeline/TraceabilityTimeline";
import SupplyChainMap from "@/components/map/SupplyChainMap";
import RiskGauge from "@/components/dashboard/RiskGauge";

export default function CustomerTrace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPO, setSelectedPO] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: () => base44.entities.PurchaseOrder.list("-created_date", 100),
  });

  const handleSearch = () => {
    setIsSearching(true);
    const found = purchaseOrders.find(
      po => po.po_number?.toLowerCase() === searchQuery.toLowerCase()
    );
    setTimeout(() => {
      setSelectedPO(found || null);
      setIsSearching(false);
    }, 800);
  };

  const trustScore = selectedPO ? 100 - (selectedPO.risk_score || 0) : 95;

  const certifications = [
    { id: "organic", label: "Organic Cotton Certified", active: selectedPO?.organic_cotton },
    { id: "dyeing", label: "Low-Impact Dyeing", sublabel: "Reduced Water Usage", active: true },
    { id: "ethical", label: "Ethical Manufacturing", active: selectedPO?.esg_certified },
    { id: "shipping", label: "Efficient Sea Freight", sublabel: "Reduced Carbon", active: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-full border border-purple-500/30 mb-6">
              <Leaf className="w-4 h-4 text-purple-400" />
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent text-sm font-medium">Sustainable Fashion</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Trace the Journey of<br />Your Knit Sweater
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
              TraceLoom connects you to the story behind your garment—see its entire journey from raw material to your doorstep, powered by real-time data and AI intelligence
            </p>

            {/* Search Box */}
            <div className="max-w-md mx-auto">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Enter PO or Tracking Number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-slate-400 text-lg rounded-xl"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!searchQuery || isSearching}
                  className="h-14 px-8 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30"
                >
                  {isSearching ? "Searching..." : "Scan & Trace"}
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Try: KT1023, KT1024, or any PO number from your order
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {selectedPO && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="bg-white"
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {/* Product Header */}
              <div className="flex flex-col lg:flex-row gap-8 mb-12">
                <div className="lg:w-1/3">
                  <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80"
                      alt={selectedPO.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="lg:w-2/3">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    Journey to Your Sweater
                  </h2>
                  <p className="text-slate-500 mb-6">
                    {selectedPO.product_name} • PO #{selectedPO.po_number}
                  </p>

                  {/* Trust Summary */}
                  <div className="bg-slate-50 rounded-2xl p-6">
                    <div className="flex items-start gap-6">
                      <RiskGauge score={trustScore} size="md" />
                      <div className="flex-1 space-y-3">
                        {certifications.map((cert) => (
                          <div
                            key={cert.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl",
                              cert.active ? "bg-emerald-50" : "bg-slate-100 opacity-60"
                            )}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              cert.active ? "bg-emerald-100" : "bg-slate-200"
                            )}>
                              <Check className={cn(
                                "w-4 h-4",
                                cert.active ? "text-emerald-600" : "text-slate-400"
                              )} />
                            </div>
                            <div>
                              <p className={cn(
                                "font-medium text-sm",
                                cert.active ? "text-purple-800" : "text-slate-500"
                              )}>
                                {cert.label}
                              </p>
                              {cert.sublabel && (
                                <p className="text-xs text-slate-500">{cert.sublabel}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="mb-12">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Supply Chain Journey</h3>
                <div className="h-[400px] rounded-2xl overflow-hidden shadow-lg">
                  <SupplyChainMap currentStage={selectedPO.status} />
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Traceability Timeline</h3>
                <div className="bg-slate-50 rounded-2xl p-8">
                  <TraceabilityTimeline
                    timeline={selectedPO.timeline || []}
                    currentStatus={selectedPO.status}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Result State */}
      <AnimatePresence>
        {selectedPO === null && searchQuery && !isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-md mx-auto px-4 py-12 text-center"
          >
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Order Not Found</h3>
            <p className="text-slate-400">
              We couldn't find an order with that number. Please check and try again.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features Section */}
      {!selectedPO && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                title: "Complete Traceability",
                description: "Track every step with HK geospatial data integration"
              },
              {
                icon: Shield,
                title: "ESG & Ethics",
                description: "Verified sustainable sourcing with origin transparency"
              },
              {
                icon: Clock,
                title: "Predictive Intelligence",
                description: "AI-powered delay prediction using weather and port data"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white/5 rounded-2xl p-6 border border-white/10"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

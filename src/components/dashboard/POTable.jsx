import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowUpDown, Leaf, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const statusConfig = {
  yarn_sourcing: { label: "Yarn Sourcing", color: "bg-purple-100 text-purple-700" },
  knitting: { label: "Knitting", color: "bg-blue-100 text-blue-700" },
  dyeing: { label: "Dyeing", color: "bg-indigo-100 text-indigo-700" },
  qa_check: { label: "QA Check", color: "bg-cyan-100 text-cyan-700" },
  packing: { label: "Packing", color: "bg-amber-100 text-amber-700" },
  shipping: { label: "Shipping", color: "bg-emerald-100 text-emerald-700" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700" },
};

const riskConfig = {
  low: { label: "Low", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  medium: { label: "Medium", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  high: { label: "High", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  critical: { label: "Critical", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

export default function POTable({ purchaseOrders, compact = false }) {
  const [sortField, setSortField] = useState("risk_score");
  const [sortDir, setSortDir] = useState("desc");

  const sortedPOs = [...purchaseOrders].sort((a, b) => {
    const aVal = a[sortField] || 0;
    const bVal = b[sortField] || 0;
    return sortDir === "desc" ? bVal - aVal : aVal - bVal;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {sortedPOs.slice(0, 5).map((po) => (
          <Link
            key={po.id}
            to={createPageUrl("PODetail") + `?id=${po.id}`}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-2 h-2 rounded-full", riskConfig[po.risk_level]?.dot || "bg-slate-400")} />
              <div>
                <p className="font-semibold text-slate-800 text-sm">{po.po_number}</p>
                <p className="text-xs text-slate-500">{po.product_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn("text-xs", statusConfig[po.status]?.color)}>
                {statusConfig[po.status]?.label}
              </Badge>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">PO Number</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Product</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">
              <button onClick={() => handleSort("status")} className="flex items-center gap-1 hover:text-slate-900">
                Status <ArrowUpDown className="w-3 h-3" />
              </button>
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">
              <button onClick={() => handleSort("risk_score")} className="flex items-center gap-1 hover:text-slate-900">
                Risk Score <ArrowUpDown className="w-3 h-3" />
              </button>
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">ETA</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Certifications</th>
            <th className="text-right py-4 px-4 text-sm font-semibold text-slate-600"></th>
          </tr>
        </thead>
        <tbody>
          {sortedPOs.map((po) => (
            <tr key={po.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td className="py-4 px-4">
                <span className="font-mono font-semibold text-slate-800">{po.po_number}</span>
              </td>
              <td className="py-4 px-4">
                <div>
                  <p className="font-medium text-slate-700">{po.product_name}</p>
                  <p className="text-xs text-slate-500">{po.customer}</p>
                </div>
              </td>
              <td className="py-4 px-4">
                <Badge className={cn("font-medium", statusConfig[po.status]?.color)}>
                  {statusConfig[po.status]?.label}
                </Badge>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", riskConfig[po.risk_level]?.dot)} />
                  <span className="font-semibold text-slate-700">{po.risk_score || 0}</span>
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", riskConfig[po.risk_level]?.color)}>
                    {riskConfig[po.risk_level]?.label}
                  </span>
                </div>
                {po.estimated_delay_days > 0 && (
                  <p className="text-xs text-amber-600 mt-1">+{po.estimated_delay_days} days delay risk</p>
                )}
              </td>
              <td className="py-4 px-4">
                {po.expected_delivery && (
                  <span className="text-sm text-slate-600">
                    {format(new Date(po.expected_delivery), "MMM d, yyyy")}
                  </span>
                )}
              </td>
              <td className="py-4 px-4">
                <div className="flex gap-1">
                  {po.organic_cotton && (
                    <span className="p-1.5 bg-emerald-100 rounded-lg" title="Organic Cotton">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    </span>
                  )}
                  {po.esg_certified && (
                    <span className="p-1.5 bg-blue-100 rounded-lg" title="ESG Certified">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                    </span>
                  )}
                </div>
              </td>
              <td className="py-4 px-4 text-right">
                <Link to={createPageUrl("PODetail") + `?id=${po.id}`}>
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                    View <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
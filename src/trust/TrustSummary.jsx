import { Check, Leaf, Droplets, Factory, Ship } from "lucide-react";
import { cn } from "@/lib/utils";
import RiskGauge from "../dashboard/RiskGauge";

const certifications = [
  { id: "organic", label: "Organic Cotton Certified", icon: Leaf, field: "organic_cotton" },
  { id: "dyeing", label: "Low-Impact Dyeing", icon: Droplets, sublabel: "Water-efficient process verified" },
  { id: "ethical", label: "Ethical Manufacturing", icon: Factory, field: "esg_certified" },
  { id: "shipping", label: "Optimal Route", icon: Ship, sublabel: "Route optimized via geospatial data" },
];

export default function TrustSummary({ po, score = 95 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Trust Summary</h3>
      
      <div className="flex justify-center mb-6">
        <RiskGauge score={score} size="lg" />
      </div>
      
      <div className="space-y-3">
        {certifications.map((cert) => {
          const isActive = cert.field ? po?.[cert.field] : true;
          
          return (
            <div
              key={cert.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all",
                isActive ? "bg-emerald-50" : "bg-slate-50 opacity-60"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg",
                isActive ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400"
              )}>
                <cert.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className={cn(
                  "font-medium text-sm",
                  isActive ? "text-emerald-800" : "text-slate-500"
                )}>
                  {cert.label}
                </p>
                {cert.sublabel && (
                  <p className="text-xs text-slate-500">{cert.sublabel}</p>
                )}
              </div>
              {isActive && (
                <Check className="w-4 h-4 text-purple-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
import { Database, Cloud, Map, Ship } from "lucide-react";
import { cn } from "@/lib/utils";

const dataSources = [
  { name: "HK Observatory", icon: Cloud, color: "text-cyan-600" },
  { name: "Port Statistics", icon: Ship, color: "text-blue-600" },
  { name: "Geospatial Data", icon: Map, color: "text-purple-600" },
  { name: "Factory IoT", icon: Database, color: "text-pink-600" },
];

export default function DataSourcesBadge({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {dataSources.map((source) => (
          <div key={source.name} className="group relative">
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <source.icon className={cn("w-3 h-3", source.color)} />
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {source.name}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <h4 className="text-sm font-semibold text-slate-700 mb-3">Data Sources</h4>
      <div className="space-y-2">
        {dataSources.map((source) => (
          <div key={source.name} className="flex items-center gap-2 text-sm">
            <source.icon className={cn("w-4 h-4", source.color)} />
            <span className="text-slate-600">{source.name}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-3">
        Multi-source intelligence for accurate predictions
      </p>
    </div>
  );
}
maimport { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductionMonitor({ poId }) {
  const [productionData, setProductionData] = useState(null);
  const [trend, setTrend] = useState("stable");

  useEffect(() => {
    if (!poId) return;

    const loadData = async () => {
      const iotData = await base44.entities.IoTData.filter(
        { po_id: poId, metric_type: "production_rate" },
        "-timestamp",
        20
      );

      if (iotData.length > 0) {
        const latest = iotData[0];
        const previous = iotData[iotData.length - 1];
        
        const avgRate = iotData.reduce((sum, d) => sum + (d.metric_value || 0), 0) / iotData.length;
        const trendDirection = latest.metric_value > previous.metric_value ? "up" :
                             latest.metric_value < previous.metric_value ? "down" : "stable";

        setProductionData({
          currentRate: latest.metric_value,
          avgRate: avgRate.toFixed(1),
          unit: latest.metric_unit,
          efficiency: ((latest.metric_value / 100) * 100).toFixed(0),
        });
        setTrend(trendDirection);
      }
    };

    loadData();

    const unsubscribe = base44.entities.IoTData.subscribe((event) => {
      if (event.data.po_id === poId && event.data.metric_type === "production_rate") {
        loadData();
      }
    });

    return unsubscribe;
  }, [poId]);

  if (!productionData) return null;

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-700">Production Monitor</h4>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
          trend === "up" ? "bg-emerald-100 text-emerald-700" :
          trend === "down" ? "bg-red-100 text-red-700" :
          "bg-slate-100 text-slate-700"
        )}>
          <TrendIcon className="w-3 h-3" />
          {trend === "up" ? "Increasing" : trend === "down" ? "Decreasing" : "Stable"}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-slate-500 mb-1">Current Rate</p>
          <p className="text-lg font-bold text-slate-800">
            {productionData.currentRate}
            <span className="text-xs font-normal text-slate-500 ml-1">{productionData.unit}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Avg Rate</p>
          <p className="text-lg font-bold text-slate-800">
            {productionData.avgRate}
            <span className="text-xs font-normal text-slate-500 ml-1">{productionData.unit}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Efficiency</p>
          <p className="text-lg font-bold text-emerald-600">
            {productionData.efficiency}%
          </p>
        </div>
      </div>

      <div className="mt-3 h-1 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
          style={{ width: `${productionData.efficiency}%` }}
        />
      </div>
    </div>
  );
}

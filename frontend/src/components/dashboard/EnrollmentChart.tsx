import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { DashboardService } from "@/services/admin.dashboard.service";
import { EnrollmentTrendItem } from "@/lib/types/dashboard.types";

// Your custom color palette
const COLOR_POOL = ["#8FD9FB", "#4AB5B5", "#6D8BC0"];

const getSeriesKeys = (data: EnrollmentTrendItem[]) => {
  const keys = new Set<string>();
  data.forEach((row) => {
    Object.keys(row).forEach((k) => {
      if (k !== "year") keys.add(k);
    });
  });
  return Array.from(keys);
};

interface EnrollmentChartProps {
  type?: "line" | "area";
  institutionId?: string;
}

export function EnrollmentChart({ type = "line", institutionId }: EnrollmentChartProps) {
  const [data, setData] = useState<EnrollmentTrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      const trends = await DashboardService.getEnrollmentTrends(institutionId);
      setData(trends);
      setLoading(false);
    };
    fetchData();
  }, [institutionId]);

  useEffect(() => {
    if (data.length) {
      const keys = getSeriesKeys(data);
      const visibility: Record<string, boolean> = {};
      keys.forEach((k) => (visibility[k] = true));
      setVisibleSeries(visibility);
    }
  }, [data]);

  const seriesKeys = getSeriesKeys(data);

  const handleLegendClick = (e: any) => {
    const key = e.dataKey;
    
    // Check if we are currently isolating this key
    const isCurrentlyIsolated = visibleSeries[key] && Object.values(visibleSeries).filter(Boolean).length === 1;

    if (isCurrentlyIsolated) {
      // Reset all to visible
      const reset: Record<string, boolean> = {};
      seriesKeys.forEach((k) => (reset[k] = true));
      setVisibleSeries(reset);
    } else {
      // Isolate the selected key
      const isolated: Record<string, boolean> = {};
      seriesKeys.forEach((k) => (isolated[k] = k === key));
      setVisibleSeries(isolated);
    }
  };

  const legendPayload = seriesKeys.map((key, index) => ({
    id: key,
    value: key,
    type: "line",
    dataKey: key,
    color: visibleSeries[key]
      ? COLOR_POOL[index % COLOR_POOL.length]
      : "#94a3b8", // Muted grey when hidden
  }));

  if (loading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <span className="text-muted-foreground">Loading chart data...</span>
      </Card>
    );
  }

  const ChartComponent = type === "area" ? AreaChart : LineChart;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend payload={legendPayload} onClick={handleLegendClick} />

              {seriesKeys.map((key, index) => {
                const color = COLOR_POOL[index % COLOR_POOL.length];
                const visible = visibleSeries[key];

                return type === "area" ? (
                  <Area
                    key={key}
                    dataKey={key}
                    type="monotone"
                    stroke={color}
                    fill={color}
                    fillOpacity={visible ? 0.3 : 0}
                    strokeOpacity={visible ? 1 : 0.15}
                    strokeWidth={2}
                    activeDot={visible ? { r: 6 } : false}
                    isAnimationActive={false}
                  />
                ) : (
                  <Line
                    key={key}
                    dataKey={key}
                    type="monotone"
                    stroke={color}
                    strokeWidth={2}
                    strokeOpacity={visible ? 1 : 0.15}
                    dot={visible ? { fill: color } : false}
                    activeDot={visible ? { r: 6 } : false}
                    isAnimationActive={false}
                  />
                );
              })}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
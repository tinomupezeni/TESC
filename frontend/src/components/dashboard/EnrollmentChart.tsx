import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const enrollmentData = [
  { year: "2019", "Teachers Colleges": 12500, "Polytechnics": 18000, "Industrial Training": 8500 },
  { year: "2020", "Teachers Colleges": 13200, "Polytechnics": 19500, "Industrial Training": 9200 },
  { year: "2021", "Teachers Colleges": 14100, "Polytechnics": 21000, "Industrial Training": 10100 },
  { year: "2022", "Teachers Colleges": 15300, "Polytechnics": 23500, "Industrial Training": 11500 },
  { year: "2023", "Teachers Colleges": 16800, "Polytechnics": 25200, "Industrial Training": 12800 },
  { year: "2024", "Teachers Colleges": 18200, "Polytechnics": 27100, "Industrial Training": 14200 },
];

export function EnrollmentChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment Trends (2019-2024)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="year" 
                className="text-muted-foreground"
              />
              <YAxis 
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Teachers Colleges" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
              <Line 
                type="monotone" 
                dataKey="Polytechnics" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--accent))" }}
              />
              <Line 
                type="monotone" 
                dataKey="Industrial Training" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--success))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
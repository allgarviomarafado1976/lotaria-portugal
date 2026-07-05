import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FrequencyBarChartProps {
  data: Array<{ number: number; frequency: number }>;
  title: string;
  description?: string;
  limit?: number;
  color?: string;
}

export function FrequencyBarChart({ 
  data, 
  title, 
  description,
  limit = 15,
  color = "#3b82f6"
}: FrequencyBarChartProps) {
  // Sort by frequency and limit
  const chartData = data
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit)
    .map(item => ({
      ...item,
      name: `Nº ${item.number}`
    }));

  const maxFrequency = Math.max(...chartData.map(d => d.frequency), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ value: "Frequência", angle: -90, position: "insideLeft" }}
              domain={[0, maxFrequency]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                border: "none",
                borderRadius: "8px",
                color: "#fff"
              }}
              formatter={(value) => [`${value}x`, "Frequência"]}
            />
            <Bar dataKey="frequency" fill={color} radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={color}
                  opacity={0.7 + (entry.frequency / maxFrequency) * 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface FrequencyChartProps {
  topNumbers: Array<{ number: number; frequency: number }>;
  bottomNumbers: Array<{ number: number; frequency: number }>;
  gameType: "euroMillion" | "toto";
}

export function FrequencyChart({ topNumbers, bottomNumbers, gameType }: FrequencyChartProps) {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  // Prepare data for bar chart
  const barData = useMemo(() => {
    return topNumbers.slice(0, 15).map((item) => ({
      name: `${item.number}`,
      frequency: item.frequency,
    }));
  }, [topNumbers]);

  // Prepare data for pie chart
  const pieData = useMemo(() => {
    return topNumbers.slice(0, 10).map((item) => ({
      name: `${item.number}`,
      value: item.frequency,
    }));
  }, [topNumbers]);

  // Prepare data for comparison chart
  const comparisonData = useMemo(() => {
    return topNumbers
      .slice(0, 10)
      .map((item, idx) => ({
        number: `${item.number}`,
        quentes: item.frequency,
        frios: bottomNumbers[idx]?.frequency || 0,
      }));
  }, [topNumbers, bottomNumbers]);

  // Colors for pie chart
  const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#6366f1",
    "#06b6d4",
  ];

  return (
    <div className="space-y-6">
      {/* Top Numbers Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Números Mais Frequentes</CardTitle>
              <CardDescription>Visualização da frequência dos números sorteados</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setChartType("bar")}
                variant={chartType === "bar" ? "default" : "outline"}
                size="sm"
              >
                Barras
              </Button>
              <Button
                onClick={() => setChartType("pie")}
                variant={chartType === "pie" ? "default" : "outline"}
                size="sm"
              >
                Pizza
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartType === "bar" ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value} vezes`, "Frequência"]}
                />
                <Bar dataKey="frequency" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}x`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value} vezes`, "Frequência"]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação: Números Quentes vs Frios</CardTitle>
          <CardDescription>Top 10 mais frequentes vs Top 10 menos frequentes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="number" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`${value} vezes`, "Frequência"]}
              />
              <Legend />
              <Bar dataKey="quentes" fill="#ef4444" name="Números Quentes" radius={[8, 8, 0, 0]} />
              <Bar dataKey="frios" fill="#3b82f6" name="Números Frios" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Número Mais Frequente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-2">
              {topNumbers[0]?.number || "-"}
            </div>
            <p className="text-sm text-muted-foreground">
              Sorteado {topNumbers[0]?.frequency || 0} vezes
            </p>
            <div className="mt-4 w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{
                  width: `${((topNumbers[0]?.frequency || 0) / (topNumbers[0]?.frequency || 1)) * 100}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Número Menos Frequente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-accent mb-2">
              {bottomNumbers[0]?.number || "-"}
            </div>
            <p className="text-sm text-muted-foreground">
              Sorteado {bottomNumbers[0]?.frequency || 0} vezes
            </p>
            <div className="mt-4 w-full bg-muted rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full"
                style={{
                  width: `${((bottomNumbers[0]?.frequency || 0) / (topNumbers[0]?.frequency || 1)) * 100}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tabela Detalhada de Frequências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Número</th>
                  <th className="text-center py-3 px-4 font-semibold">Frequência</th>
                  <th className="text-center py-3 px-4 font-semibold">Percentagem</th>
                  <th className="text-left py-3 px-4 font-semibold">Visualização</th>
                </tr>
              </thead>
              <tbody>
                {topNumbers.slice(0, 15).map((item, idx) => {
                  const maxFreq = topNumbers[0]?.frequency || 1;
                  const percentage = ((item.frequency / maxFreq) * 100).toFixed(1);
                  return (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold text-sm">
                          {item.number}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 font-semibold">{item.frequency}x</td>
                      <td className="text-center py-3 px-4 text-muted-foreground">{percentage}%</td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

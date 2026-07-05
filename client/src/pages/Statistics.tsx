import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeatmapChart } from "@/components/HeatmapChart";
import { FrequencyBarChart } from "@/components/FrequencyBarChart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { BarChart3, TrendingUp, Zap, Snowflake } from "lucide-react";
import { trpc } from "@/lib/trpc";

type GameType = "euroMillion" | "toto";
type Period = 1 | 3 | 6 | 12;

const COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"
];

export function StatisticsPage() {
  const [gameType, setGameType] = useState<GameType>("euroMillion");
  const [period, setPeriod] = useState<Period>(12);

  // Queries for EuroMillion
  const euroNumberAnalysisQuery = trpc.lottery.euroMillion.getNumberAnalysis.useQuery();
  const euroStarAnalysisQuery = trpc.lottery.euroMillion.getStarAnalysis.useQuery();
  const euroStatsByPeriodQuery = trpc.lottery.euroMillion.getStatisticsByPeriod.useQuery({ months: period });

  // Queries for Totoloto
  const totoNumberAnalysisQuery = trpc.lottery.toto.getNumberAnalysis.useQuery();
  const totoLuckyAnalysisQuery = trpc.lottery.toto.getLuckyNumberAnalysis.useQuery();
  const totoStatsByPeriodQuery = trpc.lottery.toto.getStatisticsByPeriod.useQuery({ months: period });

  const isLoading = gameType === "euroMillion" 
    ? euroNumberAnalysisQuery.isLoading || euroStarAnalysisQuery.isLoading
    : totoNumberAnalysisQuery.isLoading || totoLuckyAnalysisQuery.isLoading;

  const getTopNumbers = (data: any[]) => data?.slice(0, 10) || [];
  const getBottomNumbers = (data: any[]) => data?.slice(-10).reverse() || [];

  // Prepare pie chart data
  const getPieData = (data: any[]) => {
    return data?.slice(0, 8).map((item: any) => ({
      name: `Nº ${item.number}`,
      value: item.frequency
    })) || [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="w-8 h-8" />
          Estatísticas Detalhadas
        </h1>
        <p className="text-muted-foreground mt-2">
          Análise completa de frequência de números e estrelas
        </p>
      </div>

      {/* Game Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Seletor de Jogo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => setGameType("euroMillion")}
              variant={gameType === "euroMillion" ? "default" : "outline"}
              className="h-12"
            >
              EuroMilhões
            </Button>
            <Button
              onClick={() => setGameType("toto")}
              variant={gameType === "toto" ? "default" : "outline"}
              className="h-12"
            >
              Totoloto
            </Button>
          </div>

          {/* Period Selector */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Período</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[1, 3, 6, 12].map((p) => (
                <Button
                  key={p}
                  onClick={() => setPeriod(p as Period)}
                  variant={period === p ? "default" : "outline"}
                  size="sm"
                >
                  {p} mês{p > 1 ? "es" : ""}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Carregando estatísticas...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* EuroMillion Statistics */}
          {gameType === "euroMillion" && (
            <div className="space-y-6">
              {/* Top Numbers */}
              <FrequencyBarChart
                data={getTopNumbers(euroStatsByPeriodQuery.data?.topNumbers || euroNumberAnalysisQuery.data || [])}
                title="Top 15 Números Mais Frequentes"
                description="EuroMilhões - Números que saem com maior frequência"
                color="#3b82f6"
              />

              {/* Heatmap Numbers */}
              <HeatmapChart
                data={euroNumberAnalysisQuery.data || []}
                title="Mapa de Calor - Números (1-50)"
                description="Visualização interativa da frequência de cada número"
                gameType="euroMillion"
                maxColumns={10}
              />

              {/* Top Stars */}
              <FrequencyBarChart
                data={getTopNumbers(euroStatsByPeriodQuery.data?.topStars || euroStarAnalysisQuery.data || [])}
                title="Estrelas Mais Frequentes"
                description="EuroMilhões - Estrelas que saem com maior frequência"
                color="#ef4444"
              />

              {/* Heatmap Stars */}
              <HeatmapChart
                data={euroStarAnalysisQuery.data || []}
                title="Mapa de Calor - Estrelas (1-12)"
                description="Visualização interativa da frequência de cada estrela"
                gameType="euroMillion"
                maxColumns={6}
              />

              {/* Comparison Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hot vs Cold Numbers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-500" />
                      Números Quentes vs Frios
                    </CardTitle>
                    <CardDescription>Comparação de frequência</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Top 10 Quentes",
                              value: getTopNumbers(euroNumberAnalysisQuery.data || [])
                                .reduce((sum: number, d: any) => sum + d.frequency, 0)
                            },
                            {
                              name: "Top 10 Frios",
                              value: getBottomNumbers(euroNumberAnalysisQuery.data || [])
                                .reduce((sum: number, d: any) => sum + d.frequency, 0)
                            }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#60a5fa" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Hot vs Cold Stars */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Snowflake className="w-5 h-5 text-blue-500" />
                      Estrelas Quentes vs Frias
                    </CardTitle>
                    <CardDescription>Comparação de frequência</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Top 5 Quentes",
                              value: getTopNumbers(euroStarAnalysisQuery.data || [])
                                .slice(0, 5)
                                .reduce((sum: number, d: any) => sum + d.frequency, 0)
                            },
                            {
                              name: "Top 5 Frias",
                              value: getBottomNumbers(euroStarAnalysisQuery.data || [])
                                .slice(0, 5)
                                .reduce((sum: number, d: any) => sum + d.frequency, 0)
                            }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#ef4444" />
                          <Cell fill="#fca5a5" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Totoloto Statistics */}
          {gameType === "toto" && (
            <div className="space-y-6">
              {/* Top Numbers */}
              <FrequencyBarChart
                data={getTopNumbers(totoStatsByPeriodQuery.data?.topNumbers || totoNumberAnalysisQuery.data || [])}
                title="Top 15 Números Mais Frequentes"
                description="Totoloto - Números que saem com maior frequência"
                color="#10b981"
              />

              {/* Heatmap Numbers */}
              <HeatmapChart
                data={totoNumberAnalysisQuery.data || []}
                title="Mapa de Calor - Números (1-49)"
                description="Visualização interativa da frequência de cada número"
                gameType="toto"
                maxColumns={7}
              />

              {/* Lucky Numbers */}
              <FrequencyBarChart
                data={getTopNumbers(totoStatsByPeriodQuery.data?.topLuckyNumbers || totoLuckyAnalysisQuery.data || [])}
                title="Números da Sorte Mais Frequentes"
                description="Totoloto - Números da sorte que saem com maior frequência"
                color="#f59e0b"
              />

              {/* Heatmap Lucky Numbers */}
              <HeatmapChart
                data={totoLuckyAnalysisQuery.data || []}
                title="Mapa de Calor - Números da Sorte (1-13)"
                description="Visualização interativa da frequência de cada número da sorte"
                gameType="toto"
                maxColumns={7}
              />

              {/* Comparison Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hot vs Cold Numbers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-500" />
                      Números Quentes vs Frios
                    </CardTitle>
                    <CardDescription>Comparação de frequência</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Top 10 Quentes",
                              value: getTopNumbers(totoNumberAnalysisQuery.data || [])
                                .reduce((sum: number, d: any) => sum + d.frequency, 0)
                            },
                            {
                              name: "Top 10 Frios",
                              value: getBottomNumbers(totoNumberAnalysisQuery.data || [])
                                .reduce((sum: number, d: any) => sum + d.frequency, 0)
                            }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#6ee7b7" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Hot vs Cold Lucky Numbers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Snowflake className="w-5 h-5 text-blue-500" />
                      Números da Sorte Quentes vs Frios
                    </CardTitle>
                    <CardDescription>Comparação de frequência</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Top 5 Quentes",
                              value: getTopNumbers(totoLuckyAnalysisQuery.data || [])
                                .slice(0, 5)
                                .reduce((sum: number, d: any) => sum + d.frequency, 0)
                            },
                            {
                              name: "Top 5 Frios",
                              value: getBottomNumbers(totoLuckyAnalysisQuery.data || [])
                                .slice(0, 5)
                                .reduce((sum: number, d: any) => sum + d.frequency, 0)
                            }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#f59e0b" />
                          <Cell fill="#fcd34d" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          {/* Detailed Ranking Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {gameType === "euroMillion" ? "Ranking Completo de Números" : "Ranking Completo de Números"}
              </CardTitle>
              <CardDescription>
                {gameType === "euroMillion" 
                  ? "Todos os 50 números ordenados por frequência"
                  : "Todos os 49 números ordenados por frequência"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-semibold">Posição</th>
                      <th className="text-left py-2 px-4 font-semibold">Número</th>
                      <th className="text-left py-2 px-4 font-semibold">Frequência</th>
                      <th className="text-left py-2 px-4 font-semibold">Percentagem</th>
                      <th className="text-left py-2 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(gameType === "euroMillion" ? euroNumberAnalysisQuery.data : totoNumberAnalysisQuery.data)?.map((item: any, idx: number) => {
                      const total = (gameType === "euroMillion" ? euroNumberAnalysisQuery.data : totoNumberAnalysisQuery.data)?.reduce((sum: number, d: any) => sum + d.frequency, 0) || 1;
                      const percentage = ((item.frequency / total) * 100).toFixed(1);
                      const isHot = idx < 10;
                      const isCold = idx >= (gameType === "euroMillion" ? 40 : 39);
                      
                      return (
                        <tr key={item.number} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">{idx + 1}</td>
                          <td className="py-2 px-4 font-semibold">{item.number}</td>
                          <td className="py-2 px-4">{item.frequency}</td>
                          <td className="py-2 px-4">{percentage}%</td>
                          <td className="py-2 px-4">
                            {isHot && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">Quente</span>}
                            {isCold && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">Frio</span>}
                            {!isHot && !isCold && <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Normal</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Target, Zap } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SuggestionHistoryDashboardProps {
  gameType: "euroMillion" | "toto";
}

export function SuggestionHistoryDashboard({ gameType }: SuggestionHistoryDashboardProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<"hot" | "cold" | "balanced">("hot");

  // Queries com refetch automático a cada 30 segundos
  const historyQuery = trpc.suggestions.getHistory.useQuery(
    { gameType },
    { refetchInterval: 30000 }
  );
  const analysisSummaryQuery = trpc.suggestions.getAnalysisSummary.useQuery(
    undefined,
    { refetchInterval: 30000 }
  );
  const hitAnalysisQuery = trpc.suggestions.getHitAnalysis.useQuery(
    {
      gameType,
      strategy: selectedStrategy,
    },
    { refetchInterval: 30000 }
  );

  // Get utils para invalidação
  const utils = trpc.useUtils();

  // Mutations
  const checkAgainstDrawMutation = trpc.suggestions.checkAgainstLatestDraw.useMutation({
    onSuccess: () => {
      // Invalidar queries para refetch imediato
      utils.suggestions.getHistory.invalidate();
      utils.suggestions.getAnalysisSummary.invalidate();
      utils.suggestions.getHitAnalysis.invalidate();
    },
  });

  const handleCheckAgainstDraw = async () => {
    try {
      await checkAgainstDrawMutation.mutateAsync({ gameType });
    } catch (error) {
      console.error("Erro ao verificar contra sorteio:", error);
    }
  };

  // Prepare data for charts
  const historyData = historyQuery.data || [];
  const analysisSummary = analysisSummaryQuery.data || [];
  const hitAnalysis = hitAnalysisQuery.data;

  // Loading state
  const isLoading = historyQuery.isLoading || analysisSummaryQuery.isLoading || hitAnalysisQuery.isLoading;

  // Empty state
  const isEmpty = !isLoading && historyData.length === 0;

  // Filter analysis by game type
  const gameAnalysis = useMemo(() => analysisSummary.filter((a) => a.gameType === gameType), [analysisSummary, gameType]);

  // Prepare strategy comparison data
  const strategyData = useMemo(() => gameAnalysis.map((a) => ({
    strategy: a.strategy.charAt(0).toUpperCase() + a.strategy.slice(1),
    accuracy: parseFloat(a.accuracyRate) || 0,
    totalSuggestions: a.totalSuggestions,
    totalHits: a.totalHits,
  })), [gameAnalysis]);

  // Prepare accuracy trend data
  const accuracyTrendData = useMemo(() => historyData
    .filter((h) => h.drawDate)
    .slice(0, 10)
    .reverse()
    .map((h, idx) => ({
      date: h.drawDate ? format(new Date(h.drawDate), "dd/MM", { locale: ptBR }) : `Sugestão ${idx + 1}`,
      matched: h.matchedNumbers || 0,
      strategy: h.strategy,
    })), [historyData]);

  // Prepare hit distribution data
  const hitDistribution = useMemo(() => [
    {
      name: "Com Acertos",
      value: historyData.filter((h) => h.isHit === 1).length,
      color: "#10b981",
    },
    {
      name: "Sem Acertos",
      value: historyData.filter((h) => h.isHit === 0).length,
      color: "#ef4444",
    },
  ], [historyData]);

  const COLORS = ["#10b981", "#ef4444"];

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Histórico de Sugestões</h2>
          <p className="text-sm text-muted-foreground">
            Análise de precisão e desempenho das sugestões geradas
          </p>
        </div>
        <Button
          onClick={handleCheckAgainstDraw}
          disabled={checkAgainstDrawMutation.isPending}
          className="gap-2"
        >
          <Zap className="w-4 h-4" />
          {checkAgainstDrawMutation.isPending ? "Verificando..." : "Verificar Sorteio"}
        </Button>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Zap className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma sugestão gerada ainda</h3>
            <p className="text-sm text-muted-foreground text-center">
              Gere sugestões usando as estratégias de números quentes, frios ou equilibrados para ver o histórico aqui.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Carregando histórico...</span>
          </CardContent>
        </Card>
      )}

      {/* Seletor de estratégia */}
      {!isEmpty && (
      <div className="flex gap-2">
        {(["hot", "cold", "balanced"] as const).map((strategy) => (
          <Button
            key={strategy}
            variant={selectedStrategy === strategy ? "default" : "outline"}
            onClick={() => setSelectedStrategy(strategy)}
            className="gap-2"
          >
            {strategy === "hot" && <TrendingUp className="w-4 h-4" />}
            {strategy === "cold" && <TrendingUp className="w-4 h-4 rotate-180" />}
            {strategy === "balanced" && <Target className="w-4 h-4" />}
            {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
          </Button>
        ))}
      </div>
      )}

      {/* Análise de Precisão */}
      {hitAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Análise de Precisão - {selectedStrategy.toUpperCase()}</CardTitle>
            <CardDescription>
              Desempenho da estratégia {selectedStrategy} para {gameType === "euroMillion" ? "EuroMilhões" : "Totoloto"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total de Sugestões</p>
              <p className="text-2xl font-bold">{hitAnalysis.totalSuggestions}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Com Acertos</p>
              <p className="text-2xl font-bold text-green-600">{hitAnalysis.totalHits}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Taxa de Acerto</p>
              <p className="text-2xl font-bold text-blue-600">{hitAnalysis.accuracyRate}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Média de Acertos</p>
              <p className="text-2xl font-bold">{hitAnalysis.avgMatchedNumbers}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparação de Estratégias */}
        {strategyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Estratégias</CardTitle>
              <CardDescription>Taxa de acerto por estratégia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={strategyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="strategy" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accuracy" fill="#3b82f6" name="Taxa de Acerto (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Distribuição de Acertos */}
        {hitDistribution.some((d) => d.value > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Acertos</CardTitle>
              <CardDescription>Sugestões com e sem acertos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={hitDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {hitDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tendência de Acertos */}
      {accuracyTrendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Acertos</CardTitle>
            <CardDescription>Números acertados ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={accuracyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="matched"
                  stroke="#10b981"
                  name="Números Acertados"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Histórico Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico Detalhado</CardTitle>
          <CardDescription>Todas as sugestões geradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {historyData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma sugestão gerada ainda
              </p>
            ) : (
              historyData.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={suggestion.strategy === "hot" ? "default" : "secondary"}>
                        {suggestion.strategy}
                      </Badge>
                      <span className="text-sm font-medium">
                        {suggestion.numbers.join(", ")}
                        {suggestion.stars && ` - ⭐${suggestion.stars.join(", ")}`}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Gerada em {format(new Date(suggestion.generatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {suggestion.isHit === 1 && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">Acertou!</p>
                        <p className="text-xs text-muted-foreground">
                          {suggestion.matchedNumbers} números
                        </p>
                      </div>
                    )}
                    {suggestion.isHit === 0 && (
                      <p className="text-sm text-muted-foreground">Sem acertos</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

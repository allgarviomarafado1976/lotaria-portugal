import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Moon, Sun, LogOut, Target, TrendingUp, History, BarChart3 } from "lucide-react";
import { FrequencyChart } from "@/components/FrequencyChart";
import { PeriodFilter } from "@/components/PeriodFilter";
import { FavoritesManager } from "@/components/FavoritesManager";
import { AlertsPanel } from "@/components/AlertsPanel";
import { KeyCheckerDisplay } from "@/components/KeyCheckerDisplay";
import { SuggestionsDisplay } from "@/components/SuggestionsDisplay";
import { InteractiveKeyChecker } from "@/components/InteractiveKeyChecker";
import { InteractiveSuggestions } from "@/components/InteractiveSuggestions";
import { SuggestionHistoryDashboard } from "@/components/SuggestionHistoryDashboard";
import { Star, Bell } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [gameType, setGameType] = useState<"euroMillion" | "toto">("euroMillion");
  const [page, setPage] = useState(1);
  const [keyInput, setKeyInput] = useState("");
  const [checkResult, setCheckResult] = useState<any>(null);
  const [suggestedKey, setSuggestedKey] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(12);

  // Queries
  const statsQuery = gameType === "euroMillion" 
    ? trpc.lottery.euroMillion.getStatistics.useQuery()
    : trpc.lottery.toto.getStatistics.useQuery();

  const statsByPeriodQuery = gameType === "euroMillion"
    ? trpc.lottery.euroMillion.getStatisticsByPeriod.useQuery({ months: selectedPeriod })
    : trpc.lottery.toto.getStatisticsByPeriod.useQuery({ months: selectedPeriod });

  const drawsQuery = gameType === "euroMillion"
    ? trpc.lottery.euroMillion.getDraws.useQuery({ page, limit: 10 })
    : trpc.lottery.toto.getDraws.useQuery({ page, limit: 10 });

  const handleCheckKey = async () => {
    if (!keyInput.trim()) return;

    try {
      if (gameType === "euroMillion") {
        const parts = keyInput.split(",").map(n => parseInt(n.trim()));
        const numbers = parts.slice(0, 5);
        const stars = parts.slice(5, 7);
        
        if (numbers.length === 5 && stars.length === 2) {
          // Use fetch to call the query
          const response = await fetch("/api/trpc/lottery.euroMillion.checkKey", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 0: { numbers, stars } }),
            credentials: "include",
          });
          const data = await response.json();
          setCheckResult(data.result?.data);
        }
      } else {
        const parts = keyInput.split(",").map(n => parseInt(n.trim()));
        const numbers = parts.slice(0, 6);
        const luckyNumber = parts[6] || 0;
        
        if (numbers.length === 6) {
          const response = await fetch("/api/trpc/lottery.toto.checkKey", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 0: { numbers, luckyNumber } }),
            credentials: "include",
          });
          const data = await response.json();
          setCheckResult(data.result?.data);
        }
      }
    } catch (error) {
      console.error("Erro ao verificar chave:", error);
    }
  };

  const handleSuggestKey = async (strategy: "hot" | "cold" | "balanced") => {
    try {
      const endpoint = gameType === "euroMillion" 
        ? "/api/trpc/lottery.euroMillion.suggestKey"
        : "/api/trpc/lottery.toto.suggestKey";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 0: { strategy } }),
        credentials: "include",
      });
      const data = await response.json();
      setSuggestedKey(data.result?.data);
    } catch (error) {
      console.error("Erro ao sugerir chave:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Lotaria Portugal</h1>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button 
              onClick={logout} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors duration-200"
              aria-label="Alternar tema"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Selecione o Jogo</h2>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setGameType("euroMillion");
                setPage(1);
              }}
              variant={gameType === "euroMillion" ? "default" : "outline"}
              className="transition-all"
            >
              EuroMilhões
            </Button>
            <Button
              onClick={() => {
                setGameType("toto");
                setPage(1);
              }}
              variant={gameType === "toto" ? "default" : "outline"}
              className="transition-all"
            >
              Totoloto
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="statistics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="checker" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Verificador
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Sugestões
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Favoritos
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alertas
            </TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <PeriodFilter selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />

            {statsByPeriodQuery.isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Carregando gráficos...</p>
                </CardContent>
              </Card>
            ) : statsByPeriodQuery.data ? (
              <FrequencyChart
                topNumbers={statsByPeriodQuery.data.topNumbers || []}
                bottomNumbers={statsByPeriodQuery.data.bottomNumbers || []}
                gameType={gameType}
              />
            ) : null}
            {statsQuery.isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Carregando estatísticas...</p>
                </CardContent>
              </Card>
            ) : statsQuery.data ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Total de Sorteios</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{statsQuery.data.totalDraws}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Número Mais Frequente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">
                        {statsQuery.data.topNumbers?.[0]?.number || "-"}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {statsQuery.data.topNumbers?.[0]?.frequency || 0} vezes
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Número Menos Frequente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-accent">
                        {statsQuery.data.bottomNumbers?.[0]?.number || "-"}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {statsQuery.data.bottomNumbers?.[0]?.frequency || 0} vezes
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Top 10 Números Mais Frequentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {statsQuery.data.topNumbers?.slice(0, 10).map((num: any) => (
                        <div key={num.number} className="flex items-center justify-between">
                          <span className="font-medium">{num.number}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{
                                  width: `${(num.frequency / (statsQuery.data.topNumbers?.[0]?.frequency || 1)) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-8">{num.frequency}x</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Nenhuma estatística disponível</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Checker Tab */}
          <TabsContent value="checker" className="space-y-6">
            <InteractiveKeyChecker gameType={gameType} />

            <InteractiveSuggestions gameType={gameType} />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {drawsQuery.isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Carregando histórico...</p>
                </CardContent>
              </Card>
            ) : drawsQuery.data?.draws && drawsQuery.data.draws.length > 0 ? (
              <>
                <div className="space-y-4">
                  {drawsQuery.data.draws.map((draw: any) => (
                    <Card key={draw.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-semibold">{new Date(draw.date).toLocaleDateString("pt-PT")}</p>
                          <span className={`text-sm font-semibold ${
                            draw.hasWinner ? "text-green-600" : "text-gray-500"
                          }`}>
                            {draw.hasWinner ? "✓ Premiado" : "✗ Sem prémio"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {gameType === "euroMillion" ? (
                            <>
                              {[draw.number1, draw.number2, draw.number3, draw.number4, draw.number5].map((num: number) => (
                                <span key={num} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-semibold text-sm">
                                  {num}
                                </span>
                              ))}
                              <span className="text-muted-foreground">★</span>
                              {[draw.star1, draw.star2].map((star: number) => (
                                <span key={star} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 font-semibold text-sm">
                                  {star}
                                </span>
                              ))}
                            </>
                          ) : (
                            <>
                              {[draw.number1, draw.number2, draw.number3, draw.number4, draw.number5, draw.number6].map((num: number) => (
                                <span key={num} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 font-semibold text-sm">
                                  {num}
                                </span>
                              ))}
                              <span className="text-muted-foreground">◆</span>
                              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 font-semibold text-sm">
                                {draw.luckyNumber}
                              </span>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    variant="outline"
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {page} de {Math.ceil((drawsQuery.data.total || 0) / 10)}
                  </span>
                  <Button
                    onClick={() => setPage(page + 1)}
                    disabled={!drawsQuery.data.draws || drawsQuery.data.draws.length < 10}
                    variant="outline"
                  >
                    Próxima
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Nenhum sorteio encontrado</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Suggestions History Tab */}
          <TabsContent value="suggestions" className="space-y-6">
            <SuggestionHistoryDashboard gameType={gameType} />
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <FavoritesManager gameType={gameType} />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <AlertsPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

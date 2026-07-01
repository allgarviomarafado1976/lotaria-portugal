import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnhancedSuggestionsDisplay } from "./EnhancedSuggestionsDisplay";
import { Zap, Snowflake, Scale, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface InteractiveSuggestionsProps {
  gameType: "euroMillion" | "toto";
  onSuggestionsGenerated?: (suggestions: any) => void;
}

type Strategy = "hot" | "cold" | "balanced";

export function InteractiveSuggestions({ gameType, onSuggestionsGenerated }: InteractiveSuggestionsProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>("balanced");
  const [suggestedKey, setSuggestedKey] = useState<any>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  const strategies: Array<{ id: Strategy; label: string; icon: React.ReactNode; description: string; color: string }> = [
    {
      id: "hot",
      label: "Quentes",
      icon: <Zap className="w-5 h-5" />,
      description: "Números mais frequentes",
      color: "bg-orange-500 dark:bg-orange-600",
    },
    {
      id: "cold",
      label: "Frios",
      icon: <Snowflake className="w-5 h-5" />,
      description: "Números menos frequentes",
      color: "bg-blue-500 dark:bg-blue-600",
    },
    {
      id: "balanced",
      label: "Equilibrado",
      icon: <Scale className="w-5 h-5" />,
      description: "Mistura de quentes e frios",
      color: "bg-cyan-500 dark:bg-cyan-600",
    },
  ];

  // Queries para EuroMillion
  const euroSuggestQuery = trpc.lottery.euroMillion.suggestKey.useQuery(
    { strategy: selectedStrategy },
    { enabled: shouldFetch && gameType === "euroMillion" }
  );

  const euroAnalysisQuery = trpc.lottery.euroMillion.getNumberAnalysis.useQuery(
    undefined,
    { enabled: shouldFetch && gameType === "euroMillion" }
  );

  const euroStarAnalysisQuery = trpc.lottery.euroMillion.getStarAnalysis.useQuery(
    undefined,
    { enabled: shouldFetch && gameType === "euroMillion" }
  );

  // Queries para Totoloto
  const totoSuggestQuery = trpc.lottery.toto.suggestKey.useQuery(
    { strategy: selectedStrategy },
    { enabled: shouldFetch && gameType === "toto" }
  );

  const totoAnalysisQuery = trpc.lottery.toto.getNumberAnalysis.useQuery(
    undefined,
    { enabled: shouldFetch && gameType === "toto" }
  );

  const totoLuckyAnalysisQuery = trpc.lottery.toto.getLuckyNumberAnalysis.useQuery(
    undefined,
    { enabled: shouldFetch && gameType === "toto" }
  );

  const handleGenerateSuggestion = async () => {
    setShouldFetch(true);
    setSuggestedKey(null);
  };

  // Atualizar suggestedKey quando os dados chegarem
  if (gameType === "euroMillion" && euroSuggestQuery.data && !suggestedKey) {
    setSuggestedKey(euroSuggestQuery.data);
    setShouldFetch(false);
    if (onSuggestionsGenerated) {
      onSuggestionsGenerated(euroSuggestQuery.data);
    }
  }

  if (gameType === "toto" && totoSuggestQuery.data && !suggestedKey) {
    setSuggestedKey(totoSuggestQuery.data);
    setShouldFetch(false);
    if (onSuggestionsGenerated) {
      onSuggestionsGenerated(totoSuggestQuery.data);
    }
  }

  const handleClear = () => {
    setSuggestedKey(null);
    setShouldFetch(false);
  };

  const isLoading = gameType === "euroMillion" 
    ? euroSuggestQuery.isLoading || euroAnalysisQuery.isLoading || euroStarAnalysisQuery.isLoading
    : totoSuggestQuery.isLoading || totoAnalysisQuery.isLoading || totoLuckyAnalysisQuery.isLoading;

  return (
    <div className="space-y-6">
      {/* Seletor de Estratégia */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Estratégia de Sugestão
          </CardTitle>
          <CardDescription>
            Mistura de números quentes, frios e equilibrados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {strategies.map((strategy) => (
              <button
                key={strategy.id}
                onClick={() => setSelectedStrategy(strategy.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedStrategy === strategy.id
                    ? `${strategy.color} text-white border-transparent`
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {strategy.icon}
                  <span className="font-semibold">{strategy.label}</span>
                </div>
                <p className="text-sm opacity-90">{strategy.description}</p>
              </button>
            ))}
          </div>

          <Button
            onClick={handleGenerateSuggestion}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3"
            size="lg"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⚙️</span>
                Gerando Sugestão...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Gerar Sugestão
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultado com Análise Detalhada */}
      {suggestedKey && (
        <div className="space-y-4">
          {gameType === "euroMillion" && euroAnalysisQuery.data && euroStarAnalysisQuery.data && (
            <EnhancedSuggestionsDisplay
              gameType="euroMillion"
              suggestedNumbers={suggestedKey.suggestedNumbers || []}
              suggestedStars={suggestedKey.suggestedStars || []}
              strategy={selectedStrategy}
              numberAnalysis={euroAnalysisQuery.data}
              starAnalysis={euroStarAnalysisQuery.data}
            />
          )}

          {gameType === "toto" && totoAnalysisQuery.data && totoLuckyAnalysisQuery.data && (
            <EnhancedSuggestionsDisplay
              gameType="totoloto"
              suggestedNumbers={suggestedKey.suggestedNumbers || []}
              luckyNumber={suggestedKey.suggestedLucky}
              strategy={selectedStrategy}
              numberAnalysis={totoAnalysisQuery.data}
              starAnalysis={totoLuckyAnalysisQuery.data}
            />
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateSuggestion}
              variant="outline"
              className="flex-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Outra
            </Button>
            <Button
              onClick={handleClear}
              variant="ghost"
              className="flex-1"
            >
              Limpar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

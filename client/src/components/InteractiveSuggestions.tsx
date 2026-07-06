import { useState, useEffect } from "react";
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
  const [isGenerating, setIsGenerating] = useState(false);

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
    { enabled: false }
  );

  const euroAnalysisQuery = trpc.lottery.euroMillion.getNumberAnalysis.useQuery(
    undefined,
    { enabled: false }
  );

  const euroStarAnalysisQuery = trpc.lottery.euroMillion.getStarAnalysis.useQuery(
    undefined,
    { enabled: false }
  );

  // Queries para Totoloto
  const totoSuggestQuery = trpc.lottery.toto.suggestKey.useQuery(
    { strategy: selectedStrategy },
    { enabled: false }
  );

  const totoAnalysisQuery = trpc.lottery.toto.getNumberAnalysis.useQuery(
    undefined,
    { enabled: false }
  );

  const totoLuckyAnalysisQuery = trpc.lottery.toto.getLuckyNumberAnalysis.useQuery(
    undefined,
    { enabled: false }
  );

  // Get utils para invalidação
  const utils = trpc.useUtils();

  // Mutation para guardar sugestão no histórico
  const addToHistoryMutation = trpc.suggestions.addToHistory.useMutation({
    onSuccess: () => {
      // Invalidar queries de histórico para refetch imediato
      utils.suggestions.getHistory.invalidate();
      utils.suggestions.getAnalysisSummary.invalidate();
      utils.suggestions.getHitAnalysis.invalidate();
      toast.success("Sugestão guardada no histórico!");
    },
    onError: (error) => {
      toast.error(`Erro ao guardar: ${error.message}`);
    },
  });

  // Efeito para atualizar quando as queries completam
  useEffect(() => {
    if (gameType === "euroMillion" && euroSuggestQuery.data && euroAnalysisQuery.data && euroStarAnalysisQuery.data) {
      setSuggestedKey(euroSuggestQuery.data);
      setIsGenerating(false);
      if (onSuggestionsGenerated) {
        onSuggestionsGenerated(euroSuggestQuery.data);
      }
      toast.success("Sugestão gerada com sucesso!");
      
      // Guardar no histórico automaticamente
      addToHistoryMutation.mutate({
        gameType: "euroMillion",
        strategy: euroSuggestQuery.data.strategy,
        numbers: euroSuggestQuery.data.numbers,
        stars: euroSuggestQuery.data.stars,
      });
    }
  }, [euroSuggestQuery.data, euroAnalysisQuery.data, euroStarAnalysisQuery.data, gameType, onSuggestionsGenerated]);

  useEffect(() => {
    if (gameType === "toto" && totoSuggestQuery.data && totoAnalysisQuery.data && totoLuckyAnalysisQuery.data) {
      setSuggestedKey(totoSuggestQuery.data);
      setIsGenerating(false);
      if (onSuggestionsGenerated) {
        onSuggestionsGenerated(totoSuggestQuery.data);
      }
      toast.success("Sugestão gerada com sucesso!");
      
      // Guardar no histórico automaticamente
      addToHistoryMutation.mutate({
        gameType: "toto",
        strategy: totoSuggestQuery.data.strategy,
        numbers: totoSuggestQuery.data.numbers,
        luckyNumber: totoSuggestQuery.data.luckyNumber,
      });
    }
  }, [totoSuggestQuery.data, totoAnalysisQuery.data, totoLuckyAnalysisQuery.data, gameType, onSuggestionsGenerated]);

  const handleGenerateSuggestion = async () => {
    setIsGenerating(true);
    setSuggestedKey(null);

    if (gameType === "euroMillion") {
      await Promise.all([
        euroSuggestQuery.refetch(),
        euroAnalysisQuery.refetch(),
        euroStarAnalysisQuery.refetch(),
      ]);
    } else {
      await Promise.all([
        totoSuggestQuery.refetch(),
        totoAnalysisQuery.refetch(),
        totoLuckyAnalysisQuery.refetch(),
      ]);
    }
  };

  const handleClear = () => {
    setSuggestedKey(null);
    setIsGenerating(false);
  };

  const isLoading = gameType === "euroMillion" 
    ? isGenerating || euroSuggestQuery.isLoading || euroAnalysisQuery.isLoading || euroStarAnalysisQuery.isLoading
    : isGenerating || totoSuggestQuery.isLoading || totoAnalysisQuery.isLoading || totoLuckyAnalysisQuery.isLoading;

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
                onClick={() => {
                  setSelectedStrategy(strategy.id);
                  setSuggestedKey(null);
                }}
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
              suggestedNumbers={suggestedKey.numbers || []}
              suggestedStars={suggestedKey.stars || []}
              strategy={selectedStrategy}
              numberAnalysis={euroAnalysisQuery.data}
              starAnalysis={euroStarAnalysisQuery.data}
            />
          )}

          {gameType === "toto" && totoAnalysisQuery.data && totoLuckyAnalysisQuery.data && (
            <EnhancedSuggestionsDisplay
              gameType="totoloto"
              suggestedNumbers={suggestedKey.numbers || []}
              luckyNumber={suggestedKey.luckyNumber}
              strategy={selectedStrategy}
              numberAnalysis={totoAnalysisQuery.data}
              starAnalysis={totoLuckyAnalysisQuery.data}
            />
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateSuggestion}
              disabled={isLoading}
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

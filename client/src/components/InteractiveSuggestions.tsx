import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SuggestionsDisplay } from "./SuggestionsDisplay";
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

  // Query para EuroMillion
  const euroQuery = trpc.lottery.euroMillion.suggestKey.useQuery(
    { strategy: selectedStrategy },
    { enabled: false }
  );

  // Query para Totoloto
  const totoQuery = trpc.lottery.toto.suggestKey.useQuery(
    { strategy: selectedStrategy },
    { enabled: false }
  );

  const handleGenerateSuggestion = async () => {
    try {
      if (gameType === "euroMillion") {
        const result = await euroQuery.refetch();
        if (result.data) {
          setSuggestedKey(result.data);
          onSuggestionsGenerated?.(result.data);
          toast.success("✨ Sugestão gerada com sucesso!");
        }
      } else {
        const result = await totoQuery.refetch();
        if (result.data) {
          setSuggestedKey(result.data);
          onSuggestionsGenerated?.(result.data);
          toast.success("✨ Sugestão gerada com sucesso!");
        }
      }
    } catch (error) {
      console.error("Erro ao gerar sugestão:", error);
      toast.error("Erro ao gerar sugestão");
    }
  };

  const handleClearSuggestion = () => {
    setSuggestedKey(null);
  };

  const isGenerating = euroQuery.isFetching || totoQuery.isFetching;

  return (
    <div className="space-y-6">
      {/* Strategy Selection */}
      <Card className="border-2 border-slate-700 dark:border-slate-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-500" />
            Estratégia de Sugestão
          </CardTitle>
          <CardDescription>Escolha como deseja gerar a próxima chave</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Strategy Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {strategies.map((strategy) => (
              <button
                key={strategy.id}
                onClick={() => setSelectedStrategy(strategy.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedStrategy === strategy.id
                    ? `${strategy.color} text-white border-white shadow-lg scale-105`
                    : "bg-slate-700 dark:bg-slate-600 text-slate-100 border-slate-600 dark:border-slate-500 hover:border-slate-500"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {strategy.icon}
                  <span className="font-semibold">{strategy.label}</span>
                </div>
                <p className="text-xs opacity-90">{strategy.description}</p>
              </button>
            ))}
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateSuggestion}
            disabled={isGenerating}
            size="lg"
            className="w-full bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white font-semibold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? "Gerando..." : "Gerar Sugestão"}
          </Button>
        </CardContent>
      </Card>

      {/* Result Display */}
      {suggestedKey && (
        <div className="space-y-4">
          <SuggestionsDisplay
            gameType={gameType}
            strategy={suggestedKey.strategy}
            numbers={suggestedKey.numbers}
            stars={gameType === "euroMillion" ? suggestedKey.stars : undefined}
            luckyNumber={gameType === "toto" ? suggestedKey.luckyNumber : undefined}
          />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateSuggestion}
              disabled={isGenerating}
              variant="outline"
              className="flex-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? "Gerando..." : "Gerar Outra"}
            </Button>
            <Button
              onClick={handleClearSuggestion}
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

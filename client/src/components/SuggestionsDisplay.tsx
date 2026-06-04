import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";

interface SuggestionsDisplayProps {
  gameType: "euroMillion" | "toto";
  strategy: "hot" | "cold" | "balanced";
  numbers: number[];
  stars?: number[];
  luckyNumber?: number;
}

const strategyDescriptions = {
  hot: {
    title: "🔥 Números Quentes",
    description: "Números que foram sorteados com maior frequência",
    color: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
    textColor: "text-red-900 dark:text-red-100",
  },
  cold: {
    title: "❄️ Números Frios",
    description: "Números que foram sorteados com menor frequência",
    color: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
    textColor: "text-blue-900 dark:text-blue-100",
  },
  balanced: {
    title: "⚖️ Combinação Equilibrada",
    description: "Mistura de números quentes e frios",
    color: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
    textColor: "text-purple-900 dark:text-purple-100",
  },
};

export function SuggestionsDisplay({
  gameType,
  strategy,
  numbers,
  stars,
  luckyNumber,
}: SuggestionsDisplayProps) {
  const info = strategyDescriptions[strategy];

  return (
    <Card className={`border-2 ${info.color}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          <div>
            <CardTitle className={info.textColor}>{info.title}</CardTitle>
            <CardDescription>{info.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Numbers */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {gameType === "euroMillion" ? "Números sugeridos (1-50)" : "Números sugeridos (1-49)"}
          </p>
          <div className="flex flex-wrap gap-2">
            {numbers.map((num) => (
              <div
                key={num}
                className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg border-2 ${
                  strategy === "hot"
                    ? "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 border-red-300 dark:border-red-700"
                    : strategy === "cold"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-700"
                      : "bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 border-purple-300 dark:border-purple-700"
                }`}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* Stars or Lucky Number */}
        {gameType === "euroMillion" && stars && stars.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Estrelas sugeridas (1-12)
            </p>
            <div className="flex flex-wrap gap-2">
              {stars.map((star) => (
                <div
                  key={star}
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg border-2 ${
                    strategy === "hot"
                      ? "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 border-red-300 dark:border-red-700"
                      : strategy === "cold"
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-700"
                        : "bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 border-purple-300 dark:border-purple-700"
                  }`}
                >
                  ⭐ {star}
                </div>
              ))}
            </div>
          </div>
        )}

        {gameType === "toto" && luckyNumber && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Número especial sugerido (1-13)
            </p>
            <div className="flex flex-wrap gap-2">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg border-2 ${
                  strategy === "hot"
                    ? "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 border-red-300 dark:border-red-700"
                    : strategy === "cold"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-700"
                      : "bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 border-purple-300 dark:border-purple-700"
                }`}
              >
                ◆ {luckyNumber}
              </div>
            </div>
          </div>
        )}

        {/* Copy to Clipboard */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Chave sugerida:</p>
          <div className="p-2 bg-muted rounded font-mono text-sm">
            {numbers.join(", ")}
            {gameType === "euroMillion" && stars && stars.length > 0 && ` | ${stars.join(", ")}`}
            {gameType === "toto" && luckyNumber && ` | ${luckyNumber}`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface KeyCheckerDisplayProps {
  gameType: "euroMillion" | "toto";
  numbers: number[];
  stars?: number[];
  luckyNumber?: number;
  wasDrawn: boolean;
  drawnDate?: string;
}

export function KeyCheckerDisplay({
  gameType,
  numbers,
  stars,
  luckyNumber,
  wasDrawn,
  drawnDate,
}: KeyCheckerDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Result Status */}
      <div
        className={`p-4 rounded-lg border flex items-center gap-3 ${
          wasDrawn
            ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
        }`}
      >
        {wasDrawn ? (
          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
        ) : (
          <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
        )}
        <div>
          <p
            className={`font-semibold ${
              wasDrawn
                ? "text-green-900 dark:text-green-100"
                : "text-red-900 dark:text-red-100"
            }`}
          >
            {wasDrawn ? "✓ Chave foi sorteada" : "✗ Chave não foi sorteada"}
          </p>
          {wasDrawn && drawnDate && (
            <p
              className={`text-sm ${
                wasDrawn
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
              }`}
            >
              Data do sorteio: {drawnDate}
            </p>
          )}
        </div>
      </div>

      {/* Numbers Display */}
      <Card>
        <CardHeader>
          <CardTitle>Sua Chave</CardTitle>
          <CardDescription>
            {gameType === "euroMillion"
              ? "5 números + 2 estrelas"
              : "6 números + 1 número especial"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Numbers */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {gameType === "euroMillion" ? "Números (1-50)" : "Números (1-49)"}
            </p>
            <div className="flex flex-wrap gap-2">
              {numbers.map((num) => (
                <div
                  key={num}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-bold text-lg border-2 border-blue-300 dark:border-blue-700"
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
                Estrelas (1-12)
              </p>
              <div className="flex flex-wrap gap-2">
                {stars.map((star) => (
                  <div
                    key={star}
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 font-bold text-lg border-2 border-yellow-300 dark:border-yellow-700"
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
                Número Especial (1-13)
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 font-bold text-lg border-2 border-purple-300 dark:border-purple-700">
                  ◆ {luckyNumber}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Chave</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-muted rounded">
              <span className="text-sm font-medium">Total de números:</span>
              <Badge variant="secondary">{numbers.length}</Badge>
            </div>
            {gameType === "euroMillion" && (
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm font-medium">Estrelas:</span>
                <Badge variant="secondary">{stars?.length || 0}</Badge>
              </div>
            )}
            {gameType === "toto" && (
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm font-medium">Número especial:</span>
                <Badge variant="secondary">{luckyNumber}</Badge>
              </div>
            )}
            <div className="flex justify-between items-center p-2 bg-muted rounded">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={wasDrawn ? "default" : "destructive"}>
                {wasDrawn ? "Sorteada" : "Não sorteada"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KeyCheckerDisplay } from "./KeyCheckerDisplay";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface InteractiveKeyCheckerProps {
  gameType: "euroMillion" | "toto";
}

export function InteractiveKeyChecker({ gameType }: InteractiveKeyCheckerProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedLucky, setSelectedLucky] = useState<number | null>(null);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const maxNumbers = gameType === "euroMillion" ? 5 : 6;
  const maxStars = gameType === "euroMillion" ? 2 : 0;
  const maxRange = gameType === "euroMillion" ? 50 : 49;
  const maxLucky = gameType === "toto" ? 13 : 0;

  // Generate number arrays
  const numberArray = Array.from({ length: maxRange }, (_, i) => i + 1);
  const starArray = gameType === "euroMillion" ? Array.from({ length: 12 }, (_, i) => i + 1) : [];
  const luckyArray = gameType === "toto" ? Array.from({ length: 13 }, (_, i) => i + 1) : [];

  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else if (selectedNumbers.length < maxNumbers) {
      setSelectedNumbers([...selectedNumbers, num]);
    } else {
      toast.error(`Máximo de ${maxNumbers} números permitidos`);
    }
  };

  const toggleStar = (star: number) => {
    if (selectedStars.includes(star)) {
      setSelectedStars(selectedStars.filter((s) => s !== star));
    } else if (selectedStars.length < maxStars) {
      setSelectedStars([...selectedStars, star]);
    } else {
      toast.error(`Máximo de ${maxStars} estrelas permitidas`);
    }
  };

  const handleCheckKey = async () => {
    if (selectedNumbers.length !== maxNumbers) {
      toast.error(`Selecione ${maxNumbers} números`);
      return;
    }

    if (gameType === "euroMillion" && selectedStars.length !== maxStars) {
      toast.error(`Selecione ${maxStars} estrelas`);
      return;
    }

    if (gameType === "toto" && selectedLucky === null) {
      toast.error("Selecione o número especial");
      return;
    }

    setIsChecking(true);
    try {
      const endpoint =
        gameType === "euroMillion"
          ? "/api/trpc/lottery.euroMillion.checkKey"
          : "/api/trpc/lottery.toto.checkKey";

      const body =
        gameType === "euroMillion"
          ? { 0: { numbers: selectedNumbers.sort((a, b) => a - b), stars: selectedStars.sort((a, b) => a - b) } }
          : { 0: { numbers: selectedNumbers.sort((a, b) => a - b), luckyNumber: selectedLucky } };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      const data = await response.json();
      setCheckResult(data.result?.data);

      if (data.result?.data?.wasDrawn) {
        toast.success("🎉 Chave foi sorteada!");
      } else {
        toast.info("Chave não foi encontrada no histórico");
      }
    } catch (error) {
      console.error("Erro ao verificar chave:", error);
      toast.error("Erro ao verificar chave");
    } finally {
      setIsChecking(false);
    }
  };

  const handleReset = () => {
    setSelectedNumbers([]);
    setSelectedStars([]);
    setSelectedLucky(null);
    setCheckResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Numbers Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Selecione {maxNumbers} Números ({gameType === "euroMillion" ? "1-50" : "1-49"})
            </span>
            <Badge variant="secondary">
              Selecionados: {selectedNumbers.length}/{maxNumbers}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {numberArray.map((num) => (
              <button
                key={num}
                onClick={() => toggleNumber(num)}
                className={`p-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  selectedNumbers.includes(num)
                    ? "bg-blue-500 dark:bg-blue-600 text-white border-2 border-blue-700 scale-105"
                    : "bg-slate-700 dark:bg-slate-600 text-slate-100 hover:bg-slate-600 dark:hover:bg-slate-500 border-2 border-slate-600 dark:border-slate-500"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stars Selection (EuroMillion only) */}
      {gameType === "euroMillion" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selecione 2 Estrelas (1-12)</span>
              <Badge variant="secondary">
                Selecionadas: {selectedStars.length}/2
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {starArray.map((star) => (
                <button
                  key={star}
                  onClick={() => toggleStar(star)}
                  className={`p-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-1 ${
                    selectedStars.includes(star)
                      ? "bg-yellow-500 dark:bg-yellow-600 text-white border-2 border-yellow-700 scale-105"
                      : "bg-slate-700 dark:bg-slate-600 text-slate-100 hover:bg-slate-600 dark:hover:bg-slate-500 border-2 border-slate-600 dark:border-slate-500"
                  }`}
                >
                  ⭐ {star}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lucky Number Selection (Totoloto only) */}
      {gameType === "toto" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selecione o Número Especial (1-13)</span>
              <Badge variant="secondary">
                {selectedLucky ? `Selecionado: ${selectedLucky}` : "Nenhum"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-13 gap-2">
              {luckyArray.map((lucky) => (
                <button
                  key={lucky}
                  onClick={() => setSelectedLucky(selectedLucky === lucky ? null : lucky)}
                  className={`p-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-1 ${
                    selectedLucky === lucky
                      ? "bg-purple-500 dark:bg-purple-600 text-white border-2 border-purple-700 scale-105"
                      : "bg-slate-700 dark:bg-slate-600 text-slate-100 hover:bg-slate-600 dark:hover:bg-slate-500 border-2 border-slate-600 dark:border-slate-500"
                  }`}
                >
                  ◆ {lucky}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleCheckKey}
          disabled={
            isChecking ||
            selectedNumbers.length !== maxNumbers ||
            (gameType === "euroMillion" && selectedStars.length !== maxStars) ||
            (gameType === "toto" && selectedLucky === null)
          }
          className="flex-1"
          size="lg"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {isChecking ? "Verificando..." : "Verificar Chave"}
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          size="lg"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Limpar
        </Button>
      </div>

      {/* Result Display */}
      {checkResult && (
        <KeyCheckerDisplay
          gameType={gameType}
          numbers={
            gameType === "euroMillion"
              ? [
                  checkResult.number1,
                  checkResult.number2,
                  checkResult.number3,
                  checkResult.number4,
                  checkResult.number5,
                ]
              : [
                  checkResult.number1,
                  checkResult.number2,
                  checkResult.number3,
                  checkResult.number4,
                  checkResult.number5,
                  checkResult.number6,
                ]
          }
          stars={gameType === "euroMillion" ? [checkResult.star1, checkResult.star2] : undefined}
          luckyNumber={gameType === "toto" ? checkResult.luckyNumber : undefined}
          wasDrawn={checkResult.wasDrawn}
          drawnDate={checkResult.drawnDate}
        />
      )}
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface KeyCheckerProps {
  gameType: "euroMillion" | "toto";
}

export default function KeyChecker({ gameType }: KeyCheckerProps) {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [stars, setStars] = useState<number[]>([]);
  const [luckyNumber, setLuckyNumber] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const isEuroMillion = gameType === "euroMillion";
  const maxNumber = isEuroMillion ? 50 : 49;
  const numberCount = isEuroMillion ? 5 : 6;
  const starCount = isEuroMillion ? 2 : 1;

  const checkEuroMillion = trpc.lottery.euroMillion.checkKey.useQuery(
    { numbers, stars: stars as [number, number] },
    { enabled: false }
  );

  const checkToto = trpc.lottery.toto.checkKey.useQuery(
    { numbers, luckyNumber: luckyNumber || 1 },
    { enabled: false }
  );

  const handleNumberClick = (num: number) => {
    if (numbers.includes(num)) {
      setNumbers(numbers.filter((n) => n !== num));
    } else if (numbers.length < numberCount) {
      setNumbers([...numbers, num].sort((a, b) => a - b));
    }
  };

  const handleStarClick = (star: number) => {
    if (stars.includes(star)) {
      setStars(stars.filter((s) => s !== star));
    } else if (stars.length < starCount) {
      setStars([...stars, star].sort((a, b) => a - b));
    }
  };

  const handleLuckyClick = (lucky: number) => {
    setLuckyNumber(luckyNumber === lucky ? null : lucky);
  };

  const handleCheck = async () => {
    setError(null);
    setResult(null);

    if (isEuroMillion) {
      if (numbers.length !== 5 || stars.length !== 2) {
        setError("Selecione 5 números e 2 estrelas");
        return;
      }
      const res = await checkEuroMillion.refetch();
      if (res.data) setResult(res.data);
    } else {
      if (numbers.length !== 6 || luckyNumber === null) {
        setError("Selecione 6 números e 1 número especial");
        return;
      }
      const res = await checkToto.refetch();
      if (res.data) setResult(res.data);
    }
  };

  const handleClear = () => {
    setNumbers([]);
    setStars([]);
    setLuckyNumber(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Verificador de Chaves</h3>

        {/* Numbers Grid */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">
            {isEuroMillion ? "Números (1-50)" : "Números (1-49)"}
            <span className="text-muted-foreground ml-2">
              ({numbers.length}/{numberCount})
            </span>
          </label>
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
            {Array.from({ length: maxNumber }, (_, i) => i + 1).map((num) => (
              <motion.button
                key={num}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumberClick(num)}
                className={`w-full aspect-square rounded-lg font-semibold transition-all ${
                  numbers.includes(num)
                    ? isEuroMillion
                      ? "euro-number scale-110 shadow-lg"
                      : "toto-number scale-110 shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-accent/10"
                }`}
              >
                {num}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Stars for EuroMillion */}
        {isEuroMillion && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Estrelas (1-12)
              <span className="text-muted-foreground ml-2">
                ({stars.length}/2)
              </span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((star) => (
                <motion.button
                  key={star}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleStarClick(star)}
                  className={`w-full aspect-square rounded-lg font-semibold transition-all ${
                    stars.includes(star)
                      ? "euro-star scale-110 shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-accent/10"
                  }`}
                >
                  ★ {star}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Lucky Number for Toto */}
        {!isEuroMillion && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Número Especial (1-13)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {Array.from({ length: 13 }, (_, i) => i + 1).map((lucky) => (
                <motion.button
                  key={lucky}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLuckyClick(lucky)}
                  className={`w-full aspect-square rounded-lg font-semibold transition-all ${
                    luckyNumber === lucky
                      ? "toto-lucky scale-110 shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-accent/10"
                  }`}
                >
                  ◆ {lucky}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 rounded-lg"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-lg mb-4 ${
              result.wasDrawn
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              {result.wasDrawn ? (
                <>
                  <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
                  <span className="font-semibold text-green-700 dark:text-green-200">
                    Chave Sorteada!
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="text-blue-600 dark:text-blue-400" size={24} />
                  <span className="font-semibold text-blue-700 dark:text-blue-200">
                    Chave Não Sorteada
                  </span>
                </>
              )}
            </div>
            {result.wasDrawn && result.drawnDate && (
              <p className="text-sm text-green-600 dark:text-green-300">
                Data do sorteio: {result.drawnDate}
              </p>
            )}
          </motion.div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleCheck}
            className="flex-1"
            disabled={
              isEuroMillion
                ? numbers.length !== 5 || stars.length !== 2
                : numbers.length !== 6 || luckyNumber === null
            }
          >
            Verificar Chave
          </Button>
          <Button onClick={handleClear} variant="outline" className="flex-1">
            Limpar
          </Button>
        </div>
      </Card>
    </div>
  );
}

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface FrequencyItem {
  number: number;
  frequency: number;
}

interface StatisticsProps {
  totalDraws: number;
  topNumbers: FrequencyItem[];
  bottomNumbers: FrequencyItem[];
  topStars?: FrequencyItem[];
  bottomStars?: FrequencyItem[];
  topLuckyNumbers?: FrequencyItem[];
  bottomLuckyNumbers?: FrequencyItem[];
  isLoading: boolean;
  gameType: "euroMillion" | "toto";
}

export default function Statistics({
  totalDraws,
  topNumbers,
  bottomNumbers,
  topStars,
  bottomStars,
  topLuckyNumbers,
  bottomLuckyNumbers,
  isLoading,
  gameType,
}: StatisticsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Total Draws */}
      <motion.div variants={item} className="lottery-card">
        <h3 className="text-lg font-semibold mb-2">Total de Sorteios</h3>
        <p className="text-3xl font-bold text-accent">{totalDraws}</p>
      </motion.div>

      {/* Top Numbers */}
      <motion.div variants={item} className="lottery-card">
        <h3 className="text-lg font-semibold mb-4">Números Mais Frequentes</h3>
        <div className="flex flex-wrap gap-3">
          {topNumbers.map((freq) => (
            <div
              key={freq.number}
              className={`flex flex-col items-center ${
                gameType === "euroMillion" ? "euro-number" : "toto-number"
              }`}
            >
              <span className="text-lg font-bold">{freq.number}</span>
              <span className="text-xs opacity-75">{freq.frequency}x</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom Numbers */}
      <motion.div variants={item} className="lottery-card">
        <h3 className="text-lg font-semibold mb-4">Números Menos Frequentes</h3>
        <div className="flex flex-wrap gap-3">
          {bottomNumbers.map((freq) => (
            <div
              key={freq.number}
              className={`flex flex-col items-center opacity-60 ${
                gameType === "euroMillion" ? "euro-number" : "toto-number"
              }`}
            >
              <span className="text-lg font-bold">{freq.number}</span>
              <span className="text-xs opacity-75">{freq.frequency}x</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stars for EuroMillion */}
      {gameType === "euroMillion" && topStars && bottomStars && (
        <>
          <motion.div variants={item} className="lottery-card">
            <h3 className="text-lg font-semibold mb-4">Estrelas Mais Frequentes</h3>
            <div className="flex flex-wrap gap-3">
              {topStars.map((freq) => (
                <div key={freq.number} className="euro-star flex flex-col items-center">
                  <span className="text-lg font-bold">★ {freq.number}</span>
                  <span className="text-xs opacity-75">{freq.frequency}x</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item} className="lottery-card">
            <h3 className="text-lg font-semibold mb-4">Estrelas Menos Frequentes</h3>
            <div className="flex flex-wrap gap-3">
              {bottomStars.map((freq) => (
                <div
                  key={freq.number}
                  className="euro-star flex flex-col items-center opacity-60"
                >
                  <span className="text-lg font-bold">★ {freq.number}</span>
                  <span className="text-xs opacity-75">{freq.frequency}x</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* Lucky Numbers for Toto */}
      {gameType === "toto" && topLuckyNumbers && bottomLuckyNumbers && (
        <>
          <motion.div variants={item} className="lottery-card">
            <h3 className="text-lg font-semibold mb-4">Números Especiais Mais Frequentes</h3>
            <div className="flex flex-wrap gap-3">
              {topLuckyNumbers.map((freq) => (
                <div key={freq.number} className="toto-lucky flex flex-col items-center">
                  <span className="text-lg font-bold">◆ {freq.number}</span>
                  <span className="text-xs opacity-75">{freq.frequency}x</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item} className="lottery-card">
            <h3 className="text-lg font-semibold mb-4">Números Especiais Menos Frequentes</h3>
            <div className="flex flex-wrap gap-3">
              {bottomLuckyNumbers.map((freq) => (
                <div
                  key={freq.number}
                  className="toto-lucky flex flex-col items-center opacity-60"
                >
                  <span className="text-lg font-bold">◆ {freq.number}</span>
                  <span className="text-xs opacity-75">{freq.frequency}x</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

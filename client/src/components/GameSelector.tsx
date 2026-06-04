import { useState } from "react";
import { motion } from "framer-motion";

interface GameSelectorProps {
  selectedGame: "euroMillion" | "toto";
  onGameChange: (game: "euroMillion" | "toto") => void;
  euroLogo: string;
  totoLogo: string;
}

export default function GameSelector({
  selectedGame,
  onGameChange,
  euroLogo,
  totoLogo,
}: GameSelectorProps) {
  return (
    <div className="flex gap-4 justify-center mb-8">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onGameChange("euroMillion")}
        className={`game-selector-btn transition-all duration-300 ${
          selectedGame === "euroMillion"
            ? "active bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 border-2 border-blue-400 dark:border-blue-500"
            : "inactive bg-card border border-border hover:border-blue-300 dark:hover:border-blue-600"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <img
            src={euroLogo}
            alt="EuroMilhões"
            className="h-12 w-auto"
          />
          <span className="text-sm font-semibold">EuroMilhões</span>
        </div>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onGameChange("toto")}
        className={`game-selector-btn transition-all duration-300 ${
          selectedGame === "toto"
            ? "active bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 border-2 border-green-400 dark:border-green-500"
            : "inactive bg-card border border-border hover:border-green-300 dark:hover:border-green-600"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <img
            src={totoLogo}
            alt="Totoloto"
            className="h-12 w-auto"
          />
          <span className="text-sm font-semibold">Totoloto</span>
        </div>
      </motion.button>
    </div>
  );
}

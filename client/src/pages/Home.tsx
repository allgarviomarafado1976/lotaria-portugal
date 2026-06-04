import { useState } from "react";
import { motion } from "framer-motion";
import GameSelector from "@/components/GameSelector";
import Statistics from "@/components/Statistics";
import KeyChecker from "@/components/KeyChecker";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EURO_LOGO = "/manus-storage/euromilhoes-logo_c6393cb1.png";
const TOTO_LOGO = "/manus-storage/totoloto-logo_662b8601.png";

export default function Home() {
  const [selectedGame, setSelectedGame] = useState<"euroMillion" | "toto">("euroMillion");

  // Queries
  const euroStats = trpc.lottery.euroMillion.getStatistics.useQuery();
  const totoStats = trpc.lottery.toto.getStatistics.useQuery();

  const stats = selectedGame === "euroMillion" ? euroStats : totoStats;

  const statsData = stats.data as any;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="container py-6">
          <div className="flex items-center justify-center mb-2">
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center' }}>
              Lotaria <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">Portugal</span>
            </h1>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#4b5563' }}>
            Análise completa de resultados do EuroMilhões e Totoloto
          </p>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem', maxWidth: '80rem' }}>
        {/* Game Selector */}
        <GameSelector
          selectedGame={selectedGame}
          onGameChange={setSelectedGame}
          euroLogo={EURO_LOGO}
          totoLogo={TOTO_LOGO}
        />

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="statistics" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
              <TabsTrigger value="checker">Verificador</TabsTrigger>
              <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
            </TabsList>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-6">
              <Statistics
                totalDraws={statsData?.totalDraws || 0}
                topNumbers={statsData?.topNumbers || []}
                bottomNumbers={statsData?.bottomNumbers || []}
                topStars={statsData?.topStars}
                bottomStars={statsData?.bottomStars}
                topLuckyNumbers={statsData?.topLuckyNumbers}
                bottomLuckyNumbers={statsData?.bottomLuckyNumbers}
                isLoading={stats.isLoading}
                gameType={selectedGame}
              />
            </TabsContent>

            {/* Key Checker Tab */}
            <TabsContent value="checker">
              <KeyChecker gameType={selectedGame} />
            </TabsContent>

            {/* Suggestions Tab */}
            <TabsContent value="suggestions">
              <SuggestionsTab gameType={selectedGame} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-16"
      >
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#4b5563' }}>
          <p>© 2026 Lotaria Portugal. Dados fornecidos pelos Jogos Santa Casa.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
            Esta aplicação é para fins informativos. Consulte sempre as fontes oficiais.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}

function SuggestionsTab({ gameType }: { gameType: "euroMillion" | "toto" }) {
  const [strategy, setStrategy] = useState<"hot" | "cold" | "balanced">("balanced");

  const euroSuggestion = trpc.lottery.euroMillion.suggestKey.useQuery(
    { strategy },
    { enabled: gameType === "euroMillion" }
  );

  const totoSuggestion = trpc.lottery.toto.suggestKey.useQuery(
    { strategy },
    { enabled: gameType === "toto" }
  );

  const suggestion = gameType === "euroMillion" ? euroSuggestion : totoSuggestion;
  const isEuroMillion = gameType === "euroMillion";
  const suggestionData = suggestion.data as any;

  const strategyLabels = {
    hot: "Números Quentes",
    cold: "Números Frios",
    balanced: "Combinação Equilibrada",
  };

  const strategyDescriptions = {
    hot: "Baseado nos números que mais frequentemente foram sorteados",
    cold: "Baseado nos números que menos frequentemente foram sorteados",
    balanced: "Combinação de números quentes e frios para equilíbrio",
  };

  return (
    <div className="space-y-6">
      {/* Strategy Selector */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Selecione uma Estratégia</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["hot", "cold", "balanced"] as const).map((strat) => (
            <motion.button
              key={strat}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStrategy(strat)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                strategy === strat
                  ? strat === "hot"
                    ? "strategy-hot border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20"
                    : strat === "cold"
                    ? "strategy-cold border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "strategy-balanced border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <p className="font-semibold text-sm">{strategyLabels[strat]}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {strategyDescriptions[strat]}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Suggestion Result */}
      {suggestionData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`strategy-badge ${
                strategy === "hot"
                  ? "strategy-hot"
                  : strategy === "cold"
                  ? "strategy-cold"
                  : "strategy-balanced"
              }`}
            >
              {strategyLabels[strategy]}
            </span>
          </div>

          <h4 className="font-semibold mb-3">Números Sugeridos</h4>
          <div className="flex flex-wrap gap-2 mb-6">
            {suggestionData.numbers.map((num: number) => (
              <div
                key={num}
                className={`${
                  isEuroMillion ? "euro-number" : "toto-number"
                }`}
              >
                {num}
              </div>
            ))}
          </div>

          {isEuroMillion && suggestionData.stars && (
            <>
              <h4 className="font-semibold mb-3">Estrelas Sugeridas</h4>
              <div className="flex flex-wrap gap-2">
                {suggestionData.stars.map((star: number) => (
                  <div key={star} className="euro-star">
                    ★ {star}
                  </div>
                ))}
              </div>
            </>
          )}

          {!isEuroMillion && suggestionData.luckyNumber && (
            <>
              <h4 className="font-semibold mb-3">Número Especial Sugerido</h4>
              <div className="flex gap-2">
                <div className="toto-lucky">
                  ◆ {suggestionData.luckyNumber}
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}

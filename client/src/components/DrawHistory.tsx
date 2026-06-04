import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DrawHistoryProps {
  gameType: "euroMillion" | "toto";
}

export default function DrawHistory({ gameType }: DrawHistoryProps) {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const euroHistory = trpc.lottery.euroMillion.getDraws.useQuery(
    { page, limit: pageSize },
    { enabled: gameType === "euroMillion" }
  );

  const totoHistory = trpc.lottery.toto.getDraws.useQuery(
    { page, limit: pageSize },
    { enabled: gameType === "toto" }
  );

  const history = gameType === "euroMillion" ? euroHistory : totoHistory;
  const isEuroMillion = gameType === "euroMillion";
  const draws = (history.data?.draws || []) as any[];
  const total = history.data?.total || 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (history.isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="text-center py-8">
          <p style={{ color: "#4b5563" }}>Carregando histórico...</p>
        </div>
      </div>
    );
  }

  if (!draws || draws.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="text-center py-8">
          <p style={{ color: "#4b5563" }}>Nenhum sorteio encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {draws.map((draw: any, idx: number) => (
            <motion.div
              key={draw.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                    {formatDate(draw.date)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {isEuroMillion ? (
                      <>
                        {[draw.number1, draw.number2, draw.number3, draw.number4, draw.number5].map(
                          (num: number) => (
                            <span
                              key={num}
                              className="euro-number"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "2.5rem",
                                height: "2.5rem",
                                borderRadius: "9999px",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                backgroundColor: "rgb(219 234 254)",
                                color: "rgb(30 58 138)",
                              }}
                            >
                              {num}
                            </span>
                          )
                        )}
                        <span style={{ margin: "0 0.5rem" }}>★</span>
                        {[draw.star1, draw.star2].map((star: number) => (
                          <span
                            key={star}
                            className="euro-star"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "2.5rem",
                              height: "2.5rem",
                              borderRadius: "9999px",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              backgroundColor: "rgb(254 226 226)",
                              color: "rgb(127 29 29)",
                            }}
                          >
                            {star}
                          </span>
                        ))}
                      </>
                    ) : (
                      <>
                        {[draw.number1, draw.number2, draw.number3, draw.number4, draw.number5, draw.number6].map(
                          (num: number) => (
                            <span
                              key={num}
                              className="toto-number"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "2.5rem",
                                height: "2.5rem",
                                borderRadius: "9999px",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                backgroundColor: "rgb(220 252 231)",
                                color: "rgb(20 83 45)",
                              }}
                            >
                              {num}
                            </span>
                          )
                        )}
                        <span style={{ margin: "0 0.5rem" }}>◆</span>
                        <span
                          className="toto-lucky"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "2.5rem",
                            height: "2.5rem",
                            borderRadius: "9999px",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            backgroundColor: "rgb(254 243 199)",
                            color: "rgb(120 53 15)",
                          }}
                        >
                          {draw.luckyNumber}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  {draw.hasWinner ? (
                    <span style={{ color: "#22c55e", fontWeight: 600 }}>✓ Premiado</span>
                  ) : (
                    <span style={{ color: "#ef4444", fontWeight: 600 }}>✗ Sem prémio</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span style={{ fontSize: "0.875rem", color: "#4b5563" }}>
          Página {page} de {totalPages}
        </span>
        <Button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          variant="outline"
          size="sm"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

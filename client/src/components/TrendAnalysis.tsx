import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TrendAnalysisProps {
  gameType: "euroMillion" | "toto";
}

export default function TrendAnalysis({ gameType }: TrendAnalysisProps) {
  const [months, setMonths] = useState(3);

  const euroTrends = trpc.lottery.euroMillion.getStatistics.useQuery(
    undefined,
    { enabled: gameType === "euroMillion" }
  );

  const totoTrends = trpc.lottery.toto.getStatistics.useQuery(
    undefined,
    { enabled: gameType === "toto" }
  );

  const trends = gameType === "euroMillion" ? euroTrends : totoTrends;
  const isEuroMillion = gameType === "euroMillion";
  // Convert top numbers to trend data format
  const data = trends.data?.topNumbers?.map((item: any) => ({
    number: item.number,
    frequency: item.frequency,
  })) || [];

  if (trends.isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="text-center py-8">
          <p style={{ color: "#4b5563" }}>Carregando tendências...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="text-center py-8">
          <p style={{ color: "#4b5563" }}>Sem dados de tendências disponíveis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
      >
        <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
          Números Mais Frequentes
        </h3>
        <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>
          Análise baseada em todos os sorteios registados
        </p>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
      >
        <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
          Frequência de Números
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="number" stroke="#4b5563" />
            <YAxis stroke="#4b5563" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.375rem",
              }}
              labelStyle={{ color: "#000000" }}
            />
            <Legend />
            <Bar
              dataKey="frequency"
              fill={isEuroMillion ? "#3b82f6" : "#22c55e"}
              radius={[8, 8, 0, 0]}
              name="Frequência"
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <p style={{ fontSize: "0.875rem", color: "#4b5563", marginBottom: "0.5rem" }}>
            Número Mais Frequente
          </p>
          <p style={{ fontSize: "1.875rem", fontWeight: 700, color: "#1e40af" }}>
            {data.length > 0 ? data[0].number : "-"}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <p style={{ fontSize: "0.875rem", color: "#4b5563", marginBottom: "0.5rem" }}>
            Frequência Máxima
          </p>
          <p style={{ fontSize: "1.875rem", fontWeight: 700, color: "#22c55e" }}>
            {data.length > 0 ? data[0].frequency : "-"}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <p style={{ fontSize: "0.875rem", color: "#4b5563", marginBottom: "0.5rem" }}>
            Média de Frequência
          </p>
          <p style={{ fontSize: "1.875rem", fontWeight: 700, color: "#f59e0b" }}>
            {data.length > 0
              ? (data.reduce((sum: number, d: any) => sum + d.frequency, 0) / data.length).toFixed(1)
              : "-"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

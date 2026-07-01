import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";

interface NumberAnalysis {
  number: number;
  frequency: number;
  probability: number;
  trend: "hot" | "cold" | "neutral";
  lastDrawn?: string;
}

interface EnhancedSuggestionsDisplayProps {
  gameType: "euroMillion" | "totoloto";
  suggestedNumbers: number[];
  suggestedStars?: number[];
  luckyNumber?: number;
  strategy: "hot" | "cold" | "balanced";
  numberAnalysis: NumberAnalysis[];
  starAnalysis?: NumberAnalysis[];
}

export function EnhancedSuggestionsDisplay({
  gameType,
  suggestedNumbers,
  suggestedStars,
  luckyNumber,
  strategy,
  numberAnalysis,
  starAnalysis,
}: EnhancedSuggestionsDisplayProps) {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "hot":
        return "bg-red-100 text-red-800 border-red-300";
      case "cold":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case "hot":
        return "🔥 Quente";
      case "cold":
        return "❄️ Frio";
      default:
        return "⚖️ Neutro";
    }
  };

  const getStrategyColor = () => {
    switch (strategy) {
      case "hot":
        return "bg-red-500";
      case "cold":
        return "bg-blue-500";
      default:
        return "bg-purple-500";
    }
  };

  const getStrategyLabel = () => {
    switch (strategy) {
      case "hot":
        return "Estratégia Quente";
      case "cold":
        return "Estratégia Fria";
      default:
        return "Estratégia Equilibrada";
    }
  };

  // Preparar dados para gráfico de frequência
  const frequencyData = numberAnalysis
    .filter((n) => suggestedNumbers.includes(n.number))
    .map((n) => ({
      number: n.number,
      frequency: n.frequency,
      probability: Math.round(n.probability * 100),
    }));

  // Preparar dados para scatter plot (frequência vs probabilidade)
  const scatterData = numberAnalysis.map((n) => ({
    number: n.number,
    frequency: n.frequency,
    probability: Math.round(n.probability * 100),
    trend: n.trend,
  }));

  return (
    <div className="space-y-6">
      {/* Header com estratégia */}
      <div className={`${getStrategyColor()} rounded-lg p-4 text-white`}>
        <h3 className="text-lg font-bold">{getStrategyLabel()}</h3>
        <p className="text-sm opacity-90">
          Sugestão baseada em análise estatística de {numberAnalysis.length} sorteios
        </p>
      </div>

      {/* Números sugeridos com análise */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Números Sugeridos com Análise</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {suggestedNumbers.map((num) => {
            const analysis = numberAnalysis.find((n) => n.number === num);
            if (!analysis) return null;

            return (
              <div
                key={num}
                className={`p-3 rounded-lg border-2 ${getTrendColor(analysis.trend)}`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold">{num}</div>
                  <div className="text-xs mt-1">{getTrendLabel(analysis.trend)}</div>
                  <div className="text-xs font-semibold mt-1">
                    {analysis.probability.toFixed(1)}%
                  </div>
                  <div className="text-xs opacity-75">
                    {analysis.frequency}x sorteado
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Estrelas (se EuroMilhões) */}
      {gameType === "euroMillion" && suggestedStars && starAnalysis && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Estrelas Sugeridas</h4>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {suggestedStars.map((star) => {
              const analysis = starAnalysis.find((s) => s.number === star);
              if (!analysis) return null;

              return (
                <div
                  key={star}
                  className={`p-3 rounded-lg border-2 text-center ${getTrendColor(analysis.trend)}`}
                >
                  <div className="text-xl font-bold">⭐ {star}</div>
                  <div className="text-xs mt-1">{analysis.probability.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Número Especial (se Totoloto) */}
      {gameType === "totoloto" && luckyNumber && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Número Especial</h4>
          <div className="flex justify-center">
            <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-800">💎 {luckyNumber}</div>
              <div className="text-sm text-purple-600 mt-2">Número Especial</div>
            </div>
          </div>
        </Card>
      )}

      {/* Gráfico de Frequência */}
      {frequencyData.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Frequência e Probabilidade</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="number" />
              <YAxis yAxisId="left" label={{ value: "Frequência", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Probabilidade (%)", angle: 90, position: "insideRight" }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="frequency" fill="#3b82f6" name="Frequência" />
              <Bar yAxisId="right" dataKey="probability" fill="#ef4444" name="Probabilidade (%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Scatter Plot - Análise Geral */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Análise Geral de Números</h4>
        <p className="text-sm text-gray-600 mb-4">
          Distribuição de frequência vs probabilidade de todos os números
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="frequency" name="Frequência" />
            <YAxis dataKey="probability" name="Probabilidade (%)" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter
              name="Números Frios"
              data={scatterData.filter((d) => d.trend === "cold")}
              fill="#3b82f6"
            />
            <Scatter
              name="Números Quentes"
              data={scatterData.filter((d) => d.trend === "hot")}
              fill="#ef4444"
            />
            <Scatter
              name="Números Neutros"
              data={scatterData.filter((d) => d.trend === "neutral")}
              fill="#6b7280"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </Card>

      {/* Resumo Estatístico */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h4 className="font-semibold mb-4">Resumo Estatístico</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(numberAnalysis.reduce((sum, n) => sum + n.frequency, 0) / numberAnalysis.length).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Frequência Média</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(numberAnalysis.reduce((sum, n) => sum + n.probability, 0) / numberAnalysis.length * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Probabilidade Média</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {numberAnalysis.filter((n) => n.trend === "hot").length}
            </div>
            <div className="text-sm text-gray-600">Números Quentes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {numberAnalysis.filter((n) => n.trend === "cold").length}
            </div>
            <div className="text-sm text-gray-600">Números Frios</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

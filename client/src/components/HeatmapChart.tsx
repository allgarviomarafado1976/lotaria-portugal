import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeatmapChartProps {
  data: Array<{ number: number; frequency: number }>;
  title: string;
  description?: string;
  maxColumns?: number;
  gameType: "euroMillion" | "toto";
}

export function HeatmapChart({ 
  data, 
  title, 
  description,
  maxColumns = 10,
  gameType 
}: HeatmapChartProps) {
  const { maxFrequency, gridData, colorMap } = useMemo(() => {
    if (data.length === 0) {
      return { maxFrequency: 0, gridData: [], colorMap: new Map() };
    }

    const max = Math.max(...data.map(d => d.frequency));
    const map = new Map(data.map(d => [d.number, d.frequency]));

    // Create grid layout
    const maxNum = Math.max(...data.map(d => d.number));
    const cols = Math.min(maxColumns, maxNum);
    const rows = Math.ceil(maxNum / cols);
    
    const grid: Array<Array<{ number: number; frequency: number } | null>> = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        const num = i * cols + j + 1;
        if (num <= maxNum) {
          const freq = map.get(num) || 0;
          row.push({ number: num, frequency: freq });
        } else {
          row.push(null);
        }
      }
      grid.push(row);
    }

    return { maxFrequency: max, gridData: grid, colorMap: map };
  }, [data, maxColumns]);

  const getColor = (frequency: number) => {
    if (maxFrequency === 0) return "bg-gray-100 dark:bg-gray-800";
    
    const intensity = frequency / maxFrequency;
    
    // Color gradient from light to dark based on intensity
    if (intensity === 0) return "bg-gray-50 dark:bg-gray-900";
    if (intensity < 0.2) return "bg-blue-100 dark:bg-blue-900";
    if (intensity < 0.4) return "bg-blue-200 dark:bg-blue-800";
    if (intensity < 0.6) return "bg-blue-400 dark:bg-blue-600";
    if (intensity < 0.8) return "bg-blue-500 dark:bg-blue-500";
    return "bg-blue-600 dark:bg-blue-400";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Frequência:</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700" />
              <span className="text-xs text-muted-foreground">Baixa</span>
              <div className="w-4 h-4 bg-blue-300 dark:bg-blue-700 border border-gray-300 dark:border-gray-700 ml-2" />
              <span className="text-xs text-muted-foreground">Média</span>
              <div className="w-4 h-4 bg-blue-600 dark:bg-blue-400 border border-gray-300 dark:border-gray-700 ml-2" />
              <span className="text-xs text-muted-foreground">Alta</span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="inline-block">
              {gridData.map((row, rowIdx) => (
                <div key={rowIdx} className="flex gap-1 mb-1">
                  {row.map((cell, colIdx) => (
                    cell ? (
                      <TooltipProvider key={`${rowIdx}-${colIdx}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-10 h-10 rounded-md flex items-center justify-center font-semibold text-sm cursor-pointer transition-all hover:scale-110 border border-gray-200 dark:border-gray-700 ${getColor(cell.frequency)}`}
                            >
                              {cell.number}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <p className="font-semibold">Número {cell.number}</p>
                              <p>Frequência: {cell.frequency}x</p>
                              <p className="text-xs text-gray-400">
                                {((cell.frequency / maxFrequency) * 100).toFixed(1)}% do máximo
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <div key={`${rowIdx}-${colIdx}`} className="w-10 h-10" />
                    )
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div>
              <p className="text-xs text-muted-foreground">Total de Números</p>
              <p className="text-lg font-semibold">{data.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Frequência Máxima</p>
              <p className="text-lg font-semibold">{maxFrequency}x</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Frequência Média</p>
              <p className="text-lg font-semibold">
                {data.length > 0 ? (data.reduce((sum, d) => sum + d.frequency, 0) / data.length).toFixed(1) : 0}x
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total de Sorteios</p>
              <p className="text-lg font-semibold">
                {data.reduce((sum, d) => sum + d.frequency, 0)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

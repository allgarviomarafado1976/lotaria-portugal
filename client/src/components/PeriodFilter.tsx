import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface PeriodFilterProps {
  selectedPeriod: number;
  onPeriodChange: (months: number) => void;
}

export function PeriodFilter({ selectedPeriod, onPeriodChange }: PeriodFilterProps) {
  const periods = [
    { label: "Último mês", months: 1 },
    { label: "Últimos 3 meses", months: 3 },
    { label: "Últimos 6 meses", months: 6 },
    { label: "Últimos 12 meses", months: 12 },
    { label: "Todos os dados", months: 999 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Período de Análise
        </CardTitle>
        <CardDescription>Selecione o período para visualizar as estatísticas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {periods.map((period) => (
            <Button
              key={period.months}
              onClick={() => onPeriodChange(period.months)}
              variant={selectedPeriod === period.months ? "default" : "outline"}
              className="transition-all"
              size="sm"
            >
              {period.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

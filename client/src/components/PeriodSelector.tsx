import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export type PeriodType = "day" | "month" | "year";

interface PeriodSelectorProps {
  period: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
}

export function PeriodSelector({ period, onPeriodChange }: PeriodSelectorProps) {
  const periods: { value: PeriodType; label: string }[] = [
    { value: "day", label: "Jour" },
    { value: "month", label: "Mois" },
    { value: "year", label: "Année" },
  ];

  return (
    <div className="flex items-center gap-2">
      <Calendar size={16} className="text-muted-foreground" />
      <div className="flex gap-1 bg-muted p-1 rounded-lg">
        {periods.map(({ value, label }) => (
          <Button
            key={value}
            variant={period === value ? "default" : "ghost"}
            size="sm"
            className="text-xs"
            onClick={() => onPeriodChange(value)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}

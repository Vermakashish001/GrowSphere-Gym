
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  nextClass?: {
    time: string;
    name: string;
  };
  Icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  change,
  isPositive,
  nextClass,
  Icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl p-4 sm:p-6 border border-border bg-card shadow-sm flex flex-col gap-3 min-h-[140px] sm:min-h-[160px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
          {title}
        </h3>
        <span className="text-primary bg-primary/10 rounded-lg p-1.5 sm:p-2">
          <Icon size={20} className="sm:w-[22px] sm:h-[22px]" />
        </span>
      </div>
      <div className="mb-1">
        <p className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
          {value}
        </p>
      </div>
      {change && (
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            isPositive
              ? "bg-success/20 text-success"
              : "bg-destructive/20 text-destructive"
          }`}
        >
          <span>{isPositive ? "▲" : "▼"}</span>
          <span>{change}</span>
        </div>
      )}
      {nextClass && (
        <div className="flex items-center gap-2 text-muted-foreground mt-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path strokeWidth="2" d="M12 6v6l4 2" />
          </svg>
          <span className="text-xs">
            Next: {nextClass.time} • {nextClass.name}
          </span>
        </div>
      )}
    </div>
  );
}

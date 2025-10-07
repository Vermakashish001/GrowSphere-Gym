"use client";

interface MemberGrowthChartProps {
  data: Array<{ month: string; count: number }>;
}

export default function MemberGrowthChart({ data }: MemberGrowthChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="rounded-2xl p-6 border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold mb-1 text-foreground">
            Member Growth
          </h3>
          <p className="text-xs text-muted-foreground">
            Last 12 months
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">
            Active members
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between gap-2 h-56">
        {data.map((item, index) => {
          const heightPercent = (item.count / maxCount) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              {/* Bar */}
              <div
                className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer bg-primary"
                style={{
                  height: `${heightPercent}%`,
                  minHeight: "18px",
                }}
                title={`${item.month}: ${item.count} members`}
              />
              {/* Month Label */}
              <span className="text-xs text-muted-foreground">
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

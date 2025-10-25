
import { Zap, Dumbbell, HeartPulse } from "lucide-react";
import type { ComponentType, SVGProps } from "react";


const iconMap: { [key: string]: ComponentType<SVGProps<SVGSVGElement>> } = {
  Zap,
  Dumbbell,
  HeartPulse,
};

interface WeeklyOverviewProps {
  calendar: {
    startDate: string;
    endDate: string;
    currentDay: number;
  };
  classes: Array<{
    name: string;
    day: string;
    time: string;
    icon: string;
  }>;
}

export default function WeeklyOverview({ calendar, classes }: WeeklyOverviewProps) {
  const days = [
    { name: "Sun", date: 6 },
    { name: "Mon", date: 7 },
    { name: "Tue", date: 8 },
    { name: "Wed", date: 9 },
    { name: "Thu", date: 10 },
    { name: "Fri", date: 11 },
    { name: "Sat", date: 12 },
  ];

  return (
    <div className="rounded-2xl p-4 sm:p-6 border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-foreground">This Week</h3>
          <p className="text-xs text-muted-foreground">Classes & events</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {calendar.startDate} - {calendar.endDate}
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-4">
        {days.map((day, index) => {
          const isToday = day.date === calendar.currentDay;
          return (
            <div
              key={index}
              className={`flex flex-col items-center gap-0.5 sm:gap-1 p-1 sm:p-2 rounded-lg cursor-pointer transition-colors font-semibold text-xs min-w-[30px] sm:min-w-[36px] min-h-[40px] sm:min-h-[48px] ${
                isToday
                  ? "border-2 border-primary bg-primary/10 text-primary"
                  : "text-foreground bg-secondary hover:bg-secondary/80"
              }`}
            >
              <span
                className={`text-[10px] sm:text-xs font-medium ${
                  isToday ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {day.name}
              </span>
              <span
                className={`text-sm sm:text-base font-bold ${
                  isToday ? "text-primary" : "text-foreground"
                }`}
              >
                {day.date}
              </span>
            </div>
          );
        })}
      </div>

      {/* Weekly Schedule List */}
      <div className="space-y-2">
        {classes.map((classItem, index) => {
          const IconComponent = iconMap[classItem.icon];
          return (
            <div
              key={index}
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-base sm:text-xl text-primary flex-shrink-0">
                  {IconComponent && <IconComponent width={18} height={18} className="sm:w-[22px] sm:h-[22px]" />}
                </span>
                <span className="font-medium text-sm sm:text-base text-foreground truncate">
                  {classItem.name}
                </span>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground whitespace-nowrap">
                  {classItem.day} • {classItem.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

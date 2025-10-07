
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
    <div className="rounded-2xl p-6 border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">This Week</h3>
          <p className="text-xs text-muted-foreground">Classes & events</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {calendar.startDate} - {calendar.endDate}
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {days.map((day, index) => {
          const isToday = day.date === calendar.currentDay;
          return (
            <div
              key={index}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-colors font-semibold text-xs min-w-[36px] min-h-[48px] ${
                isToday
                  ? "border-2 border-primary bg-primary/10 text-primary"
                  : "text-foreground bg-secondary hover:bg-secondary/80"
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  isToday ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {day.name}
              </span>
              <span
                className={`text-base font-bold ${
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
              className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl text-primary">
                  {IconComponent && <IconComponent width={22} height={22} />}
                </span>
                <span className="font-medium text-foreground">
                  {classItem.name}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-muted-foreground">
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

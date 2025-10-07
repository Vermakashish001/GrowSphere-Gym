
"use client";

import { Zap, Dumbbell, HeartPulse } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

const iconMap: { [key: string]: ComponentType<SVGProps<SVGSVGElement>> } = {
  Zap,
  Dumbbell,
  HeartPulse,
};

interface WeeklyScheduleProps {
  classes: Array<{
    name: string;
    day: string;
    time: string;
    icon: string;
  }>;
}

export default function WeeklySchedule({ classes }: WeeklyScheduleProps) {
  return (
    <div className="rounded-2xl p-6 border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Weekly Schedule</h3>
      </div>
      <div className="space-y-3">
        {classes.map((classItem, index) => {
          const IconComponent = iconMap[classItem.icon];
          return (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/80 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-xl text-primary">
                  {IconComponent && <IconComponent width={22} height={22} />}
                </span>
                <span className="font-medium text-foreground">
                  {classItem.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-semibold">
                {classItem.day} • {classItem.time}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
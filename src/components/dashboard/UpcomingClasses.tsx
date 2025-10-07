import Image from "next/image";

interface UpcomingClassesProps {
  classes: Array<{
    name: string;
    instructor: string;
    day: string;
    time: string;
    avatar: string;
  }>;
}

export default function UpcomingClasses({ classes }: UpcomingClassesProps) {
  return (
    <div className="rounded-2xl p-6 border border-border bg-card shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-foreground">
        Upcoming Classes
      </h3>
      <div className="space-y-3">
        {classes.map((classItem, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
                <Image
                  src={classItem.avatar}
                  alt={classItem.instructor}
                  fill
                  className="object-cover"
                />
              </div>
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
        ))}
      </div>
    </div>
  );
}

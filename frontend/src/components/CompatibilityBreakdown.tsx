import { Target, Briefcase, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompatibilityBreakdownProps {
  breakdown: {
    skillMatch: number;
    projectRelevance: number;
    experience: number;
    activityConsistency: number;
  };
  className?: string;
}

const breakdownItems = [
  {
    key: "skillMatch" as const,
    label: "Skill Match",
    description: "How well skills align with requirements",
    icon: Target,
  },
  {
    key: "projectRelevance" as const,
    label: "Project Relevance",
    description: "Relevant project experience",
    icon: Briefcase,
  },
  {
    key: "experience" as const,
    label: "Experience Level",
    description: "Years and depth of experience",
    icon: Clock,
  },
  {
    key: "activityConsistency" as const,
    label: "Activity Consistency",
    description: "Regular coding activity patterns",
    icon: Activity,
  },
];

export function CompatibilityBreakdown({
  breakdown,
  className,
}: CompatibilityBreakdownProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-success";
    if (score >= 75) return "bg-primary";
    if (score >= 50) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {breakdownItems.map((item) => {
        const score = breakdown[item.key];
        const Icon = item.icon;

        return (
          <div key={item.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {item.label}
                </span>
              </div>
              <span className="text-sm font-bold text-foreground">{score}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  getScoreColor(score)
                )}
                style={{ width: `${score}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </div>
        );
      })}
    </div>
  );
}

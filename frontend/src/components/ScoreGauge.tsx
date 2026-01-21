import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ScoreGauge({
  score,
  size = "md",
  label,
  showPercentage = true,
  className,
}: ScoreGaugeProps) {
  const sizeConfig = {
    sm: { width: 60, strokeWidth: 6, fontSize: "text-sm" },
    md: { width: 100, strokeWidth: 8, fontSize: "text-xl" },
    lg: { width: 140, strokeWidth: 10, fontSize: "text-3xl" },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "stroke-success";
    if (score >= 75) return "stroke-primary";
    if (score >= 50) return "stroke-warning";
    return "stroke-destructive";
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg
          className="transform -rotate-90"
          width={config.width}
          height={config.width}
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            className={cn(getScoreColor(score), "transition-all duration-1000 ease-out")}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("font-bold text-foreground", config.fontSize)}>
              {score}
            </span>
          </div>
        )}
      </div>
      {label && (
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      )}
    </div>
  );
}

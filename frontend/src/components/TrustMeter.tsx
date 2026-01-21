import { cn } from "@/lib/utils";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";

interface TrustMeterProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function TrustMeter({
  score,
  size = "md",
  showLabel = true,
  className,
}: TrustMeterProps) {
  const sizeConfig = {
    sm: { height: "h-2", iconSize: 14, textSize: "text-xs" },
    md: { height: "h-3", iconSize: 18, textSize: "text-sm" },
    lg: { height: "h-4", iconSize: 24, textSize: "text-base" },
  };

  const config = sizeConfig[size];

  const getTrustLevel = (score: number) => {
    if (score >= 90) return { label: "Highly Trusted", color: "bg-success", icon: ShieldCheck };
    if (score >= 75) return { label: "Trusted", color: "bg-primary", icon: Shield };
    if (score >= 50) return { label: "Moderate", color: "bg-warning", icon: Shield };
    return { label: "Low Trust", color: "bg-destructive", icon: ShieldAlert };
  };

  const trustInfo = getTrustLevel(score);
  const Icon = trustInfo.icon;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon size={config.iconSize} className="text-primary" />
            <span className={cn("font-medium text-foreground", config.textSize)}>
              Trust Score
            </span>
          </div>
          <span className={cn("font-bold text-foreground", config.textSize)}>
            {score}%
          </span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-muted/50 overflow-hidden", config.height)}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out trust-gradient"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn("text-muted-foreground", config.textSize)}>
          {trustInfo.label}
        </span>
      )}
    </div>
  );
}

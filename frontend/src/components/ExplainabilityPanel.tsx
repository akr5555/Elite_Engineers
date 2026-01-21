import { Lightbulb, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplainabilityPanelProps {
  highlights: string[];
  compatibilityScore: number;
  className?: string;
}

export function ExplainabilityPanel({
  highlights,
  compatibilityScore,
  className,
}: ExplainabilityPanelProps) {
  const getRecommendationStrength = (score: number) => {
    if (score >= 90) return { level: "Highly Recommended", color: "text-success", bg: "bg-success/10" };
    if (score >= 75) return { level: "Recommended", color: "text-primary", bg: "bg-primary/10" };
    if (score >= 50) return { level: "Consider", color: "text-warning", bg: "bg-warning/10" };
    return { level: "Review Needed", color: "text-destructive", bg: "bg-destructive/10" };
  };

  const recommendation = getRecommendationStrength(compatibilityScore);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Recommendation Badge */}
      <div
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium",
          recommendation.bg,
          recommendation.color
        )}
      >
        {compatibilityScore >= 75 ? (
          <CheckCircle size={18} />
        ) : (
          <AlertCircle size={18} />
        )}
        {recommendation.level}
      </div>

      {/* Why This Engineer Section */}
      <div className="card-elevated p-4">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={18} className="text-warning" />
          <h4 className="font-medium text-foreground">
            Why This Engineer is Recommended
          </h4>
        </div>

        <div className="space-y-3">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp size={12} className="text-primary" />
              </div>
              <p className="text-sm text-foreground">{highlight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contribution Explanation */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
        <h5 className="text-sm font-medium text-foreground mb-2">
          📊 Score Calculation
        </h5>
        <p className="text-sm text-muted-foreground">
          The compatibility score is calculated based on real GitHub activity,
          including commit history, project complexity, language expertise, and
          consistency of contributions. This ensures authenticity and proof-of-work
          over superficial metrics.
        </p>
      </div>
    </div>
  );
}

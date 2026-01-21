import {
  GitCommit,
  Star,
  Flame,
  Mail,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustEvidenceProps {
  evidence: {
    recentCommits: number;
    popularRepos: string[];
    contributionStreak: number;
    verifiedEmail: boolean;
    profileComplete: boolean;
  };
  className?: string;
}

export function TrustEvidence({ evidence, className }: TrustEvidenceProps) {
  const evidenceItems = [
    {
      icon: GitCommit,
      label: "Recent Commits",
      value: `${evidence.recentCommits} commits`,
      description: "In the last 30 days",
      verified: evidence.recentCommits > 50,
    },
    {
      icon: Flame,
      label: "Contribution Streak",
      value: `${evidence.contributionStreak} days`,
      description: "Consecutive days of activity",
      verified: evidence.contributionStreak > 14,
    },
    {
      icon: Star,
      label: "Popular Repositories",
      value: `${evidence.popularRepos.length} repos`,
      description: evidence.popularRepos.slice(0, 2).join(", "),
      verified: evidence.popularRepos.length > 0,
    },
    {
      icon: Mail,
      label: "Verified Email",
      value: evidence.verifiedEmail ? "Verified" : "Not Verified",
      description: "Email authentication status",
      verified: evidence.verifiedEmail,
    },
    {
      icon: UserCheck,
      label: "Complete Profile",
      value: evidence.profileComplete ? "Complete" : "Incomplete",
      description: "Profile information status",
      verified: evidence.profileComplete,
    },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      {evidenceItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border transition-colors",
              item.verified
                ? "border-success/20 bg-success/5"
                : "border-border bg-muted/20"
            )}
          >
            <div
              className={cn(
                "p-2 rounded-lg",
                item.verified ? "bg-success/10" : "bg-muted"
              )}
            >
              <Icon
                size={18}
                className={item.verified ? "text-success" : "text-muted-foreground"}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {item.label}
                </span>
                {item.verified && (
                  <CheckCircle2 size={14} className="text-success" />
                )}
              </div>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {item.value}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

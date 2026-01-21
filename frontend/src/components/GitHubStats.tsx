import { GitBranch, GitCommit, Code2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

interface GitHubStatsProps {
  totalRepos: number;
  totalCommits: number;
  topLanguages: { name: string; percentage: number; color: string }[];
  recentActivity: { date: string; commits: number }[];
  className?: string;
}

export function GitHubStats({
  totalRepos,
  totalCommits,
  topLanguages,
  recentActivity,
  className,
}: GitHubStatsProps) {
  const stats = [
    {
      label: "Repositories",
      value: totalRepos,
      icon: GitBranch,
    },
    {
      label: "Total Commits",
      value: totalCommits.toLocaleString(),
      icon: GitCommit,
    },
    {
      label: "Languages",
      value: topLanguages.length,
      icon: Code2,
    },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="text-center p-4 rounded-xl bg-muted/30 border border-border"
            >
              <Icon size={24} className="mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Languages Pie Chart */}
        <div className="card-elevated p-4">
          <h4 className="text-sm font-medium text-foreground mb-4">
            Top Languages
          </h4>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topLanguages}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="percentage"
                  >
                    {topLanguages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {topLanguages.slice(0, 4).map((lang) => (
                <div key={lang.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: lang.color }}
                  />
                  <span className="text-sm text-foreground flex-1">
                    {lang.name}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {lang.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="card-elevated p-4">
          <h4 className="text-sm font-medium text-foreground mb-4">
            Recent Activity
          </h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentActivity}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      weekday: "short",
                    })
                  }
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <Bar
                  dataKey="commits"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Engineer, transformEngineerFromAPI } from "@/data/engineers";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { ScoreGauge } from "@/components/ScoreGauge";
import { TrustMeter } from "@/components/TrustMeter";
import { SkillBadge } from "@/components/SkillBadge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { X, Plus, GitBranch, GitCommit, Award, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_COMPARE = 3;

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialIds = searchParams.get("ids")?.split(",").filter(Boolean) || [];
  
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialIds.length > 0 ? initialIds : []
  );

  // Fetch engineers from API
  const { data: engineersData, isLoading } = useQuery({
    queryKey: ['engineers'],
    queryFn: async () => {
      const result = await api.getEngineers({ limit: 100 });
      return result.engineers.map(transformEngineerFromAPI);
    },
    staleTime: 30000,
  });

  const engineers = engineersData || [];

  const selectedEngineers = useMemo(() => {
    return selectedIds
      .map((id) => engineers.find((e) => e.id === id))
      .filter(Boolean) as Engineer[];
  }, [selectedIds, engineers]);

  const availableEngineers = engineers.filter(
    (e) => !selectedIds.includes(e.id)
  );

  const handleAddEngineer = (id: string) => {
    if (selectedIds.length < MAX_COMPARE && !selectedIds.includes(id)) {
      const newIds = [...selectedIds, id];
      setSelectedIds(newIds);
      setSearchParams({ ids: newIds.join(",") });
    }
  };

  const handleRemoveEngineer = (id: string) => {
    const newIds = selectedIds.filter((i) => i !== id);
    setSelectedIds(newIds);
    setSearchParams(newIds.length > 0 ? { ids: newIds.join(",") } : {});
  };

  // Prepare radar chart data for compatibility breakdown
  const radarData = useMemo(() => {
    if (selectedEngineers.length === 0) return [];
    
    return [
      { attribute: "Skill Match", fullMark: 100, ...Object.fromEntries(selectedEngineers.map(e => [e.id, e.compatibilityBreakdown.skillMatch])) },
      { attribute: "Project Relevance", fullMark: 100, ...Object.fromEntries(selectedEngineers.map(e => [e.id, e.compatibilityBreakdown.projectRelevance])) },
      { attribute: "Experience", fullMark: 100, ...Object.fromEntries(selectedEngineers.map(e => [e.id, e.compatibilityBreakdown.experience])) },
      { attribute: "Activity", fullMark: 100, ...Object.fromEntries(selectedEngineers.map(e => [e.id, e.compatibilityBreakdown.activityConsistency])) },
    ];
  }, [selectedEngineers]);

  // Prepare bar chart data for GitHub stats
  const statsData = useMemo(() => {
    return selectedEngineers.map((e) => ({
      name: e.name.split(" ")[0],
      repos: e.totalRepos,
      commits: Math.round(e.totalCommits / 100), // Scale for better visualization
      experience: e.experience,
    }));
  }, [selectedEngineers]);

  // Get all unique skills across selected engineers
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    selectedEngineers.forEach((e) => e.skills.forEach((s) => skills.add(s)));
    return Array.from(skills).sort();
  }, [selectedEngineers]);

  const radarColors = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading engineers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Compare Engineers</h1>
          <p className="text-muted-foreground">
            Select up to {MAX_COMPARE} engineers to compare side by side
          </p>
        </div>

        {/* Engineer Selection */}
        <div className="flex flex-wrap gap-4 mb-8">
          {selectedEngineers.map((engineer, index) => (
            <div
              key={engineer.id}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card"
              style={{ borderColor: radarColors[index] }}
            >
              <img
                src={engineer.avatar}
                alt={engineer.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm font-medium">{engineer.name}</span>
              <button
                onClick={() => handleRemoveEngineer(engineer.id)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {selectedIds.length < MAX_COMPARE && (
            <Select onValueChange={handleAddEngineer}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Add engineer..." />
              </SelectTrigger>
              <SelectContent>
                {availableEngineers.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    <div className="flex items-center gap-2">
                      <img
                        src={e.avatar}
                        alt={e.name}
                        className="w-5 h-5 rounded-full"
                      />
                      {e.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {selectedEngineers.length === 0 ? (
          <div className="text-center py-16 card-elevated">
            <Users size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No engineers selected</h3>
            <p className="text-muted-foreground mb-4">
              Add engineers from the dropdown above to start comparing
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Score Cards Row */}
            <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${selectedEngineers.length}, 1fr)` }}>
              {selectedEngineers.map((engineer, index) => (
                <div 
                  key={engineer.id} 
                  className="card-elevated p-6"
                  style={{ borderTop: `3px solid ${radarColors[index]}` }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={engineer.avatar}
                      alt={engineer.name}
                      className="w-16 h-16 rounded-full ring-2 ring-border"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{engineer.name}</h3>
                      <p className="text-sm text-muted-foreground">{engineer.role}</p>
                      <p className="text-xs text-muted-foreground">{engineer.location}</p>
                    </div>
                  </div>

                  <div className="flex justify-around mb-6">
                    <ScoreGauge
                      score={engineer.compatibilityScore}
                      size="sm"
                      label="Match"
                    />
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-2">
                        <span className="text-lg font-bold">{engineer.trustScore}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Trust</span>
                    </div>
                  </div>

                  <TrustMeter score={engineer.trustScore} size="sm" showLabel={false} />

                  <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-muted/30">
                      <GitBranch size={16} className="mx-auto mb-1 text-primary" />
                      <p className="text-sm font-bold">{engineer.totalRepos}</p>
                      <p className="text-xs text-muted-foreground">Repos</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/30">
                      <GitCommit size={16} className="mx-auto mb-1 text-primary" />
                      <p className="text-sm font-bold">{engineer.totalCommits.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Commits</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Radar Chart - Compatibility Breakdown */}
              <div className="card-elevated p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Award size={18} className="text-primary" />
                  Compatibility Breakdown
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis 
                        dataKey="attribute" 
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      />
                      {selectedEngineers.map((engineer, index) => (
                        <Radar
                          key={engineer.id}
                          name={engineer.name.split(" ")[0]}
                          dataKey={engineer.id}
                          stroke={radarColors[index]}
                          fill={radarColors[index]}
                          fillOpacity={0.15}
                          strokeWidth={2}
                        />
                      ))}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart - Stats Comparison */}
              <div className="card-elevated p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <GitBranch size={18} className="text-primary" />
                  GitHub Stats Comparison
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData}>
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === "commits") return [value * 100, "Commits"];
                          return [value, name.charAt(0).toUpperCase() + name.slice(1)];
                        }}
                      />
                      <Legend />
                      <Bar dataKey="repos" fill="hsl(var(--primary))" name="Repos" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="commits" fill="hsl(var(--success))" name="Commits (×100)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="experience" fill="hsl(var(--warning))" name="Years Exp" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Skill Matrix */}
            <div className="card-elevated p-6">
              <h3 className="font-semibold mb-6">Skill Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Skill
                      </th>
                      {selectedEngineers.map((engineer, index) => (
                        <th 
                          key={engineer.id} 
                          className="text-center py-3 px-4 text-sm font-medium"
                          style={{ color: radarColors[index] }}
                        >
                          {engineer.name.split(" ")[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allSkills.map((skill) => (
                      <tr key={skill} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <SkillBadge skill={skill} variant="secondary" size="sm" />
                        </td>
                        {selectedEngineers.map((engineer, index) => (
                          <td key={engineer.id} className="text-center py-3 px-4">
                            {engineer.skills.includes(skill) ? (
                              <div 
                                className="w-6 h-6 rounded-full mx-auto flex items-center justify-center"
                                style={{ backgroundColor: radarColors[index] }}
                              >
                                <span className="text-white text-xs">✓</span>
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full mx-auto bg-muted/50 flex items-center justify-center">
                                <span className="text-muted-foreground text-xs">–</span>
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trust Evidence Comparison */}
            <div className="card-elevated p-6">
              <h3 className="font-semibold mb-6">Trust Evidence Comparison</h3>
              <div 
                className="grid gap-6" 
                style={{ gridTemplateColumns: `repeat(${selectedEngineers.length}, 1fr)` }}
              >
                {selectedEngineers.map((engineer, index) => (
                  <div key={engineer.id} className="space-y-4">
                    <div 
                      className="text-center py-2 rounded-lg font-medium"
                      style={{ 
                        backgroundColor: `${radarColors[index]}20`,
                        color: radarColors[index] 
                      }}
                    >
                      {engineer.name.split(" ")[0]}
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Recent Commits</span>
                        <span className="font-semibold">{engineer.trustEvidence.recentCommits}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Contribution Streak</span>
                        <span className="font-semibold">{engineer.trustEvidence.contributionStreak} days</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Popular Repos</span>
                        <span className="font-semibold">{engineer.trustEvidence.popularRepos.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Verified Email</span>
                        <span className={cn(
                          "text-sm font-medium",
                          engineer.trustEvidence.verifiedEmail ? "text-success" : "text-muted-foreground"
                        )}>
                          {engineer.trustEvidence.verifiedEmail ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Complete Profile</span>
                        <span className={cn(
                          "text-sm font-medium",
                          engineer.trustEvidence.profileComplete ? "text-success" : "text-muted-foreground"
                        )}>
                          {engineer.trustEvidence.profileComplete ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

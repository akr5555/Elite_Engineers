import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { SearchFilters } from "@/components/SearchFilters";
import { EngineerCard } from "@/components/EngineerCard";
import { Engineer, transformEngineerFromAPI } from "@/data/engineers";
import { api } from "@/services/api";
import { Users, TrendingUp, Award, Zap, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Fetch engineers from API
  const { data: engineersData, isLoading, error } = useQuery({
    queryKey: ['engineers'],
    queryFn: async () => {
      const result = await api.getEngineers({ limit: 100 });
      return {
        engineers: result.engineers.map(transformEngineerFromAPI),
        total: result.total
      };
    },
    staleTime: 30000, // 30 seconds
  });

  const engineers = engineersData?.engineers || [];

  const filteredEngineers = useMemo(() => {
    return engineers.filter((engineer) => {
      // Search query filter
      const matchesSearch =
        searchQuery === "" ||
        engineer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        engineer.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        engineer.skills.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Skills filter
      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.some((skill) =>
          engineer.skills.some(
            (s) => s.toLowerCase() === skill.toLowerCase()
          )
        );

      return matchesSearch && matchesSkills;
    });
  }, [engineers, searchQuery, selectedSkills]);

  const stats = [
    {
      label: "Total Engineers",
      value: engineers.length,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Highly Trusted",
      value: engineers.filter((e) => e.trustScore >= 90).length,
      icon: Award,
      color: "text-success",
    },
    {
      label: "90%+ Match",
      value: engineers.filter((e) => e.compatibilityScore >= 90).length,
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      label: "Active Today",
      value: engineers.filter((e) => e.trustEvidence.contributionStreak > 0).length,
      icon: Zap,
      color: "text-warning",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Find Elite Engineers</h1>
            <p className="text-muted-foreground">
              Discover top developers based on proof-of-work, not just resumes
            </p>
          </div>
          <Button
            onClick={() => navigate("/add-engineer")}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Add Engineer
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="card-elevated p-4 flex items-center gap-4"
              >
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <SearchFilters
          onSearch={setSearchQuery}
          onSkillFilter={setSelectedSkills}
          onExperienceFilter={() => {}}
          onLocationFilter={() => {}}
          selectedSkills={selectedSkills}
          className="mb-8"
        />

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading engineers...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="text-red-500 mb-4">
              <p className="font-medium">Failed to load engineers</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error instanceof Error ? error.message : 'Please try again later'}
              </p>
            </div>
          </div>
        )}

        {/* Results Header */}
        {!isLoading && !error && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {filteredEngineers.length}
                </span>{" "}
                engineers
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sorted by:</span>
                <span className="text-sm font-medium text-foreground">
                  Compatibility Score
                </span>
              </div>
            </div>

            {/* Engineers Grid */}
            {filteredEngineers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEngineers
                  .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
                  .map((engineer) => (
                    <EngineerCard key={engineer.id} engineer={engineer} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No engineers found</h3>
                <p className="text-muted-foreground">
                  {engineers.length === 0 
                    ? "No engineers in the database yet. Add some to get started!"
                    : "Try adjusting your search or filter criteria"}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

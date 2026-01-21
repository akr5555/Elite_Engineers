import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkillBadge } from "@/components/SkillBadge";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onSkillFilter: (skills: string[]) => void;
  onExperienceFilter: (min: number, max: number) => void;
  onLocationFilter: (location: string) => void;
  selectedSkills: string[];
  className?: string;
}

const popularSkills = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Go",
  "Rust",
  "AWS",
  "Kubernetes",
  "GraphQL",
  "PostgreSQL",
];

export function SearchFilters({
  onSearch,
  onSkillFilter,
  selectedSkills,
  className,
}: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onSkillFilter(selectedSkills.filter((s) => s !== skill));
    } else {
      onSkillFilter([...selectedSkills, skill]);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    onSearch("");
    onSkillFilter([]);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search engineers by name, role, or skills..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 h-11"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="h-11"
        >
          <SlidersHorizontal size={18} />
          <span className="hidden sm:inline">Filters</span>
        </Button>
        {(selectedSkills.length > 0 || searchQuery) && (
          <Button variant="ghost" onClick={clearFilters} className="h-11">
            <X size={18} />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card-elevated p-4 animate-fade-in">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">
                Filter by Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {popularSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                      selectedSkills.includes(skill)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                    )}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {selectedSkills.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedSkills.map((skill) => (
            <SkillBadge
              key={skill}
              skill={skill}
              variant="primary"
              size="sm"
              className="cursor-pointer hover:opacity-80"
            />
          ))}
        </div>
      )}
    </div>
  );
}

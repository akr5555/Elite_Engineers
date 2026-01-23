import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Shield,
  ChevronRight,
  Users,
  SlidersHorizontal
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { api, Engineer as APIEngineer } from "@/services/api";
import { transformEngineerFromAPI } from "@/data/engineers";

interface EngineerCard {
  id: string;
  name: string;
  avatar: string;
  role: string;
  skills: string[];
  compatibilityScore: number;
  trustScore: number;
  experience: number;
  location: string;
}

export default function RecruiterSearch() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [engineers, setEngineers] = useState<EngineerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minTrustScore, setMinTrustScore] = useState(0);
  const [minCompatibilityScore, setMinCompatibilityScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || (role !== "RECRUITER" && role !== "recruiter")) {
      navigate("/login");
      return;
    }

    fetchEngineers();
  }, [navigate]);

  const fetchEngineers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getEngineers({ 
        limit: 100,
        min_trust_score: minTrustScore,
        min_compatibility_score: minCompatibilityScore
      });
      
      const transformedEngineers: EngineerCard[] = result.engineers.map((apiEngineer) => {
        const engineer = transformEngineerFromAPI(apiEngineer);
        return {
          id: engineer.id,
          name: engineer.name,
          avatar: engineer.avatar || "",
          role: engineer.role || "Software Engineer",
          skills: engineer.skills,
          compatibilityScore: engineer.compatibilityScore,
          trustScore: engineer.trustScore,
          experience: engineer.experience,
          location: engineer.location || "Location not specified"
        };
      });
      
      setEngineers(transformedEngineers);
    } catch (err: any) {
      console.error("Failed to fetch engineers:", err);
      setError("Failed to load engineers. Please try again later.");
      setEngineers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEngineers = engineers.filter((engineer) => {
    const matchesSearch = 
      engineer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      engineer.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      engineer.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-blue-500";
    if (score >= 70) return "text-yellow-500";
    return "text-orange-500";
  };

  const handleApplyFilters = () => {
    fetchEngineers();
    setShowFilters(false);
  };

  return (
    <DashboardLayout role="RECRUITER">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Find Engineers</h2>
          <p className="text-muted-foreground">
            Search and discover talented engineers for your team
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Search & Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search size={20} />
              Search Engineers
            </CardTitle>
            <CardDescription>Search by name, skills, or role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, skills, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={16} />
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 p-4 border border-border rounded-lg space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Min Trust Score: {minTrustScore}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={minTrustScore}
                      onChange={(e) => setMinTrustScore(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Min Compatibility: {minCompatibilityScore}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={minCompatibilityScore}
                      onChange={(e) => setMinCompatibilityScore(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleApplyFilters}>Apply Filters</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setMinTrustScore(0);
                      setMinCompatibilityScore(0);
                      fetchEngineers();
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredEngineers.length}</span> engineers
          </p>
        </div>

        {/* Engineers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading engineers...</p>
            </div>
          </div>
        ) : filteredEngineers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-lg font-medium">No engineers found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEngineers.map((engineer) => (
              <Card 
                key={engineer.id}
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={() => navigate(`/engineer/${engineer.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={engineer.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(engineer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{engineer.name}</h3>
                      <p className="text-sm text-muted-foreground">{engineer.role}</p>
                      <p className="text-xs text-muted-foreground">{engineer.location}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {engineer.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {engineer.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{engineer.skills.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 rounded-md bg-muted">
                      <p className={cn("text-xl font-bold", getScoreColor(engineer.compatibilityScore))}>
                        {engineer.compatibilityScore}%
                      </p>
                      <p className="text-xs text-muted-foreground">Match</p>
                    </div>
                    <div className="text-center p-2 rounded-md bg-muted">
                      <p className={cn("text-xl font-bold", getScoreColor(engineer.trustScore))}>
                        {engineer.trustScore}%
                      </p>
                      <p className="text-xs text-muted-foreground">Trust</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" size="sm">
                    View Profile
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

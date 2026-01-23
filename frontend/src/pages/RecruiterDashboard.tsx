import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  Shield, 
  Eye,
  Bookmark,
  Mail,
  ChevronRight,
  BarChart3,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { api, Engineer as APIEngineer } from "@/services/api";
import { Engineer, transformEngineerFromAPI } from "@/data/engineers";

interface RecruiterEngineer {
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

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEngineer, setSelectedEngineer] = useState<RecruiterEngineer | null>(null);
  const [selectedEngineerDetails, setSelectedEngineerDetails] = useState<APIEngineer | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<"viewed" | "shortlisted" | "contacted" | "interview">("viewed");
  const [engineers, setEngineers] = useState<RecruiterEngineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [useAISearch, setUseAISearch] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || (role !== "RECRUITER" && role !== "recruiter")) {
      navigate("/login");
      return;
    }

    // Fetch engineers from API
    fetchEngineers();
  }, [navigate]);

  const fetchEngineers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use AI Engine candidates endpoint to get top talent sorted by compatibility
      const aiCandidates = await api.getAICandidates();
      
      if (aiCandidates && aiCandidates.length > 0) {
        // Transform AI candidates to RecruiterEngineer format
        const transformedEngineers: RecruiterEngineer[] = aiCandidates.map((candidate) => ({
          id: candidate.username || candidate.id || `candidate-${Math.random()}`,
          name: candidate.full_name || candidate.username || "Unknown",
          avatar: "", // AI Engine may not have avatar URL
          role: "Software Engineer", // Default role
          skills: [], // Skills extracted by AI
          compatibilityScore: candidate.compatibility_score || 0,
          trustScore: candidate.trust_score || 0,
          experience: 0,
          location: candidate.location || "Location not specified"
        }));
        
        setEngineers(transformedEngineers);
      } else {
        // Fallback to regular engineers API if AI Engine returns empty
        console.log("AI Engine returned no candidates, falling back to regular API");
        const result = await api.getEngineers({ limit: 100 });
        
        const transformedEngineers: RecruiterEngineer[] = result.engineers.map((apiEngineer) => {
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
      }
    } catch (err: any) {
      console.error("Failed to fetch engineers:", err);
      setError("Failed to load engineers. Please try again later.");
      setEngineers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEngineerDetails = async (engineerId: string) => {
    try {
      setLoadingDetails(true);
      const details = await api.getEngineer(engineerId);
      setSelectedEngineerDetails(details);
    } catch (err: any) {
      console.error("Failed to fetch engineer details:", err);
      setSelectedEngineerDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAISearch = async (query: string) => {
    if (!query.trim()) {
      // If search is empty, reload original engineers
      fetchEngineers();
      setUseAISearch(false);
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);
      
      // Use AI-powered natural language search
      const searchResults = await api.searchCandidates(query, 20);
      
      if (searchResults && searchResults.length > 0) {
        // Transform search results to RecruiterEngineer format
        const transformedEngineers: RecruiterEngineer[] = searchResults.map((result) => ({
          id: result.username || result.id || `result-${Math.random()}`,
          name: result.full_name || result.username || "Unknown",
          avatar: "",
          role: "Software Engineer",
          skills: [],
          compatibilityScore: Math.round((result.match_confidence || 0) * 100),
          trustScore: result.trust_score || 0,
          experience: 0,
          location: result.location || "Location not specified"
        }));
        
        setEngineers(transformedEngineers);
        setUseAISearch(true);
      } else {
        setEngineers([]);
        setError("No engineers found matching your search. Try different keywords.");
      }
    } catch (err: any) {
      console.error("AI search failed:", err);
      setError("Search failed. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectEngineer = (engineer: RecruiterEngineer) => {
    setSelectedEngineer(engineer);
    fetchEngineerDetails(engineer.id);
  };

  // When using AI search, show all results; otherwise allow local filtering
  const filteredEngineers = useAISearch 
    ? engineers 
    : engineers.filter((engineer) => {
        if (!searchQuery) return true;
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

  const pipelineStages = [
    { id: "viewed", label: "Viewed", count: filteredEngineers.length },
    { id: "shortlisted", label: "Shortlisted", count: 0 },
    { id: "contacted", label: "Contacted", count: 0 },
    { id: "interview", label: "Interview", count: 0 }
  ] as const;

  // Calculate average scores
  const avgCompatibility = engineers.length > 0 
    ? Math.round(engineers.reduce((sum, e) => sum + e.compatibilityScore, 0) / engineers.length)
    : 0;
  
  const avgTrust = engineers.length > 0
    ? Math.round(engineers.reduce((sum, e) => sum + e.trustScore, 0) / engineers.length)
    : 0;

  return (
    <DashboardLayout role="RECRUITER">
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="text-primary" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? "..." : engineers.length}</p>
                  <p className="text-sm text-muted-foreground">Engineers Found</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <TrendingUp className="text-green-500" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? "..." : `${avgCompatibility}%`}</p>
                  <p className="text-sm text-muted-foreground">Avg. Match</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Shield className="text-blue-500" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? "..." : `${avgTrust}%`}</p>
                  <p className="text-sm text-muted-foreground">Avg. Trust</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                  <Bookmark className="text-yellow-500" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search size={20} />
              AI-Powered Search
            </CardTitle>
            <CardDescription>
              Use natural language to find engineers (e.g., "Need a Node.js backend dev with 5+ years experience")
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Try: 'React expert with TypeScript' or 'Senior Python developer'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAISearch(searchQuery);
                    }
                  }}
                  className="w-full"
                  disabled={searchLoading}
                />
              </div>
              <Button 
                onClick={() => handleAISearch(searchQuery)}
                disabled={searchLoading}
                className="flex items-center gap-2"
              >
                <Search size={16} />
                {searchLoading ? "Searching..." : "Search"}
              </Button>
              {useAISearch && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    fetchEngineers();
                    setUseAISearch(false);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
            {useAISearch && (
              <p className="text-sm text-muted-foreground mt-2">
                🤖 Showing AI-powered search results
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Stages */}
        <Card>
          <CardHeader>
            <CardTitle>Recruitment Pipeline</CardTitle>
            <CardDescription>Track candidates through your hiring process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto">
              {pipelineStages.map((stage) => (
                <Button
                  key={stage.id}
                  variant={pipelineStage === stage.id ? "default" : "outline"}
                  onClick={() => setPipelineStage(stage.id)}
                  className="flex-1 min-w-[140px]"
                >
                  {stage.label}
                  <Badge variant="secondary" className="ml-2">
                    {stage.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engineers Grid and Detail View */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Engineers List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">Discovered Engineers</h2>
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
                  <p className="text-sm text-muted-foreground">Try adjusting your search filters</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredEngineers.map((engineer) => (
                <Card 
                  key={engineer.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-lg",
                    selectedEngineer?.id === engineer.id && "ring-2 ring-primary"
                  )}
                  onClick={() => handleSelectEngineer(engineer)}
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
                        <p className="text-xs text-muted-foreground">Compatibility</p>
                      </div>
                      <div className="text-center p-2 rounded-md bg-muted">
                        <p className={cn("text-xl font-bold", getScoreColor(engineer.trustScore))}>
                          {engineer.trustScore}%
                        </p>
                        <p className="text-xs text-muted-foreground">Trust Score</p>
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

          {/* Engineer Detail View */}
          <div className="space-y-4">
            {selectedEngineer ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Preview</CardTitle>
                    <CardDescription>{selectedEngineer.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedEngineer.avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {getInitials(selectedEngineer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{selectedEngineer.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedEngineer.role}</p>
                        <p className="text-xs text-muted-foreground">{selectedEngineer.location}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedEngineer.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Experience</p>
                      <p className="text-sm text-muted-foreground">{selectedEngineer.experience} years</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 size={18} />
                      Why Recommended?
                    </CardTitle>
                    <CardDescription>Score breakdown and insights</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loadingDetails ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      </div>
                    ) : selectedEngineerDetails ? (
                      <>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Skill Match</span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(selectedEngineerDetails.compatibility_breakdown?.skill_match || 0)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all" 
                              style={{ width: `${Math.round(selectedEngineerDetails.compatibility_breakdown?.skill_match || 0)}%` }} 
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Project Relevance</span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(selectedEngineerDetails.compatibility_breakdown?.project_relevance || 0)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all" 
                              style={{ width: `${Math.round(selectedEngineerDetails.compatibility_breakdown?.project_relevance || 0)}%` }} 
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Experience</span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(selectedEngineerDetails.compatibility_breakdown?.experience || 0)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full transition-all" 
                              style={{ width: `${Math.round(selectedEngineerDetails.compatibility_breakdown?.experience || 0)}%` }} 
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Activity Consistency</span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(selectedEngineerDetails.compatibility_breakdown?.activity_consistency || 0)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full transition-all" 
                              style={{ width: `${Math.round(selectedEngineerDetails.compatibility_breakdown?.activity_consistency || 0)}%` }} 
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">Select an engineer to view details</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Bookmark size={16} className="mr-2" />
                      Shortlist Candidate
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Star size={16} className="mr-2" />
                      Save Profile
                    </Button>
                    <Button variant="default" className="w-full justify-start" size="sm">
                      <Mail size={16} className="mr-2" />
                      Contact Engineer
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Select an engineer to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

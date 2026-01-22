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

interface Engineer {
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
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  const [pipelineStage, setPipelineStage] = useState<"viewed" | "shortlisted" | "contacted" | "interview">("viewed");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || (role !== "RECRUITER" && role !== "recruiter")) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  // Dummy engineers data
  const engineers: Engineer[] = [
    {
      id: "1",
      name: "Alex Johnson",
      avatar: "",
      role: "Full Stack Developer",
      skills: ["React", "Node.js", "TypeScript", "AWS"],
      compatibilityScore: 92,
      trustScore: 88,
      experience: 5,
      location: "San Francisco, CA"
    },
    {
      id: "2",
      name: "Sarah Chen",
      avatar: "",
      role: "Backend Engineer",
      skills: ["Python", "Django", "PostgreSQL", "Docker"],
      compatibilityScore: 87,
      trustScore: 91,
      experience: 4,
      location: "Austin, TX"
    },
    {
      id: "3",
      name: "Michael Rodriguez",
      avatar: "",
      role: "Frontend Developer",
      skills: ["React", "Vue.js", "CSS", "JavaScript"],
      compatibilityScore: 85,
      trustScore: 86,
      experience: 3,
      location: "New York, NY"
    },
    {
      id: "4",
      name: "Emily Watson",
      avatar: "",
      role: "DevOps Engineer",
      skills: ["Kubernetes", "Terraform", "AWS", "Python"],
      compatibilityScore: 90,
      trustScore: 93,
      experience: 6,
      location: "Seattle, WA"
    },
    {
      id: "5",
      name: "David Kim",
      avatar: "",
      role: "ML Engineer",
      skills: ["Python", "TensorFlow", "PyTorch", "FastAPI"],
      compatibilityScore: 88,
      trustScore: 89,
      experience: 4,
      location: "Boston, MA"
    },
    {
      id: "6",
      name: "Jessica Martinez",
      avatar: "",
      role: "Mobile Developer",
      skills: ["React Native", "iOS", "Android", "TypeScript"],
      compatibilityScore: 84,
      trustScore: 87,
      experience: 5,
      location: "Miami, FL"
    }
  ];

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

  const pipelineStages = [
    { id: "viewed", label: "Viewed", count: 6 },
    { id: "shortlisted", label: "Shortlisted", count: 0 },
    { id: "contacted", label: "Contacted", count: 0 },
    { id: "interview", label: "Interview", count: 0 }
  ] as const;

  return (
    <DashboardLayout role="RECRUITER">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="text-primary" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{engineers.length}</p>
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
                  <p className="text-2xl font-bold">88%</p>
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
                  <p className="text-2xl font-bold">89%</p>
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
              Search Engineers
            </CardTitle>
            <CardDescription>Find the perfect engineer for your team</CardDescription>
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
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                Filters
              </Button>
            </div>
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
            <div className="grid gap-4 md:grid-cols-2">
              {filteredEngineers.map((engineer) => (
                <Card 
                  key={engineer.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-lg",
                    selectedEngineer?.id === engineer.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedEngineer(engineer)}
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
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Skill Match</span>
                        <span className="text-sm text-muted-foreground">95%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "95%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Project Relevance</span>
                        <span className="text-sm text-muted-foreground">88%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "88%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Experience</span>
                        <span className="text-sm text-muted-foreground">85%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "85%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Consistency</span>
                        <span className="text-sm text-muted-foreground">92%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: "92%" }} />
                      </div>
                    </div>
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

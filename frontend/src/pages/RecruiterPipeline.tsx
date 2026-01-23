import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Briefcase,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PipelineCandidate {
  id: string;
  name: string;
  avatar: string;
  role: string;
  stage: "viewed" | "shortlisted" | "contacted" | "interview" | "offer" | "hired";
  addedDate: string;
  compatibilityScore: number;
  notes: string;
}

export default function RecruiterPipeline() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<PipelineCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || (role !== "RECRUITER" && role !== "recruiter")) {
      navigate("/login");
      return;
    }

    // For now, using mock data as there's no backend endpoint for pipeline
    // In production, this would fetch from: api.getPipelineCandidates()
    setTimeout(() => {
      setCandidates([]);
      setLoading(false);
    }, 500);
  }, [navigate]);

  const stages = [
    { id: "all", label: "All", count: candidates.length, color: "bg-gray-500" },
    { id: "viewed", label: "Viewed", count: candidates.filter(c => c.stage === "viewed").length, color: "bg-blue-500" },
    { id: "shortlisted", label: "Shortlisted", count: candidates.filter(c => c.stage === "shortlisted").length, color: "bg-purple-500" },
    { id: "contacted", label: "Contacted", count: candidates.filter(c => c.stage === "contacted").length, color: "bg-yellow-500" },
    { id: "interview", label: "Interview", count: candidates.filter(c => c.stage === "interview").length, color: "bg-orange-500" },
    { id: "offer", label: "Offer", count: candidates.filter(c => c.stage === "offer").length, color: "bg-green-500" },
    { id: "hired", label: "Hired", count: candidates.filter(c => c.stage === "hired").length, color: "bg-emerald-600" },
  ];

  const filteredCandidates = selectedStage === "all" 
    ? candidates 
    : candidates.filter(c => c.stage === selectedStage);

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getStageColor = (stage: string) => {
    const stageColors: Record<string, string> = {
      viewed: "bg-blue-500",
      shortlisted: "bg-purple-500",
      contacted: "bg-yellow-500",
      interview: "bg-orange-500",
      offer: "bg-green-500",
      hired: "bg-emerald-600"
    };
    return stageColors[stage] || "bg-gray-500";
  };

  return (
    <DashboardLayout role="RECRUITER">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Recruitment Pipeline</h2>
          <p className="text-muted-foreground">
            Track and manage candidates through your hiring process
          </p>
        </div>

        {/* Pipeline Stats */}
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
          {stages.map((stage) => (
            <Card 
              key={stage.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                selectedStage === stage.id && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedStage(stage.id)}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-full mb-2", stage.color, "text-white")}>
                    <span className="font-bold">{stage.count}</span>
                  </div>
                  <p className="text-sm font-medium">{stage.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pipeline Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading pipeline...</p>
            </div>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Briefcase className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-lg font-medium mb-2">No candidates in pipeline</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start adding engineers to your recruitment pipeline
              </p>
              <Button onClick={() => navigate("/recruiter-dashboard/search")}>
                Find Engineers
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={candidate.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {getInitials(candidate.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">{candidate.role}</p>
                        </div>
                        <Badge className={cn(getStageColor(candidate.stage), "text-white")}>
                          {candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock size={14} />
                          Added {candidate.addedDate}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp size={14} className="text-primary" />
                          <span className="font-medium">{candidate.compatibilityScore}% Match</span>
                        </div>
                      </div>

                      {candidate.notes && (
                        <p className="text-sm text-muted-foreground mb-3">{candidate.notes}</p>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View Profile</Button>
                        <Button variant="outline" size="sm">Move Stage</Button>
                        <Button variant="outline" size="sm">Add Note</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <AlertCircle size={20} />
              Pipeline Feature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-600">
              The pipeline feature allows you to track candidates through your hiring process. 
              Click on engineers from the search page to add them to your pipeline and manage their status.
              This feature will be fully integrated with the database in the next update.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

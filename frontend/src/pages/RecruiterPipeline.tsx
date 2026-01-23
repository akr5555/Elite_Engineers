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
  AlertCircle,
  Trash2,
  ChevronRight,
  Shield
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  getPipelineCandidatesSorted, 
  getPipelineStats, 
  removeFromPipeline, 
  updateCandidateStage,
  PipelineCandidate 
} from "@/services/pipelineService";
import { useToast } from "@/hooks/use-toast";

export default function RecruiterPipeline() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<PipelineCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [stats, setStats] = useState(getPipelineStats());

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || (role !== "RECRUITER" && role !== "recruiter")) {
      navigate("/login");
      return;
    }

    loadPipeline();
  }, [navigate]);

  const loadPipeline = () => {
    setLoading(true);
    const pipelineCandidates = getPipelineCandidatesSorted(); // Already sorted by rank
    setCandidates(pipelineCandidates);
    setStats(getPipelineStats());
    setLoading(false);
  };

  const handleRemoveCandidate = (id: string, name: string) => {
    if (confirm(`Remove ${name} from pipeline?`)) {
      removeFromPipeline(id);
      loadPipeline();
      toast({
        title: "Removed from Pipeline",
        description: `${name} has been removed from your pipeline.`,
      });
    }
  };

  const handleStageChange = (id: string, stage: PipelineCandidate["stage"]) => {
    updateCandidateStage(id, stage);
    loadPipeline();
    toast({
      title: "Stage Updated",
      description: "Candidate stage has been updated successfully.",
    });
  };

  const stages = [
    { id: "all", label: "All", count: stats.total, color: "bg-gray-500" },
    { id: "viewed", label: "Viewed", count: stats.viewed, color: "bg-blue-500" },
    { id: "shortlisted", label: "Shortlisted", count: stats.shortlisted, color: "bg-purple-500" },
    { id: "contacted", label: "Contacted", count: stats.contacted, color: "bg-yellow-500" },
    { id: "interview", label: "Interview", count: stats.interview, color: "bg-orange-500" },
    { id: "offer", label: "Offer", count: stats.offer, color: "bg-green-500" },
    { id: "hired", label: "Hired", count: stats.hired, color: "bg-emerald-600" },
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
                {selectedStage === "all" 
                  ? "Start adding engineers to your recruitment pipeline"
                  : `No candidates in ${selectedStage} stage`}
              </p>
              <Button onClick={() => navigate("/recruiter-dashboard/search")}>
                Find Engineers
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filteredCandidates.length}</span> candidates
              </p>
              <p className="text-sm text-muted-foreground">
                Sorted by: <span className="font-medium text-foreground">Rank Score (Highest first)</span>
              </p>
            </div>

            <div className="grid gap-4">
              {filteredCandidates.map((candidate, index) => (
                <Card 
                  key={candidate.id}
                  className="cursor-pointer transition-all hover:shadow-lg relative overflow-hidden"
                  onClick={() => navigate(`/engineer/${candidate.engineerId}`)}
                >
                  {/* Rank Badge */}
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold z-10">
                    #{index + 1} - Rank: {candidate.rankScore}
                  </div>

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
                            <p className="text-xs text-muted-foreground">{candidate.location}</p>
                          </div>
                          <Badge className={cn(getStageColor(candidate.stage), "text-white")}>
                            {candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1)}
                          </Badge>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {candidate.skills.slice(0, 5).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{candidate.skills.length - 5}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock size={14} />
                            Added {new Date(candidate.addedDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp size={14} className="text-green-500" />
                            <span className="font-medium">{candidate.compatibilityScore}% Match</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Shield size={14} className="text-blue-500" />
                            <span className="font-medium">{candidate.trustScore}% Trust</span>
                          </div>
                        </div>

                        {candidate.notes && (
                          <p className="text-sm text-muted-foreground mb-3 p-2 bg-muted rounded">{candidate.notes}</p>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/engineer/${candidate.engineerId}`);
                            }}
                          >
                            View Profile
                            <ChevronRight size={14} className="ml-1" />
                          </Button>
                          <select 
                            className="px-2 py-1 text-sm border border-border rounded-md bg-background"
                            value={candidate.stage}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStageChange(candidate.id, e.target.value as PipelineCandidate["stage"]);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="viewed">Viewed</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="contacted">Contacted</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="hired">Hired</option>
                          </select>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCandidate(candidate.id, candidate.name);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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

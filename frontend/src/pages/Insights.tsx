import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  GitCommit,
  Calendar,
  Activity,
  BarChart3,
  Loader2,
  AlertCircle,
  Shield,
  Code,
  Star
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, Engineer } from "@/services/api";

export default function Insights() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");
  const [engineerData, setEngineerData] = useState<Engineer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail") || "";

    if (!token || (role !== "ENGINEER" && role !== "engineer")) {
      navigate("/login");
      return;
    }

    setUserEmail(email);
    fetchEngineerData(email);
  }, [navigate]);

  const fetchEngineerData = async (email: string) => {
    try {
      setLoading(true);
      setError("");
      
      // First check if we have a stored engineer ID for THIS user
      const storedEngineerId = localStorage.getItem(`engineerId_${email}`);
      
      let engineer = null;
      
      if (storedEngineerId) {
        try {
          engineer = await api.getEngineer(storedEngineerId);
        } catch (err) {
          localStorage.removeItem(`engineerId_${email}`);
        }
      }
      
      // Fallback to searching by email prefix
      if (!engineer) {
        const username = email.split("@")[0];
        engineer = await api.getEngineerByGithubUsername(username);
        
        if (engineer) {
          localStorage.setItem(`engineerId_${email}`, engineer.id);
        }
      }
      
      if (engineer) {
        setEngineerData(engineer);
      } else {
        setError("No engineer profile found.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch insights data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="ENGINEER">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading insights...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!engineerData) {
    return (
      <DashboardLayout role="ENGINEER">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Profile not found"}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  // Calculate insights - all variables properly typed after engineerData null check
  const compatibilityScore: number = engineerData.compatibility_score || 0;
  const trustScore: number = engineerData.trust_score || 0;
  
  // Type-safe compatibility breakdown with defaults
  const compatibilityBreakdown = {
    skill_match: (engineerData.compatibility_breakdown?.skill_match ?? 0) as number,
    project_relevance: (engineerData.compatibility_breakdown?.project_relevance ?? 0) as number,
    experience: (engineerData.compatibility_breakdown?.experience ?? 0) as number,
    activity_consistency: (engineerData.compatibility_breakdown?.activity_consistency ?? 0) as number
  };
  
  // Type-safe trust evidence with defaults  
  const trustEvidence = {
    recent_commits: (engineerData.trust_evidence?.recent_commits ?? 0) as number,
    contribution_streak: (engineerData.trust_evidence?.contribution_streak ?? 0) as number,
    verified_email: (engineerData.trust_evidence?.verified_email ?? false) as boolean,
    profile_complete: (engineerData.trust_evidence?.profile_complete ?? false) as boolean
  };

  // Determine performance status
  const getScoreStatus = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-500", trend: "up" };
    if (score >= 60) return { label: "Good", color: "text-blue-500", trend: "up" };
    if (score >= 40) return { label: "Average", color: "text-yellow-500", trend: "neutral" };
    return { label: "Needs Improvement", color: "text-orange-500", trend: "down" };
  };

  const compatibilityStatus = getScoreStatus(compatibilityScore);
  const trustStatus = getScoreStatus(trustScore);

  // Activity metrics
  const recentActivity = engineerData.recent_activity || [];
  const totalRecentCommits = recentActivity.reduce((sum, day) => sum + day.commits, 0);
  const avgCommitsPerDay = recentActivity.length > 0 
    ? (totalRecentCommits / recentActivity.length).toFixed(1) 
    : "0";

  return (
    <DashboardLayout role="ENGINEER">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Performance Insights</h1>
          <p className="text-muted-foreground">Track your progress and identify areas for improvement</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Compatibility Score</p>
                  <p className="text-3xl font-bold">{Math.round(compatibilityScore)}</p>
                  <p className={`text-sm ${compatibilityStatus.color} flex items-center gap-1 mt-1`}>
                    {compatibilityStatus.trend === "up" && <TrendingUp className="w-4 h-4" />}
                    {compatibilityStatus.trend === "down" && <TrendingDown className="w-4 h-4" />}
                    {compatibilityStatus.label}
                  </p>
                </div>
                <Target className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trust Score</p>
                  <p className="text-3xl font-bold">{Math.round(trustScore)}</p>
                  <p className={`text-sm ${trustStatus.color} flex items-center gap-1 mt-1`}>
                    {trustStatus.trend === "up" && <TrendingUp className="w-4 h-4" />}
                    {trustStatus.trend === "down" && <TrendingDown className="w-4 h-4" />}
                    {trustStatus.label}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recent Commits</p>
                  <p className="text-3xl font-bold">{totalRecentCommits}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {avgCommitsPerDay} per day
                  </p>
                </div>
                <GitCommit className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Skills</p>
                  <p className="text-3xl font-bold">{engineerData.skills.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {engineerData.top_languages.length} languages
                  </p>
                </div>
                <Code className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compatibility Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Compatibility Breakdown
            </CardTitle>
            <CardDescription>Detailed analysis of your compatibility score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Skill Match</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(compatibilityBreakdown.skill_match || 0)}%
                  </span>
                </div>
                <Progress value={compatibilityBreakdown.skill_match || 0} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Project Relevance</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(compatibilityBreakdown.project_relevance || 0)}%
                  </span>
                </div>
                <Progress value={compatibilityBreakdown.project_relevance || 0} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Experience Level</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(compatibilityBreakdown.experience || 0)}%
                  </span>
                </div>
                <Progress value={compatibilityBreakdown.experience || 0} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Activity Consistency</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(compatibilityBreakdown.activity_consistency || 0)}%
                  </span>
                </div>
                <Progress value={compatibilityBreakdown.activity_consistency || 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Trust & Credibility Indicators
            </CardTitle>
            <CardDescription>Factors contributing to your trust score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Recent Commits</span>
                  <Badge variant={trustEvidence.recent_commits > 50 ? "default" : "secondary"}>
                    {trustEvidence.recent_commits || 0}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {trustEvidence.recent_commits > 100 ? "Highly active contributor" :
                   trustEvidence.recent_commits > 50 ? "Regular contributor" :
                   "Needs more activity"}
                </p>
              </div>

              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Contribution Streak</span>
                  <Badge variant={trustEvidence.contribution_streak > 7 ? "default" : "secondary"}>
                    {trustEvidence.contribution_streak || 0} days
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {trustEvidence.contribution_streak > 30 ? "Outstanding consistency!" :
                   trustEvidence.contribution_streak > 7 ? "Good momentum" :
                   "Build your streak"}
                </p>
              </div>

              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Email Verification</span>
                  <Badge variant={trustEvidence.verified_email ? "default" : "destructive"}>
                    {trustEvidence.verified_email ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {trustEvidence.verified_email ? "Email is verified" : "Please verify your email"}
                </p>
              </div>

              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Profile Completeness</span>
                  <Badge variant={trustEvidence.profile_complete ? "default" : "secondary"}>
                    {trustEvidence.profile_complete ? "Complete" : "Incomplete"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {trustEvidence.profile_complete ? "All fields filled" : "Complete your profile"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your commit activity over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((day) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-24">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Progress value={(day.commits / Math.max(...recentActivity.map(d => d.commits), 1)) * 100} className="h-4" />
                        <span className="text-sm font-medium w-12 text-right">{day.commits}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Highlights & Achievements */}
        {engineerData.highlights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Your Highlights
              </CardTitle>
              <CardDescription>Notable achievements and strengths</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {engineerData.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border">
                    <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{highlight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recommendations
            </CardTitle>
            <CardDescription>Actions to improve your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {compatibilityScore < 70 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Target className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Improve Compatibility Score</p>
                    <p className="text-xs text-muted-foreground">
                      Add more relevant skills and increase your project activity
                    </p>
                  </div>
                </div>
              )}

              {engineerData.skills.length < 5 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950">
                  <Code className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Add More Skills</p>
                    <p className="text-xs text-muted-foreground">
                      List at least 5 skills to showcase your expertise
                    </p>
                  </div>
                </div>
              )}

              {totalRecentCommits < 10 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                  <GitCommit className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Increase Activity</p>
                    <p className="text-xs text-muted-foreground">
                      Commit more regularly to demonstrate consistent engagement
                    </p>
                  </div>
                </div>
              )}

              {!trustEvidence.profile_complete && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Complete Your Profile</p>
                    <p className="text-xs text-muted-foreground">
                      Fill in all profile fields to boost your trust score
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

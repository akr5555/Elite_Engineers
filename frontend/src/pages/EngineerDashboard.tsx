import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Code, 
  GitBranch, 
  Star, 
  TrendingUp, 
  Shield, 
  CheckCircle2,
  AlertCircle,
  Github,
  Award
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EngineerDashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail") || "";

    if (!token || (role !== "ENGINEER" && role !== "engineer")) {
      navigate("/login");
      return;
    }

    setUserEmail(email);
  }, [navigate]);

  // Dummy stats for demonstration
  const profileCompleteness = 75;
  const trustScore = 85;
  const compatibilityScore = 88;
  const yearsExperience = 5;

  const topSkills = [
    { name: "JavaScript", percentage: 95, color: "bg-yellow-500" },
    { name: "Python", percentage: 88, color: "bg-blue-500" },
    { name: "React", percentage: 92, color: "bg-cyan-500" },
    { name: "Node.js", percentage: 85, color: "bg-green-500" },
    { name: "TypeScript", percentage: 90, color: "bg-blue-600" },
  ];

  const domainStrengths = [
    { name: "Web Development", level: 90 },
    { name: "Backend APIs", level: 85 },
    { name: "Cloud Architecture", level: 70 },
    { name: "Mobile Development", level: 60 },
  ];

  const topRepositories = [
    {
      name: "awesome-react-app",
      description: "A modern React application with TypeScript and Vite",
      stars: 234,
      techStack: ["React", "TypeScript", "Vite"],
    },
    {
      name: "api-gateway-service",
      description: "Microservices API gateway with Node.js",
      stars: 189,
      techStack: ["Node.js", "Express", "Docker"],
    },
    {
      name: "ml-recommendation-engine",
      description: "Machine learning based recommendation system",
      stars: 156,
      techStack: ["Python", "TensorFlow", "FastAPI"],
    },
  ];

  const trustIndicators = [
    { label: "Account Age", value: "3+ years", status: "good" },
    { label: "Consistency", value: "High", status: "good" },
    { label: "Repo Ownership", value: "Verified", status: "good" },
    { label: "Community Engagement", value: "Active", status: "good" },
  ];

  return (
    <DashboardLayout role="ENGINEER">
      <div className="space-y-6">
        {/* Profile Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github size={24} />
              Profile Overview
            </CardTitle>
            <CardDescription>Your professional profile summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="text-lg font-semibold">{userEmail.split("@")[0]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <p className="text-lg font-semibold">Full Stack Engineer</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">GitHub Username</p>
                  <p className="text-lg font-semibold">@{userEmail.split("@")[0]}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Profile Completeness</p>
                    <p className="text-sm font-semibold">{profileCompleteness}%</p>
                  </div>
                  <Progress value={profileCompleteness} className="h-2" />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <Calendar className="mx-auto mb-1 text-primary" size={20} />
                    <p className="text-2xl font-bold">{yearsExperience}</p>
                    <p className="text-xs text-muted-foreground">Years Exp.</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <Code className="mx-auto mb-1 text-primary" size={20} />
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">Skills</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <TrendingUp className="mx-auto mb-1 text-primary" size={20} />
                    <p className="text-2xl font-bold">Active</p>
                    <p className="text-xs text-muted-foreground">Status</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skill Strength Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Programming Languages</CardTitle>
              <CardDescription>Your strongest technical skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topSkills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{skill.name}</span>
                    <span className="text-sm text-muted-foreground">{skill.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`${skill.color} h-2 rounded-full transition-all`}
                      style={{ width: `${skill.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Domain Strengths</CardTitle>
              <CardDescription>Your expertise across different areas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {domainStrengths.map((domain) => (
                <div key={domain.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{domain.name}</span>
                    <span className="text-sm text-muted-foreground">{domain.level}%</span>
                  </div>
                  <Progress value={domain.level} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Compatibility & Trust Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} />
                Compatibility Insights
              </CardTitle>
              <CardDescription>How well you match with opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-32 h-32 mb-4">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-muted stroke-current"
                      strokeWidth="10"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                    />
                    <circle
                      className="text-primary stroke-current"
                      strokeWidth="10"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - compatibilityScore / 100)}`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{compatibilityScore}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Overall Compatibility</h3>
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span>Strong backend & API experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span>Consistent open-source activity</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span>Modern tech stack expertise</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} />
                Trust & Authenticity
              </CardTitle>
              <CardDescription>Your credibility score and indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-2">
                    <span className="text-3xl font-bold text-green-500">{trustScore}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Trust Score</p>
                </div>
              </div>
              <div className="space-y-3">
                {trustIndicators.map((indicator) => (
                  <div key={indicator.label} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                    <span className="text-sm font-medium">{indicator.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{indicator.value}</span>
                      <CheckCircle2 size={16} className="text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evidence / Proof-of-Work */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award size={20} />
              Evidence & Proof-of-Work
            </CardTitle>
            <CardDescription>Your top repositories and contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {topRepositories.map((repo) => (
                <Card key={repo.name} className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <GitBranch size={16} />
                      {repo.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{repo.description}</p>
                    <div className="flex items-center gap-2">
                      <Star size={14} className="text-yellow-500" />
                      <span className="text-sm font-semibold">{repo.stars}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {repo.techStack.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

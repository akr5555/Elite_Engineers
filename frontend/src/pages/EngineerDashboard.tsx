import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Award,
  Loader2,
  User
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, Engineer } from "@/services/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EngineerDashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [engineerData, setEngineerData] = useState<Engineer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [showProfileSelection, setShowProfileSelection] = useState(false);
  const [availableProfiles, setAvailableProfiles] = useState<Engineer[]>([]);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupData, setSetupData] = useState({
    githubUsername: "",
    name: "",
    role: "",
    location: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail") || "";

    if (!token || (role !== "ENGINEER" && role !== "engineer")) {
      navigate("/login");
      return;
    }

    // Get user name from token or email
    const name = email.split("@")[0];
    setUserName(name);
    setUserEmail(email);
    
    // Pre-fill the GitHub username with email prefix
    setSetupData(prev => ({
      ...prev,
      githubUsername: name,
      name: name.charAt(0).toUpperCase() + name.slice(1).replace(/[._-]/g, ' ')
    }));
    
    fetchEngineerData(email);
  }, [navigate]);

  const fetchEngineerData = async (email: string) => {
    try {
      setLoading(true);
      setError("");
      
      // First, check if we have a stored engineer ID for THIS user
      const storedEngineerId = localStorage.getItem(`engineerId_${email}`);
      
      if (storedEngineerId) {
        // Fetch engineer by ID
        try {
          const engineer = await api.getEngineer(storedEngineerId);
          console.log("Found engineer by stored ID:", engineer);
          setEngineerData(engineer);
          setShowSetupForm(false);
          return;
        } catch (err) {
          console.log("Stored engineer ID not found, will search...");
          // If engineer not found by ID, clear it and continue
          localStorage.removeItem(`engineerId_${email}`);
        }
      }
      
      // Try to find engineer by searching all engineers
      console.log("Searching for engineer profile...");
      const allEngineers = await api.getEngineers({ limit: 100 });
      console.log(`Found ${allEngineers.engineers.length} total engineers`);
      
      // Look for engineer that might belong to this user
      // First try exact match with email prefix
      const username = email.split("@")[0];
      let engineer = allEngineers.engineers.find(e => 
        e.github_username.toLowerCase() === username.toLowerCase()
      );
      
      if (engineer) {
        console.log("Using engineer profile:", engineer.github_username);
        setEngineerData(engineer);
        setShowSetupForm(false);
        // Store engineer ID for THIS user
        localStorage.setItem(`engineerId_${email}`, engineer.id);
      } else {
        console.log("No engineer profile found, showing setup form");
        // No profile found, show setup form
        setShowSetupForm(true);
      }
    } catch (err: any) {
      console.error("Error fetching engineer data:", err);
      // If we can't fetch engineers list, show setup form
      setShowSetupForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!setupData.githubUsername.trim()) {
      setError("GitHub username is required");
      return;
    }

    if (!setupData.name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setSetupLoading(true);
      setError("");

      // Check if engineer with this GitHub username already exists
      const existingEngineer = await api.getEngineerByGithubUsername(setupData.githubUsername.trim());
      
      if (existingEngineer) {
        // Engineer already exists, just use it
        setEngineerData(existingEngineer);
        setShowSetupForm(false);
        // Store engineer ID for THIS user
        localStorage.setItem(`engineerId_${userEmail}`, existingEngineer.id);
        setError("");
        return;
      }

      // Create engineer profile
      const newEngineer = await api.createEngineer({
        github_username: setupData.githubUsername.trim(),
        name: setupData.name.trim(),
        role: setupData.role.trim() || "Software Engineer",
        location: setupData.location.trim() || undefined,
        skills: [],
        experience: 0,
      });

      // Sync data from GitHub
      const syncedEngineer = await api.syncEngineer(newEngineer.id);
      
      setEngineerData(syncedEngineer);
      setShowSetupForm(false);
      
      // Store engineer ID for THIS user
      localStorage.setItem(`engineerId_${userEmail}`, syncedEngineer.id);
    } catch (err: any) {
      console.error("Error creating engineer profile:", err);
      setError(err.response?.data?.detail || "Failed to create profile. Please try again.");
    } finally {
      setSetupLoading(false);
    }
  };

  const handleSelectProfile = (profile: Engineer) => {
    setEngineerData(profile);
    setShowProfileSelection(false);
    setShowSetupForm(false);
    // Store engineer ID for THIS user
    localStorage.setItem(`engineerId_${userEmail}`, profile.id);
  };

  if (loading) {
    return (
      <DashboardLayout role="ENGINEER">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show profile selection if multiple profiles exist
  if (showProfileSelection) {
    return (
      <DashboardLayout role="ENGINEER">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 mx-auto">
                <User className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-center text-2xl">Select Your Profile</CardTitle>
              <CardDescription className="text-center">
                Multiple engineer profiles found. Please select yours:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableProfiles.map((profile) => (
                <Card 
                  key={profile.id} 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectProfile(profile)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      {profile.avatar && (
                        <img 
                          src={profile.avatar} 
                          alt={profile.name}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{profile.name}</h3>
                        <p className="text-sm text-muted-foreground">@{profile.github_username}</p>
                        {profile.role && (
                          <p className="text-sm text-muted-foreground">{profile.role}</p>
                        )}
                      </div>
                      <Button variant="outline">Select</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="pt-4 text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowProfileSelection(false);
                    setShowSetupForm(true);
                  }}
                >
                  Create New Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Show GitHub profile setup form for new users
  if (showSetupForm) {
    return (
      <DashboardLayout role="ENGINEER">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 mx-auto">
                <Github className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-center text-2xl">Complete Your Profile</CardTitle>
              <CardDescription className="text-center">
                Connect your GitHub account to sync your projects and showcase your skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSetupSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="githubUsername">
                    GitHub Username <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="githubUsername"
                      type="text"
                      placeholder="your-github-username"
                      value={setupData.githubUsername}
                      onChange={(e) => setSetupData({ ...setupData, githubUsername: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter your GitHub username to import your repositories and contributions
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={setupData.name}
                    onChange={(e) => setSetupData({ ...setupData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role / Title</Label>
                  <Input
                    id="role"
                    type="text"
                    placeholder="e.g., Full Stack Developer, Backend Engineer"
                    value={setupData.role}
                    onChange={(e) => setSetupData({ ...setupData, role: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., San Francisco, CA"
                    value={setupData.location}
                    onChange={(e) => setSetupData({ ...setupData, location: e.target.value })}
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={setupLoading}
                  >
                    {setupLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Profile & Syncing Data...
                      </>
                    ) : (
                      <>
                        <Github className="mr-2 h-4 w-4" />
                        Connect GitHub & Create Profile
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  We'll fetch your public GitHub data including repositories, contributions, and languages
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!engineerData) {
    return (
      <DashboardLayout role="ENGINEER">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load profile data. Please refresh the page or try again later.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  // Calculate profile completeness based on available data
  const profileCompleteness = Math.round(
    ((engineerData.name ? 1 : 0) +
    (engineerData.bio ? 1 : 0) +
    (engineerData.role ? 1 : 0) +
    (engineerData.location ? 1 : 0) +
    (engineerData.skills.length > 0 ? 1 : 0) +
    (engineerData.avatar ? 1 : 0)) / 6 * 100
  );

  const trustScore = engineerData.trust_score || 0;
  const compatibilityScore = engineerData.compatibility_score || 0;
  const yearsExperience = engineerData.experience || 0;

  // Transform top languages for display
  const topSkills = engineerData.top_languages.slice(0, 5).map(lang => ({
    name: lang.name,
    percentage: Math.round(lang.percentage),
    color: lang.color || "bg-primary"
  }));

  // Extract trust indicators from trust_evidence
  const trustEvidence = engineerData.trust_evidence || {};
  const trustIndicators = [
    { 
      label: "Recent Commits", 
      value: trustEvidence.recent_commits || 0, 
      status: "good" 
    },
    { 
      label: "Contribution Streak", 
      value: `${trustEvidence.contribution_streak || 0} days`, 
      status: "good" 
    },
    { 
      label: "Email Verified", 
      value: trustEvidence.verified_email ? "Yes" : "No", 
      status: trustEvidence.verified_email ? "good" : "warning" 
    },
    { 
      label: "Profile Complete", 
      value: trustEvidence.profile_complete ? "Yes" : "No", 
      status: trustEvidence.profile_complete ? "good" : "warning" 
    },
  ];

  // Get popular repos for evidence section
  const popularRepos = trustEvidence.popular_repos || [];
  const topRepositories = popularRepos.slice(0, 3).map((repoName: string) => ({
    name: repoName,
    description: `Repository: ${repoName}`,
    stars: 0, // We don't have individual star counts
    techStack: engineerData.skills.slice(0, 3),
  }));

  // Extract compatibility breakdown
  const compatibilityBreakdown = engineerData.compatibility_breakdown || {};
  const compatibilityDetails = [
    { label: "Skill Match", value: compatibilityBreakdown.skill_match || 0 },
    { label: "Experience Level", value: compatibilityBreakdown.experience || 0 },
    { label: "Activity Consistency", value: compatibilityBreakdown.activity_consistency || 0 },
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
                  <p className="text-lg font-semibold">{engineerData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <p className="text-lg font-semibold">{engineerData.role || "Software Engineer"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">GitHub Username</p>
                  <p className="text-lg font-semibold">@{engineerData.github_username}</p>
                </div>
                {engineerData.location && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <p className="text-lg font-semibold">{engineerData.location}</p>
                  </div>
                )}
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
                    <p className="text-2xl font-bold">{engineerData.skills.length}</p>
                    <p className="text-xs text-muted-foreground">Skills</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <Star className="mx-auto mb-1 text-primary" size={20} />
                    <p className="text-2xl font-bold">{engineerData.total_stars}</p>
                    <p className="text-xs text-muted-foreground">Stars</p>
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
              {topSkills.length > 0 ? (
                topSkills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-sm text-muted-foreground">{skill.percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ 
                          width: `${skill.percentage}%`,
                          backgroundColor: skill.color 
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No language data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>GitHub Statistics</CardTitle>
              <CardDescription>Your activity and contributions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Repositories</p>
                  <p className="text-2xl font-bold">{engineerData.total_repos}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Commits</p>
                  <p className="text-2xl font-bold">{engineerData.total_commits}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Stars Received</p>
                  <p className="text-2xl font-bold">{engineerData.total_stars}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Forks</p>
                  <p className="text-2xl font-bold">{engineerData.total_forks}</p>
                </div>
              </div>
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
                    <span className="text-3xl font-bold">{Math.round(compatibilityScore)}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Overall Compatibility</h3>
                <div className="space-y-2 w-full">
                  {compatibilityDetails.map((detail) => (
                    <div key={detail.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{detail.label}</span>
                      <span className="font-semibold">{Math.round(detail.value)}%</span>
                    </div>
                  ))}
                  {engineerData.highlights.length > 0 && (
                    <div className="pt-2 space-y-1">
                      {engineerData.highlights.slice(0, 3).map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
                    <span className="text-3xl font-bold text-green-500">{Math.round(trustScore)}</span>
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
                      {indicator.status === "good" ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : (
                        <AlertCircle size={16} className="text-yellow-500" />
                      )}
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
              Skills & Technologies
            </CardTitle>
            <CardDescription>Your technical expertise</CardDescription>
          </CardHeader>
          <CardContent>
            {engineerData.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {engineerData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-sm py-1 px-3">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No skills data available</p>
            )}
          </CardContent>
        </Card>

        {topRepositories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch size={20} />
                Popular Repositories
              </CardTitle>
              <CardDescription>Your most notable projects</CardDescription>
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
        )}
      </div>
    </DashboardLayout>
  );
}

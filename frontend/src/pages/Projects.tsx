import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  GitBranch,
  Star,
  GitFork,
  ExternalLink,
  Loader2,
  AlertCircle,
  Code,
  Calendar,
  TrendingUp,
  Eye
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, Engineer } from "@/services/api";

interface Repository {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  updated_at: string;
  topics: string[];
}

export default function Projects() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");
  const [engineerData, setEngineerData] = useState<Engineer | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRepos, setLoadingRepos] = useState(false);
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
        await fetchRepositories(engineer.github_username);
      } else {
        setError("No engineer profile found.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRepositories = async (username: string) => {
    try {
      setLoadingRepos(true);
      
      // Fetch repos from GitHub API directly
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=50`);
      
      if (response.ok) {
        const repos = await response.json();
        setRepositories(repos);
      } else {
        console.error("Failed to fetch repositories");
      }
    } catch (err) {
      console.error("Error fetching repositories:", err);
    } finally {
      setLoadingRepos(false);
    }
  };

  const getLanguageColor = (language: string | null): string => {
    const colors: Record<string, string> = {
      JavaScript: "bg-yellow-400",
      TypeScript: "bg-blue-500",
      Python: "bg-blue-600",
      Java: "bg-red-500",
      "C++": "bg-pink-500",
      "C#": "bg-purple-500",
      Ruby: "bg-red-600",
      Go: "bg-cyan-500",
      Rust: "bg-orange-600",
      PHP: "bg-indigo-500",
      Swift: "bg-orange-500",
      Kotlin: "bg-purple-600",
      HTML: "bg-orange-400",
      CSS: "bg-blue-400",
    };
    return colors[language || ""] || "bg-gray-500";
  };

  if (loading) {
    return (
      <DashboardLayout role="ENGINEER">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your projects...</p>
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

  // Sort repositories by stars
  const sortedRepos = [...repositories].sort((a, b) => b.stargazers_count - a.stargazers_count);
  const topRepos = sortedRepos.slice(0, 3);
  const otherRepos = sortedRepos.slice(3);

  return (
    <DashboardLayout role="ENGINEER">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground">
              Explore your GitHub repositories and contributions
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.open(`https://github.com/${engineerData.github_username}`, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on GitHub
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Repos</p>
                  <p className="text-3xl font-bold">{repositories.length}</p>
                </div>
                <GitBranch className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Stars</p>
                  <p className="text-3xl font-bold">{engineerData.total_stars}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Forks</p>
                  <p className="text-3xl font-bold">{engineerData.total_forks}</p>
                </div>
                <GitFork className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Languages</p>
                  <p className="text-3xl font-bold">{engineerData.top_languages.length}</p>
                </div>
                <Code className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Projects */}
        {topRepos.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Top Projects</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {topRepos.map((repo) => (
                <Card key={repo.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <GitBranch className="w-5 h-5" />
                      {repo.name}
                    </CardTitle>
                    {repo.description && (
                      <CardDescription className="line-clamp-2">
                        {repo.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {repo.language && (
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`} />
                        <span className="text-sm font-medium">{repo.language}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {repo.stargazers_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="w-4 h-4" />
                        {repo.forks_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {repo.watchers_count}
                      </div>
                    </div>

                    {repo.topics && repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {repo.topics.slice(0, 3).map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        Updated {new Date(repo.updated_at).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(repo.html_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Repositories */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            All Repositories
            {loadingRepos && <Loader2 className="inline ml-2 w-5 h-5 animate-spin" />}
          </h2>
          
          {repositories.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No repositories found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {otherRepos.map((repo) => (
                <Card key={repo.name} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <GitBranch className="w-5 h-5 flex-shrink-0" />
                          <h3 className="font-semibold truncate">{repo.name}</h3>
                          {repo.language && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
                              {repo.language}
                            </Badge>
                          )}
                        </div>
                        
                        {repo.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                            {repo.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {repo.stargazers_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <GitFork className="w-3 h-3" />
                            {repo.forks_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(repo.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(repo.html_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Language Distribution */}
        {engineerData.top_languages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Language Distribution
              </CardTitle>
              <CardDescription>Your most used programming languages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engineerData.top_languages.map((lang) => (
                  <div key={lang.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${getLanguageColor(lang.name)}`} />
                        <span className="text-sm font-medium">{lang.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{lang.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getLanguageColor(lang.name)}`}
                        style={{ width: `${lang.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User,
  Mail,
  MapPin,
  Briefcase,
  Github,
  Calendar,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, Engineer } from "@/services/api";

export default function MyProfile() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");
  const [engineerData, setEngineerData] = useState<Engineer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    location: "",
    bio: "",
    skills: [] as string[],
    experience: 0,
  });

  const [newSkill, setNewSkill] = useState("");

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
        setFormData({
          name: engineer.name,
          role: engineer.role || "",
          location: engineer.location || "",
          bio: engineer.bio || "",
          skills: engineer.skills,
          experience: engineer.experience,
        });
      } else {
        setError("No engineer profile found.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!engineerData) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.updateEngineer(engineerData.id, formData);
      
      setSuccess("Profile updated successfully!");
      await fetchEngineerData(userEmail);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncGitHub = async () => {
    if (!engineerData) return;

    try {
      setSyncing(true);
      setError("");
      setSuccess("");

      const synced = await api.syncEngineer(engineerData.id);
      setEngineerData(synced);
      
      setSuccess("GitHub data synced successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to sync GitHub data");
    } finally {
      setSyncing(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
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

  return (
    <DashboardLayout role="ENGINEER">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your professional information</p>
          </div>
          <Button onClick={handleSyncGitHub} disabled={syncing} variant="outline">
            {syncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync GitHub Data
              </>
            )}
          </Button>
        </div>

        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Read-only)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={userEmail}
                    disabled
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role / Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Full Stack Developer"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="San Francisco, CA"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="github">GitHub Username (Read-only)</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="github"
                    value={`@${engineerData.github_username}`}
                    disabled
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself, your interests, and what you're working on..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Technologies</CardTitle>
            <CardDescription>Add or remove your technical skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                placeholder="Add a skill (e.g., React, Python, AWS)"
              />
              <Button onClick={handleAddSkill} type="button">Add</Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-sm py-1 px-3">
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {formData.skills.length === 0 && (
                <p className="text-sm text-muted-foreground">No skills added yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* GitHub Statistics (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub Statistics
            </CardTitle>
            <CardDescription>
              Last synced: {engineerData.last_synced_at 
                ? new Date(engineerData.last_synced_at).toLocaleString() 
                : "Never"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-2xl font-bold">{engineerData.total_repos}</p>
                <p className="text-sm text-muted-foreground">Repositories</p>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-2xl font-bold">{engineerData.total_commits}</p>
                <p className="text-sm text-muted-foreground">Commits</p>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-2xl font-bold">{engineerData.total_stars}</p>
                <p className="text-sm text-muted-foreground">Stars</p>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-2xl font-bold">{engineerData.total_forks}</p>
                <p className="text-sm text-muted-foreground">Forks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate("/engineer-dashboard")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

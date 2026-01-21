import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function AddEngineer() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    github_username: "",
    role: "",
    location: "",
    skills: "",
    experience: "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await api.createEngineer({
        name: formData.name,
        github_username: formData.github_username,
        role: formData.role || undefined,
        location: formData.location || undefined,
        skills: skillsArray,
        experience: parseInt(formData.experience) || 0,
      });

      setSuccess(true);
      
      // Reset form
      setFormData({
        name: "",
        github_username: "",
        role: "",
        location: "",
        skills: "",
        experience: "0",
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create engineer profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back Button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add Engineer</h1>
          <p className="text-muted-foreground">
            Create a new engineer profile from GitHub
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle2 size={20} />
            <p>Engineer profile created successfully! Redirecting to dashboard...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            <p className="font-medium">Error creating profile</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-lg p-6 shadow-md">
          {/* Name */}
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className="mt-1.5"
            />
          </div>

          {/* GitHub Username */}
          <div>
            <Label htmlFor="github_username">GitHub Username *</Label>
            <Input
              id="github_username"
              name="github_username"
              value={formData.github_username}
              onChange={handleChange}
              required
              placeholder="johndoe"
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              We'll fetch stats and calculate scores from this GitHub profile
            </p>
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Senior Software Engineer"
              className="mt-1.5"
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="San Francisco, CA"
              className="mt-1.5"
            />
          </div>

          {/* Skills */}
          <div>
            <Label htmlFor="skills">Skills *</Label>
            <Textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              required
              placeholder="React, TypeScript, Node.js, Python, AWS"
              className="mt-1.5"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Comma-separated list of skills
            </p>
          </div>

          {/* Experience */}
          <div>
            <Label htmlFor="experience">Years of Experience</Label>
            <Input
              id="experience"
              name="experience"
              type="number"
              min="0"
              max="50"
              value={formData.experience}
              onChange={handleChange}
              placeholder="5"
              className="mt-1.5"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                "Create Engineer Profile"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            * Required fields. Data will be fetched from GitHub and scores will be calculated automatically.
          </p>
        </form>
      </main>
    </div>
  );
}

import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ScoreGauge } from "@/components/ScoreGauge";
import { TrustMeter } from "@/components/TrustMeter";
import { SkillBadge } from "@/components/SkillBadge";
import { GitHubStats } from "@/components/GitHubStats";
import { CompatibilityBreakdown } from "@/components/CompatibilityBreakdown";
import { TrustEvidence } from "@/components/TrustEvidence";
import { ExplainabilityPanel } from "@/components/ExplainabilityPanel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { transformEngineerFromAPI } from "@/data/engineers";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Github,
  Briefcase,
  Calendar,
  ExternalLink,
  MessageSquare,
  Mail,
  Phone,
  Copy,
  Check,
} from "lucide-react";

export default function EngineerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Navigate back to previous page
  const handleBack = () => {
    navigate(-1);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Fetch engineer from API
  const { data: engineer, isLoading, error } = useQuery({
    queryKey: ['engineer', id],
    queryFn: async () => {
      if (!id) throw new Error('No engineer ID provided');
      const result = await api.getEngineer(id);
      return transformEngineerFromAPI(result);
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading engineer profile...</p>
        </div>
      </div>
    );
  }

  if (error || !engineer) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Engineer Not Found</h1>
          <Button variant="default" onClick={handleBack}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Engineers
        </button>

        {/* Profile Header */}
        <div className="card-elevated p-6 lg:p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col sm:flex-row gap-6 flex-1">
              <img
                src={engineer.avatar}
                alt={engineer.name}
                className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl object-cover ring-4 ring-border"
              />
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold mb-1">
                  {engineer.name}
                </h1>
                <p className="text-lg text-muted-foreground mb-3">
                  {engineer.role}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {engineer.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Github size={14} />
                    @{engineer.githubUsername}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} />
                    {engineer.experience} years exp.
                  </span>
                </div>
              </div>
            </div>

            {/* Scores */}
            <div className="flex gap-8 lg:gap-12 justify-center lg:justify-end">
              <ScoreGauge
                score={engineer.compatibilityScore}
                size="lg"
                label="Compatibility"
              />
              <ScoreGauge
                score={engineer.trustScore}
                size="lg"
                label="Trust Score"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Skills & Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {engineer.skills.map((skill) => (
                <SkillBadge key={skill} skill={skill} variant="primary" />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg">
                  <MessageSquare size={18} />
                  Contact Engineer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Contact Information</DialogTitle>
                  <DialogDescription>
                    Get in touch with {engineer.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {engineer.email ? (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Mail size={18} className="text-primary" />
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">{engineer.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(engineer.email!, 'email')}
                      >
                        {copiedField === 'email' ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </Button>
                    </div>
                  ) : null}
                  
                  {engineer.phone ? (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Phone size={18} className="text-primary" />
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">{engineer.phone}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(engineer.phone!, 'phone')}
                      >
                        {copiedField === 'phone' ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </Button>
                    </div>
                  ) : null}
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Github size={18} className="text-primary" />
                      <div>
                        <p className="text-sm font-medium">GitHub</p>
                        <p className="text-sm text-muted-foreground">@{engineer.githubUsername}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(engineer.githubUsername, 'github')}
                    >
                      {copiedField === 'github' ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </div>

                  {!engineer.email && !engineer.phone && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      <p>No contact information available.</p>
                      <p className="mt-1">Try reaching out via GitHub.</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.open(`https://github.com/${engineer.githubUsername}`, '_blank')}
            >
              <ExternalLink size={18} />
              View GitHub Profile
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* GitHub Stats */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Github size={20} className="text-primary" />
                GitHub Activity
              </h2>
              <GitHubStats
                totalRepos={engineer.totalRepos}
                totalCommits={engineer.totalCommits}
                topLanguages={engineer.topLanguages}
                recentActivity={engineer.recentActivity}
              />
            </section>

            {/* Compatibility Breakdown */}
            <section className="card-elevated p-6">
              <h2 className="text-xl font-semibold mb-6">
                Compatibility Score Breakdown
              </h2>
              <CompatibilityBreakdown
                breakdown={engineer.compatibilityBreakdown}
              />
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Trust Evidence */}
            <section className="card-elevated p-6">
              <h2 className="text-lg font-semibold mb-4">Trust & Authenticity</h2>
              <TrustMeter score={engineer.trustScore} className="mb-6" />
              <TrustEvidence evidence={engineer.trustEvidence} />
            </section>

            {/* Explainability Panel */}
            <section className="card-elevated p-6">
              <h2 className="text-lg font-semibold mb-4">
                Why This Engineer?
              </h2>
              <ExplainabilityPanel
                highlights={engineer.highlights}
                compatibilityScore={engineer.compatibilityScore}
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

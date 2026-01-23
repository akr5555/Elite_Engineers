import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bookmark,
  Users,
  TrendingUp,
  Shield,
  ChevronRight,
  Trash2,
  AlertCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SavedEngineer {
  id: string;
  name: string;
  avatar: string;
  role: string;
  skills: string[];
  compatibilityScore: number;
  trustScore: number;
  savedDate: string;
  notes: string;
}

export default function RecruiterSaved() {
  const navigate = useNavigate();
  const [savedEngineers, setSavedEngineers] = useState<SavedEngineer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || (role !== "RECRUITER" && role !== "recruiter")) {
      navigate("/login");
      return;
    }

    // For now, using mock data as there's no backend endpoint for saved engineers
    // In production, this would fetch from: api.getSavedEngineers()
    setTimeout(() => {
      setSavedEngineers([]);
      setLoading(false);
    }, 500);
  }, [navigate]);

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-blue-500";
    if (score >= 70) return "text-yellow-500";
    return "text-orange-500";
  };

  const handleRemoveSaved = (engineerId: string) => {
    // In production: api.removeSavedEngineer(engineerId)
    setSavedEngineers(prev => prev.filter(e => e.id !== engineerId));
  };

  return (
    <DashboardLayout role="RECRUITER">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Saved Engineers</h2>
            <p className="text-muted-foreground">
              Your bookmarked engineers for future reference
            </p>
          </div>
          <Card className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                <Bookmark className="text-yellow-500" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold">{savedEngineers.length}</p>
                <p className="text-sm text-muted-foreground">Saved</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Saved Engineers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading saved engineers...</p>
            </div>
          </div>
        ) : savedEngineers.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Bookmark className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-lg font-medium mb-2">No saved engineers yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Save engineers you're interested in for quick access later
              </p>
              <Button onClick={() => navigate("/recruiter-dashboard/search")}>
                Find Engineers
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedEngineers.map((engineer) => (
              <Card key={engineer.id} className="group">
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
                      <p className="text-xs text-muted-foreground">Saved {engineer.savedDate}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveSaved(engineer.id)}
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
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

                  {engineer.notes && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {engineer.notes}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 rounded-md bg-muted">
                      <p className={cn("text-xl font-bold", getScoreColor(engineer.compatibilityScore))}>
                        {engineer.compatibilityScore}%
                      </p>
                      <p className="text-xs text-muted-foreground">Match</p>
                    </div>
                    <div className="text-center p-2 rounded-md bg-muted">
                      <p className={cn("text-xl font-bold", getScoreColor(engineer.trustScore))}>
                        {engineer.trustScore}%
                      </p>
                      <p className="text-xs text-muted-foreground">Trust</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      size="sm"
                      onClick={() => navigate(`/engineer/${engineer.id}`)}
                    >
                      View Profile
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
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
              Saved Engineers Feature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-600">
              Save engineers you're interested in for quick access later. You can add notes and organize 
              your saved engineers. This feature will be fully integrated with the database in the next update, 
              allowing you to save engineers with one click from any page.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

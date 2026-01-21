import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, ExternalLink, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreGauge } from "@/components/ScoreGauge";
import { TrustMeter } from "@/components/TrustMeter";
import { SkillBadge } from "@/components/SkillBadge";
import { Engineer } from "@/data/engineers";
import { cn } from "@/lib/utils";

interface EngineerCardProps {
  engineer: Engineer;
  className?: string;
}

export function EngineerCard({ engineer, className }: EngineerCardProps) {
  const navigate = useNavigate();

  const handleAddToCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentUrl = new URL(window.location.href);
    const currentIds = currentUrl.searchParams.get("ids")?.split(",").filter(Boolean) || [];
    if (!currentIds.includes(engineer.id) && currentIds.length < 3) {
      currentIds.push(engineer.id);
    }
    navigate(`/compare?ids=${currentIds.join(",")}`);
  };

  return (
    <div
      className={cn(
        "card-elevated group p-6 transition-all duration-300 hover:-translate-y-1",
        className
      )}
    >
      <div className="flex gap-4">
        {/* Avatar and basic info */}
        <div className="flex-shrink-0">
          <img
            src={engineer.avatar}
            alt={engineer.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground text-lg truncate">
                {engineer.name}
              </h3>
              <p className="text-muted-foreground text-sm">{engineer.role}</p>
              <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                <MapPin size={12} />
                <span>{engineer.location}</span>
              </div>
            </div>
            
            {/* Compatibility Score */}
            <ScoreGauge
              score={engineer.compatibilityScore}
              size="sm"
              label="Match"
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {engineer.skills.slice(0, 5).map((skill) => (
          <SkillBadge key={skill} skill={skill} variant="primary" size="sm" />
        ))}
        {engineer.skills.length > 5 && (
          <SkillBadge
            skill={`+${engineer.skills.length - 5}`}
            variant="secondary"
            size="sm"
          />
        )}
      </div>

      {/* Trust Score */}
      <div className="mt-4">
        <TrustMeter score={engineer.trustScore} size="sm" showLabel={false} />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">Trust Score</span>
          <span className="text-xs font-medium text-foreground">
            {engineer.trustScore}%
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-border flex gap-2">
        <Link to={`/engineer/${engineer.id}`} className="flex-1">
          <Button variant="default" size="sm" className="w-full group/btn">
            View Profile
            <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAddToCompare}
          title="Add to compare"
        >
          <GitCompare size={14} />
        </Button>
      </div>
    </div>
  );
}

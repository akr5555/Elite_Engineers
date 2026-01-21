import { cn } from "@/lib/utils";

interface SkillBadgeProps {
  skill: string;
  variant?: "default" | "primary" | "secondary";
  size?: "sm" | "md";
  className?: string;
}

export function SkillBadge({
  skill,
  variant = "default",
  size = "md",
  className,
}: SkillBadgeProps) {
  const variantClasses = {
    default: "bg-muted text-muted-foreground border-border",
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary text-secondary-foreground border-secondary",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-colors",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {skill}
    </span>
  );
}

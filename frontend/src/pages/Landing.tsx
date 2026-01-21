import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import {
  Code2,
  Search,
  Shield,
  BarChart3,
  Users,
  Zap,
  ArrowRight,
  CheckCircle2,
  Github,
} from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Proof-of-Work Based",
    description:
      "We analyze real coding activity, not just resumes. Every score is backed by actual GitHub contributions.",
  },
  {
    icon: BarChart3,
    title: "Explainable Scores",
    description:
      "Understand exactly why an engineer is recommended with detailed breakdowns and visual explanations.",
  },
  {
    icon: Shield,
    title: "Trust & Authenticity",
    description:
      "Verified profiles with contribution streaks, commit history, and activity patterns you can trust.",
  },
];

const steps = [
  {
    number: "01",
    title: "Connect GitHub",
    description: "Engineers connect their GitHub profile for analysis",
  },
  {
    number: "02",
    title: "AI Analysis",
    description: "Our AI analyzes real coding patterns and contributions",
  },
  {
    number: "03",
    title: "Smart Matching",
    description: "Get matched with engineers based on proof-of-work",
  },
];

const stats = [
  { value: "10K+", label: "Engineers" },
  { value: "500+", label: "Companies" },
  { value: "95%", label: "Accuracy" },
  { value: "48h", label: "Avg. Hire Time" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>

        <div className="container mx-auto px-4 pt-20 pb-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Zap size={16} />
              AI-Powered Engineer Discovery
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up">
              Discover Elite Engineers
              <br />
              <span className="gradient-text">Based on Proof-of-Work</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up">
              Find top developers through real GitHub activity, not superficial
              metrics. Explainable AI matching with complete transparency.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up">
              <Link to="/dashboard">
                <Button variant="hero" size="xl">
                  <Search size={20} />
                  Explore Engineers
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="heroOutline" size="xl">
                  I'm a Recruiter
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <Link to="/add-engineer">
                <Button variant="heroSecondary" size="xl">
                  <Github size={20} />
                  I'm an Engineer
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto animate-fade-in">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Elite Engineers Discovery?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We believe in transparency and authenticity. Every recommendation
              is backed by real data.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="card-elevated p-8 text-center group hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-transform">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, transparent, and effective. Here's how we match you with
              the best talent.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-border -z-10" />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary/5 border-y border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Users size={48} className="mx-auto text-primary mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Find Your Next Elite Engineer?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of companies discovering top talent through
              proof-of-work.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button variant="hero" size="xl">
                  Start Exploring
                  <ArrowRight size={20} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Code2 size={18} />
              </div>
              <span className="font-semibold">Elite Engineers Discovery</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Elite Engineers Discovery. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

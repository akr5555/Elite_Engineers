export interface Engineer {
  id: string;
  name: string;
  avatar: string;
  role: string;
  location: string;
  githubUsername: string;
  skills: string[];
  compatibilityScore: number;
  trustScore: number;
  experience: number;
  totalRepos: number;
  totalCommits: number;
  topLanguages: { name: string; percentage: number; color: string }[];
  recentActivity: { date: string; commits: number }[];
  compatibilityBreakdown: {
    skillMatch: number;
    projectRelevance: number;
    experience: number;
    activityConsistency: number;
  };
  trustEvidence: {
    recentCommits: number;
    popularRepos: string[];
    contributionStreak: number;
    verifiedEmail: boolean;
    profileComplete: boolean;
  };
  highlights: string[];
}

export const engineers: Engineer[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    role: "Senior Full-Stack Engineer",
    location: "San Francisco, CA",
    githubUsername: "sarahchen",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "GraphQL"],
    compatibilityScore: 94,
    trustScore: 98,
    experience: 7,
    totalRepos: 127,
    totalCommits: 3847,
    topLanguages: [
      { name: "TypeScript", percentage: 45, color: "#3178C6" },
      { name: "JavaScript", percentage: 25, color: "#F7DF1E" },
      { name: "Python", percentage: 15, color: "#3776AB" },
      { name: "Go", percentage: 10, color: "#00ADD8" },
      { name: "Other", percentage: 5, color: "#6B7280" },
    ],
    recentActivity: [
      { date: "2024-01-15", commits: 12 },
      { date: "2024-01-16", commits: 8 },
      { date: "2024-01-17", commits: 15 },
      { date: "2024-01-18", commits: 6 },
      { date: "2024-01-19", commits: 22 },
      { date: "2024-01-20", commits: 18 },
      { date: "2024-01-21", commits: 9 },
    ],
    compatibilityBreakdown: {
      skillMatch: 96,
      projectRelevance: 92,
      experience: 95,
      activityConsistency: 93,
    },
    trustEvidence: {
      recentCommits: 156,
      popularRepos: ["react-toolkit", "node-microservices", "graphql-starter"],
      contributionStreak: 45,
      verifiedEmail: true,
      profileComplete: true,
    },
    highlights: [
      "Maintained 45-day commit streak",
      "Top contributor to 3 trending repos",
      "Consistent daily coding activity",
      "Strong TypeScript expertise (45% of code)",
    ],
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    role: "Backend Engineer",
    location: "Austin, TX",
    githubUsername: "marcusr",
    skills: ["Go", "Rust", "Kubernetes", "Docker", "gRPC", "Redis"],
    compatibilityScore: 87,
    trustScore: 92,
    experience: 5,
    totalRepos: 89,
    totalCommits: 2156,
    topLanguages: [
      { name: "Go", percentage: 55, color: "#00ADD8" },
      { name: "Rust", percentage: 25, color: "#DEA584" },
      { name: "Python", percentage: 12, color: "#3776AB" },
      { name: "Shell", percentage: 8, color: "#89E051" },
    ],
    recentActivity: [
      { date: "2024-01-15", commits: 5 },
      { date: "2024-01-16", commits: 11 },
      { date: "2024-01-17", commits: 8 },
      { date: "2024-01-18", commits: 14 },
      { date: "2024-01-19", commits: 7 },
      { date: "2024-01-20", commits: 9 },
      { date: "2024-01-21", commits: 12 },
    ],
    compatibilityBreakdown: {
      skillMatch: 88,
      projectRelevance: 85,
      experience: 90,
      activityConsistency: 85,
    },
    trustEvidence: {
      recentCommits: 98,
      popularRepos: ["go-microservices", "rust-cli-tools"],
      contributionStreak: 28,
      verifiedEmail: true,
      profileComplete: true,
    },
    highlights: [
      "Expert in distributed systems",
      "Open source contributor",
      "28-day active streak",
      "Strong Go expertise (55% of code)",
    ],
  },
  {
    id: "3",
    name: "Emily Watson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    role: "Frontend Engineer",
    location: "New York, NY",
    githubUsername: "emilyw",
    skills: ["React", "Vue.js", "CSS", "Figma", "Storybook", "Next.js"],
    compatibilityScore: 91,
    trustScore: 89,
    experience: 4,
    totalRepos: 156,
    totalCommits: 2890,
    topLanguages: [
      { name: "TypeScript", percentage: 50, color: "#3178C6" },
      { name: "JavaScript", percentage: 30, color: "#F7DF1E" },
      { name: "CSS", percentage: 15, color: "#264DE4" },
      { name: "HTML", percentage: 5, color: "#E34F26" },
    ],
    recentActivity: [
      { date: "2024-01-15", commits: 18 },
      { date: "2024-01-16", commits: 14 },
      { date: "2024-01-17", commits: 22 },
      { date: "2024-01-18", commits: 16 },
      { date: "2024-01-19", commits: 11 },
      { date: "2024-01-20", commits: 25 },
      { date: "2024-01-21", commits: 19 },
    ],
    compatibilityBreakdown: {
      skillMatch: 94,
      projectRelevance: 89,
      experience: 88,
      activityConsistency: 92,
    },
    trustEvidence: {
      recentCommits: 178,
      popularRepos: ["ui-components", "react-animations", "design-system"],
      contributionStreak: 62,
      verifiedEmail: true,
      profileComplete: true,
    },
    highlights: [
      "62-day contribution streak!",
      "UI/UX focused development",
      "Design system expert",
      "High activity consistency",
    ],
  },
  {
    id: "4",
    name: "David Kim",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    role: "ML Engineer",
    location: "Seattle, WA",
    githubUsername: "davidkim",
    skills: ["Python", "TensorFlow", "PyTorch", "MLOps", "Kubernetes", "Spark"],
    compatibilityScore: 82,
    trustScore: 95,
    experience: 6,
    totalRepos: 67,
    totalCommits: 1456,
    topLanguages: [
      { name: "Python", percentage: 70, color: "#3776AB" },
      { name: "Jupyter", percentage: 15, color: "#F37626" },
      { name: "Shell", percentage: 10, color: "#89E051" },
      { name: "Dockerfile", percentage: 5, color: "#2496ED" },
    ],
    recentActivity: [
      { date: "2024-01-15", commits: 4 },
      { date: "2024-01-16", commits: 7 },
      { date: "2024-01-17", commits: 3 },
      { date: "2024-01-18", commits: 9 },
      { date: "2024-01-19", commits: 5 },
      { date: "2024-01-20", commits: 8 },
      { date: "2024-01-21", commits: 6 },
    ],
    compatibilityBreakdown: {
      skillMatch: 80,
      projectRelevance: 78,
      experience: 92,
      activityConsistency: 78,
    },
    trustEvidence: {
      recentCommits: 67,
      popularRepos: ["ml-pipeline", "pytorch-examples", "data-processing"],
      contributionStreak: 21,
      verifiedEmail: true,
      profileComplete: true,
    },
    highlights: [
      "Deep ML expertise",
      "Published research code",
      "Production ML experience",
      "Strong Python skills (70%)",
    ],
  },
  {
    id: "5",
    name: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    role: "DevOps Engineer",
    location: "Toronto, Canada",
    githubUsername: "priyasharma",
    skills: ["Terraform", "AWS", "GCP", "Ansible", "Jenkins", "Prometheus"],
    compatibilityScore: 78,
    trustScore: 91,
    experience: 5,
    totalRepos: 45,
    totalCommits: 987,
    topLanguages: [
      { name: "HCL", percentage: 40, color: "#844FBA" },
      { name: "Python", percentage: 25, color: "#3776AB" },
      { name: "Shell", percentage: 20, color: "#89E051" },
      { name: "YAML", percentage: 15, color: "#CB171E" },
    ],
    recentActivity: [
      { date: "2024-01-15", commits: 6 },
      { date: "2024-01-16", commits: 4 },
      { date: "2024-01-17", commits: 8 },
      { date: "2024-01-18", commits: 5 },
      { date: "2024-01-19", commits: 7 },
      { date: "2024-01-20", commits: 3 },
      { date: "2024-01-21", commits: 9 },
    ],
    compatibilityBreakdown: {
      skillMatch: 75,
      projectRelevance: 80,
      experience: 82,
      activityConsistency: 76,
    },
    trustEvidence: {
      recentCommits: 54,
      popularRepos: ["terraform-modules", "k8s-configs"],
      contributionStreak: 18,
      verifiedEmail: true,
      profileComplete: true,
    },
    highlights: [
      "Infrastructure as Code expert",
      "Multi-cloud experience",
      "CI/CD pipeline specialist",
      "Strong automation skills",
    ],
  },
  {
    id: "6",
    name: "Alex Thompson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    role: "Mobile Engineer",
    location: "London, UK",
    githubUsername: "alexthompson",
    skills: ["React Native", "Swift", "Kotlin", "Firebase", "Redux", "GraphQL"],
    compatibilityScore: 85,
    trustScore: 88,
    experience: 4,
    totalRepos: 78,
    totalCommits: 1876,
    topLanguages: [
      { name: "TypeScript", percentage: 35, color: "#3178C6" },
      { name: "Swift", percentage: 30, color: "#FA7343" },
      { name: "Kotlin", percentage: 25, color: "#7F52FF" },
      { name: "JavaScript", percentage: 10, color: "#F7DF1E" },
    ],
    recentActivity: [
      { date: "2024-01-15", commits: 10 },
      { date: "2024-01-16", commits: 8 },
      { date: "2024-01-17", commits: 12 },
      { date: "2024-01-18", commits: 9 },
      { date: "2024-01-19", commits: 15 },
      { date: "2024-01-20", commits: 11 },
      { date: "2024-01-21", commits: 7 },
    ],
    compatibilityBreakdown: {
      skillMatch: 86,
      projectRelevance: 84,
      experience: 85,
      activityConsistency: 86,
    },
    trustEvidence: {
      recentCommits: 89,
      popularRepos: ["rn-starter", "ios-components", "android-utils"],
      contributionStreak: 32,
      verifiedEmail: true,
      profileComplete: true,
    },
    highlights: [
      "Cross-platform expertise",
      "Published mobile apps",
      "32-day active streak",
      "Strong TypeScript skills",
    ],
  },
];

export const getEngineerById = (id: string): Engineer | undefined => {
  return engineers.find((eng) => eng.id === id);
};

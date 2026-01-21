# PROMPT FOR LOVABLE - Elite Engineer Discovery Platform

Build a modern, professional Engineer Discovery Platform called "Elite" with the following requirements:

## PROJECT OVERVIEW
A platform that helps companies find elite engineers based on proof-of-work (GitHub analysis) rather than resumes. Features explainable AI scoring, trust verification, and smart matching.

## TECH STACK
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui components  
- React Router for navigation
- TanStack Query for data fetching
- Recharts for data visualization
- Lucide React for icons

## PAGES NEEDED

### 1. Landing Page
- Modern hero section with gradient background and animated text
- Grid pattern background with radial mask
- Animated badge: "🔥 AI-Powered Engineer Discovery"
- Headline: "Discover Elite Engineers Based on Proof-of-Work"
- Subheadline explaining the value proposition
- Two CTA buttons: "Explore Engineers" → /dashboard, "For Engineers" (secondary)
- Feature cards section (3 cards):
  * Proof-of-Work Based (Code2 icon)
  * Explainable Scores (BarChart3 icon)  
  * Trust & Authenticity (Shield icon)
- "How It Works" section with 3 steps (numbered 01, 02, 03)
- Statistics section: 10K+ Engineers, 500+ Companies, 95% Accuracy, 48h Avg. Hire Time
- Testimonials carousel
- Final CTA section
- Smooth animations with fade-in effects

### 2. Dashboard Page
- Navbar with logo, navigation links
- Page header: "Find Elite Engineers" + description
- Stats cards grid (2 cols mobile, 4 cols desktop):
  * Total Engineers (Users icon)
  * Highly Trusted (Award icon)
  * 90%+ Match (TrendingUp icon)
  * Active Today (Zap icon)
- Search bar with real-time filtering
- Multi-select skills filter (dropdown with checkboxes)
- Engineer cards grid (1 col mobile, 2 tablet, 3 desktop):
  * Avatar image (circular)
  * Name and role
  * Location (MapPin icon)
  * Skills as badge pills
  * Two circular score gauges: Compatibility & Trust (0-100)
  * GitHub stats: repos count, commits count
  * "View Profile" button
- Hover effects with scale and shadow

### 3. Engineer Profile Page
- Back button to dashboard
- Profile header card:
  * Large avatar (rounded)
  * Name, role, location
  * GitHub username link
  * Years of experience
  * Two large score gauges (Compatibility & Trust)
- Contact Engineer button (primary)
- Add to Compare button (secondary)
- Skills section with modern badge pills
- GitHub Statistics card:
  * Total Repos, Total Commits
  * Top Languages horizontal bar chart (with colors)
- Recent Activity card:
  * 7-day commit chart (area chart with gradient)
  * Interactive tooltip
- Compatibility Breakdown card:
  * Skill Match (progress bar)
  * Project Relevance (progress bar)
  * Experience (progress bar)
  * Activity Consistency (progress bar)
- Trust Evidence card:
  * Recent commits count
  * Popular repos list
  * Contribution streak badge
  * Verified email checkmark
  * Profile complete checkmark
- Explainability Panel (expandable accordion):
  * "Why is this engineer recommended?"
  * Detailed reasoning points
  * Data-driven explanations

### 4. Compare Page
- Select up to 3 engineers for comparison
- Dropdown multi-select
- Side-by-side comparison table:
  * Scores (visual gauges)
  * Skills (badge pills)
  * GitHub stats (numbers)
  * Activity charts (mini versions)
- Highlight differences visually
- Clear winner indicators

### 5. 404 Not Found Page
- Centered layout
- Large 404 text
- Message: "Page not found"
- "Back to Home" button

## DESIGN REQUIREMENTS

### Visual Style
- Modern glassmorphism effects with backdrop-blur
- Card elevated shadow: `shadow-lg hover:shadow-xl`
- Gradient accents on primary elements
- Smooth transitions (transition-all duration-300)
- Border radius: rounded-xl for cards
- Consistent spacing with Tailwind scale

### Color Palette
- Primary: Blue gradient (#3B82F6 to #8B5CF6)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Muted: Gray shades
- Background: Light mode white, dark mode slate-950
- Text: Proper contrast ratios

### Typography
- Font: Inter or system-ui
- Headings: font-bold, gradient text on accents
- Body: text-base, text-muted-foreground
- Proper hierarchy with size scale

### Animations
- Fade in on load: opacity-0 → opacity-100
- Slide up on scroll
- Hover scale: scale-105
- Smooth transitions: transition-all
- Loading skeletons for data fetching

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl
- Stack cards on mobile
- Hide/show elements based on screen size
- Touch-friendly tap targets (min 44px)

## COMPONENTS TO BUILD

### Core Components
- **Navbar**: Logo, nav links (Landing, Dashboard, Compare), theme toggle, user avatar dropdown
- **EngineerCard**: Compact card for grid display with all key info
- **ScoreGauge**: Circular progress indicator (0-100) with size variants (sm, md, lg)
- **TrustMeter**: Visual trust indicator with icons
- **SkillBadge**: Modern pill badge with hover effects
- **GitHubStats**: Stats display with icons and formatting
- **CompatibilityBreakdown**: Progress bars with labels and percentages
- **TrustEvidence**: Evidence panel with checkmarks and badges
- **ExplainabilityPanel**: Accordion with detailed reasoning
- **SearchFilters**: Combined search + multi-select
- **ThemeToggle**: Sun/Moon icon toggle

### UI Components (shadcn/ui)
Use these from shadcn: button, card, badge, input, select, avatar, accordion, progress, tabs, tooltip, dialog, dropdown-menu, scroll-area

## DATA STRUCTURE

```typescript
interface Engineer {
  id: string;
  name: string;
  avatar: string;
  role: string;
  location: string;
  githubUsername: string;
  skills: string[];
  compatibilityScore: number; // 0-100
  trustScore: number; // 0-100
  experience: number; // years
  totalRepos: number;
  totalCommits: number;
  topLanguages: Array<{
    name: string;
    percentage: number;
    color: string;
  }>;
  recentActivity: Array<{
    date: string;
    commits: number;
  }>;
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
```

## SAMPLE DATA

Create 8+ sample engineers with realistic data:
- Names: Mix of diverse backgrounds
- Roles: Senior Full-Stack, Backend Engineer, Frontend Developer, DevOps Engineer, etc.
- Skills: React, TypeScript, Node.js, Python, Go, Rust, Kubernetes, etc.
- Scores: Vary between 75-98 for realism
- GitHub stats: Realistic numbers (50-200 repos, 1000-5000 commits)
- Languages: TypeScript, JavaScript, Python, Go, Rust, C++, etc. with proper color codes
- Activity: 7 days of commit data with variation
- Highlights: 3-5 unique highlights per engineer

## MODERN UI PRACTICES

1. **Accessibility**
   - ARIA labels on all interactive elements
   - Keyboard navigation support
   - Focus indicators
   - Semantic HTML (header, main, section, article)

2. **Performance**
   - Lazy load images
   - Code splitting by route
   - Memoize expensive calculations
   - Virtual scrolling for large lists (if needed)

3. **User Experience**
   - Loading states with skeletons
   - Error boundaries
   - Toast notifications for actions
   - Smooth page transitions
   - Optimistic UI updates

4. **Code Quality**
   - TypeScript strict mode
   - Proper component composition
   - Custom hooks for logic reuse
   - Clear prop interfaces
   - Comments for complex logic

## SPECIFIC FEATURES

### Score Gauges
- Circular progress (0-100)
- Color coded:
  * 90-100: Green
  * 75-89: Blue  
  * 60-74: Amber
  * <60: Red
- Animated on mount
- Size variants: sm (60px), md (80px), lg (120px)

### Charts
- **Language Chart**: Horizontal stacked bar with labels
- **Activity Chart**: 7-day area chart with gradient fill
- Responsive and tooltip-enabled
- Use Recharts library

### Filtering
- Real-time search (debounced 300ms)
- Multi-select skills filter
- Combine filters with AND logic
- Show result count
- Clear filters button

### Dark Mode
- Toggle in navbar
- Persist preference in localStorage
- Smooth transition
- All components support both themes

## SPECIAL TOUCHES

1. **Gradient Text**: Use on headlines
   ```css
   background: linear-gradient(to right, #3B82F6, #8B5CF6);
   -webkit-background-clip: text;
   -webkit-text-fill-color: transparent;
   ```

2. **Glass Effect**: Cards with backdrop blur
   ```css
   background: rgba(255, 255, 255, 0.1);
   backdrop-filter: blur(10px);
   border: 1px solid rgba(255, 255, 255, 0.2);
   ```

3. **Micro Interactions**:
   - Button press effect (scale-95 on click)
   - Card hover lift (translateY(-4px))
   - Badge pulse animation
   - Icon rotations on hover

4. **Professional Polish**:
   - Consistent spacing (use Tailwind spacing scale)
   - Proper visual hierarchy
   - Attention to detail in alignment
   - Professional color combinations
   - High-quality placeholder images (Unsplash)

## ROUTING

```typescript
/ → Landing Page
/dashboard → Dashboard (list of engineers)
/engineer/:id → Engineer Profile
/compare → Compare Page
* → 404 Not Found
```

## FINAL NOTES

- Make it look production-ready, not like a demo
- Every element should have purpose and polish
- Use real-world data patterns
- Think "modern SaaS platform"
- Prioritize user experience and visual appeal
- Make it responsive and accessible
- Add smooth animations throughout
- Use proper TypeScript types everywhere

Build this as a complete, professional platform that showcases modern React and UI best practices!

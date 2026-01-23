import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import EngineerProfile from "./pages/EngineerProfile";
import AddEngineer from "./pages/AddEngineer";
import Compare from "./pages/Compare";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EngineerDashboard from "./pages/EngineerDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterSearch from "./pages/RecruiterSearch";
import RecruiterPipeline from "./pages/RecruiterPipeline";
import RecruiterSaved from "./pages/RecruiterSaved";
import MyProfile from "./pages/MyProfile";
import Insights from "./pages/Insights";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/engineer-dashboard" element={<EngineerDashboard />} />
          <Route path="/engineer-dashboard/profile" element={<MyProfile />} />
          <Route path="/engineer-dashboard/insights" element={<Insights />} />
          <Route path="/engineer-dashboard/projects" element={<Projects />} />
          <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter-dashboard/search" element={<RecruiterSearch />} />
          <Route path="/recruiter-dashboard/pipeline" element={<RecruiterPipeline />} />
          <Route path="/recruiter-dashboard/saved" element={<RecruiterSaved />} />
          <Route path="/engineer/:id" element={<EngineerProfile />} />
          <Route path="/add-engineer" element={<AddEngineer />} />
          <Route path="/compare" element={<Compare />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

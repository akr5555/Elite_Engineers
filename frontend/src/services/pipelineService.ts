/**
 * Pipeline Service - Manages recruiter's candidate pipeline
 * Stores pipeline data in localStorage for now
 */

export interface PipelineCandidate {
  id: string;
  engineerId: string;
  name: string;
  avatar: string;
  role: string;
  skills: string[];
  compatibilityScore: number;
  trustScore: number;
  location: string;
  experience: number;
  stage: "viewed" | "shortlisted" | "contacted" | "interview" | "offer" | "hired";
  addedDate: string;
  notes: string;
  rankScore: number; // Combined score for ranking
}

const PIPELINE_STORAGE_KEY = "recruiter_pipeline";

/**
 * Calculate a rank score for sorting candidates
 * Formula: (compatibilityScore * 0.6) + (trustScore * 0.4)
 */
function calculateRankScore(compatibilityScore: number, trustScore: number): number {
  return Math.round((compatibilityScore * 0.6) + (trustScore * 0.4));
}

/**
 * Get all pipeline candidates
 */
export function getPipelineCandidates(): PipelineCandidate[] {
  try {
    const stored = localStorage.getItem(PIPELINE_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load pipeline:", error);
    return [];
  }
}

/**
 * Add engineer to pipeline
 */
export function addToPipeline(engineer: {
  id: string;
  name: string;
  avatar: string;
  role: string;
  skills: string[];
  compatibilityScore: number;
  trustScore: number;
  location: string;
  experience: number;
}): boolean {
  try {
    const pipeline = getPipelineCandidates();
    
    // Check if already in pipeline
    if (pipeline.some(c => c.engineerId === engineer.id)) {
      return false; // Already exists
    }

    const newCandidate: PipelineCandidate = {
      id: `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      engineerId: engineer.id,
      name: engineer.name,
      avatar: engineer.avatar,
      role: engineer.role,
      skills: engineer.skills,
      compatibilityScore: engineer.compatibilityScore,
      trustScore: engineer.trustScore,
      location: engineer.location,
      experience: engineer.experience,
      stage: "viewed",
      addedDate: new Date().toISOString(),
      notes: "",
      rankScore: calculateRankScore(engineer.compatibilityScore, engineer.trustScore)
    };

    pipeline.push(newCandidate);
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(pipeline));
    return true;
  } catch (error) {
    console.error("Failed to add to pipeline:", error);
    return false;
  }
}

/**
 * Remove engineer from pipeline
 */
export function removeFromPipeline(pipelineId: string): boolean {
  try {
    const pipeline = getPipelineCandidates();
    const filtered = pipeline.filter(c => c.id !== pipelineId);
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Failed to remove from pipeline:", error);
    return false;
  }
}

/**
 * Check if engineer is in pipeline
 */
export function isInPipeline(engineerId: string): boolean {
  const pipeline = getPipelineCandidates();
  return pipeline.some(c => c.engineerId === engineerId);
}

/**
 * Update candidate stage
 */
export function updateCandidateStage(
  pipelineId: string, 
  stage: PipelineCandidate["stage"]
): boolean {
  try {
    const pipeline = getPipelineCandidates();
    const candidate = pipeline.find(c => c.id === pipelineId);
    if (!candidate) return false;

    candidate.stage = stage;
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(pipeline));
    return true;
  } catch (error) {
    console.error("Failed to update stage:", error);
    return false;
  }
}

/**
 * Update candidate notes
 */
export function updateCandidateNotes(pipelineId: string, notes: string): boolean {
  try {
    const pipeline = getPipelineCandidates();
    const candidate = pipeline.find(c => c.id === pipelineId);
    if (!candidate) return false;

    candidate.notes = notes;
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(pipeline));
    return true;
  } catch (error) {
    console.error("Failed to update notes:", error);
    return false;
  }
}

/**
 * Get pipeline candidates sorted by rank score (highest first)
 */
export function getPipelineCandidatesSorted(): PipelineCandidate[] {
  const candidates = getPipelineCandidates();
  return candidates.sort((a, b) => b.rankScore - a.rankScore);
}

/**
 * Get pipeline stats
 */
export function getPipelineStats() {
  const pipeline = getPipelineCandidates();
  return {
    total: pipeline.length,
    viewed: pipeline.filter(c => c.stage === "viewed").length,
    shortlisted: pipeline.filter(c => c.stage === "shortlisted").length,
    contacted: pipeline.filter(c => c.stage === "contacted").length,
    interview: pipeline.filter(c => c.stage === "interview").length,
    offer: pipeline.filter(c => c.stage === "offer").length,
    hired: pipeline.filter(c => c.stage === "hired").length,
  };
}

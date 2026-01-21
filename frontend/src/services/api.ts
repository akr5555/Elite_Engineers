/**
 * API service for frontend-backend communication.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface Engineer {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  location?: string;
  github_username: string;
  bio?: string;
  skills: string[];
  experience: number;
  compatibility_score: number;
  trust_score: number;
  total_repos: number;
  total_commits: number;
  total_stars: number;
  total_forks: number;
  top_languages: Array<{
    name: string;
    percentage: number;
    color: string;
  }>;
  recent_activity: Array<{
    date: string;
    commits: number;
  }>;
  compatibility_breakdown: {
    skill_match: number;
    project_relevance: number;
    experience: number;
    activity_consistency: number;
  };
  trust_evidence: {
    recent_commits: number;
    popular_repos: string[];
    contribution_streak: number;
    verified_email: boolean;
    profile_complete: boolean;
  };
  highlights: string[];
  created_at: string;
  updated_at?: string;
  last_synced_at?: string;
}

interface EngineerList {
  total: number;
  skip: number;
  limit: number;
  engineers: Engineer[];
}

interface CreateEngineerData {
  name: string;
  github_username: string;
  role?: string;
  location?: string;
  bio?: string;
  skills: string[];
  experience: number;
}

interface UpdateEngineerData {
  name?: string;
  role?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: number;
}

interface QueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  skills?: string;
  min_trust_score?: number;
  min_compatibility_score?: number;
}

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorData;

    try {
      errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // Response body is not JSON
    }

    throw new APIError(errorMessage, response.status, errorData);
  }

  return response.json();
}

export const api = {
  /**
   * Get all engineers with optional filtering
   */
  async getEngineers(params?: QueryParams): Promise<EngineerList> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.skills) queryParams.append('skills', params.skills);
      if (params.min_trust_score !== undefined) {
        queryParams.append('min_trust_score', params.min_trust_score.toString());
      }
      if (params.min_compatibility_score !== undefined) {
        queryParams.append('min_compatibility_score', params.min_compatibility_score.toString());
      }
    }

    const url = `${API_BASE_URL}/engineers?${queryParams.toString()}`;
    const response = await fetch(url);
    return handleResponse<EngineerList>(response);
  },

  /**
   * Get a specific engineer by ID
   */
  async getEngineer(id: string): Promise<Engineer> {
    const response = await fetch(`${API_BASE_URL}/engineers/${id}`);
    return handleResponse<Engineer>(response);
  },

  /**
   * Create a new engineer profile
   */
  async createEngineer(data: CreateEngineerData): Promise<Engineer> {
    const response = await fetch(`${API_BASE_URL}/engineers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Engineer>(response);
  },

  /**
   * Update an existing engineer profile
   */
  async updateEngineer(id: string, data: UpdateEngineerData): Promise<Engineer> {
    const response = await fetch(`${API_BASE_URL}/engineers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Engineer>(response);
  },

  /**
   * Sync engineer data from GitHub
   */
  async syncEngineer(id: string): Promise<Engineer> {
    const response = await fetch(`${API_BASE_URL}/engineers/${id}/sync`, {
      method: 'POST',
    });
    return handleResponse<Engineer>(response);
  },

  /**
   * Delete an engineer profile
   */
  async deleteEngineer(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/engineers/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new APIError(
        `Failed to delete engineer: ${response.statusText}`,
        response.status
      );
    }
  },

  /**
   * Compare multiple engineers
   */
  async compareEngineers(ids: string[]): Promise<Engineer[]> {
    const idsParam = ids.join(',');
    const response = await fetch(`${API_BASE_URL}/engineers/compare/?ids=${idsParam}`);
    return handleResponse<Engineer[]>(response);
  },

  /**
   * Check API health
   */
  async healthCheck(): Promise<{ status: string; environment: string; version: string }> {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return handleResponse(response);
  },
};

export type { Engineer, EngineerList, CreateEngineerData, UpdateEngineerData, QueryParams };
export { APIError };

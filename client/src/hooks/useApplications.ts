/**
 * React hooks for Credit Sentinel applications
 * Provides typed API calls with React Query integration
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiUpload } from "../lib/api";
import type {
  Application,
  Extraction,
  Score,
  Decision,
  AuditLog,
} from "../../../shared/schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateApplicationInput {
  customerName: string;
  requestedLimit: number;
  salesman: string;
  pdf: File;
}

export interface DecideApplicationInput {
  approved: boolean;
  finalLimit: number;
  notes: string;
}

export interface ApplicationDetail extends Application {
  extraction?: Extraction;
  score?: Score;
  decision?: Decision;
  auditLogs?: AuditLog[];
}

export interface DashboardStats {
  totalApplications: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  avgProcessingTime: number;
  recentApplications: Application[];
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const applicationKeys = {
  all: ["applications"] as const,
  lists: () => [...applicationKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...applicationKeys.lists(), filters] as const,
  details: () => [...applicationKeys.all, "detail"] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
  dashboard: () => ["dashboard", "stats"] as const,
  history: () => ["history"] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Create a new credit application
 * Uploads PDF and starts the LangGraph agent pipeline
 */
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateApplicationInput) => {
      const formData = new FormData();
      formData.append("pdf", input.pdf);
      formData.append("customer_name", input.customerName);
      formData.append("requested_limit", input.requestedLimit.toString());
      formData.append("salesman", input.salesman);

      return apiUpload<Application>("/api/applications", formData);
    },
    onSuccess: () => {
      // Invalidate applications list to refetch
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.dashboard() });
    },
  });
}

/**
 * Fetch all applications (with optional filters)
 */
export function useApplications(filters?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: applicationKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.limit) params.set("limit", filters.limit.toString());

      const url = `/api/applications${params.toString() ? `?${params}` : ""}`;
      return apiGet<Application[]>(url);
    },
    refetchInterval: 5000, // Poll every 5 seconds for live updates
  });
}

/**
 * Fetch a single application with all related data
 */
export function useApplication(id: string | undefined) {
  return useQuery({
    queryKey: applicationKeys.detail(id!),
    queryFn: () => apiGet<ApplicationDetail>(`/api/applications/${id}`),
    enabled: !!id,
    refetchInterval: 3000, // Poll every 3 seconds while viewing
  });
}

/**
 * Make a credit decision (approve/reject)
 */
export function useDecideApplication(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DecideApplicationInput) => {
      return apiPost<Decision>(
        `/api/applications/${applicationId}/decide`,
        input,
      );
    },
    onSuccess: () => {
      // Invalidate to refetch updated data
      queryClient.invalidateQueries({
        queryKey: applicationKeys.detail(applicationId),
      });
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.dashboard() });
    },
  });
}

/**
 * Fetch dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: applicationKeys.dashboard(),
    queryFn: () => apiGet<DashboardStats>("/api/dashboard/stats"),
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

/**
 * Fetch application history (completed applications)
 */
export function useHistory() {
  return useQuery({
    queryKey: applicationKeys.history(),
    queryFn: () => apiGet<Application[]>("/api/history"),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

/**
 * Server-Sent Events hook for real-time agent progress
 * Returns event stream for a specific application
 */
export function useAgentStream(applicationId: string | undefined) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["agent-stream", applicationId],
    queryFn: () => {
      if (!applicationId) return Promise.resolve(null);

      return new Promise<EventSource>((resolve) => {
        const eventSource = new EventSource(
          `/api/applications/${applicationId}/stream`,
          { withCredentials: true },
        );

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);

          // Update cache when agent completes a step
          if (data.status === "done") {
            queryClient.invalidateQueries({
              queryKey: applicationKeys.detail(applicationId),
            });
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
        };

        resolve(eventSource);
      });
    },
    enabled: !!applicationId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

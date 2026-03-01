/**
 * React hooks for agent task queue monitoring
 * Used in the Agent Tasks page to show real-time processing status
 */

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../lib/api";
import type { AgentTask } from "../../../shared/schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AgentTasksResponse {
  tasks: AgentTask[];
  summary: {
    total: number;
    running: number;
    completed: number;
    failed: number;
  };
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const agentTaskKeys = {
  all: ["agent-tasks"] as const,
  list: () => [...agentTaskKeys.all, "list"] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Fetch current agent task queue
 * Polls every 2 seconds for real-time updates
 */
export function useAgentTasks() {
  return useQuery({
    queryKey: agentTaskKeys.list(),
    queryFn: async () => {
      const response = await apiGet<AgentTask[]>("/api/agent-tasks");

      // Calculate summary statistics
      const summary = {
        total: response.length,
        running: response.filter((t) => t.status === "running").length,
        completed: response.filter((t) => t.status === "completed").length,
        failed: response.filter((t) => t.status === "error").length,
      };

      return {
        tasks: response,
        summary,
      } as AgentTasksResponse;
    },
    refetchInterval: 2000, // Poll every 2 seconds for live updates
    refetchIntervalInBackground: true, // Keep polling even when tab is not focused
  });
}

/**
 * Get real-time agent task status for a specific application
 */
export function useAgentTaskStatus(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["agent-task-status", applicationId],
    queryFn: async () => {
      const response = await apiGet<AgentTask[]>("/api/agent-tasks");
      return response.find((task) => task.appId === applicationId);
    },
    enabled: !!applicationId,
    refetchInterval: 1500, // Poll every 1.5 seconds for active task
  });
}

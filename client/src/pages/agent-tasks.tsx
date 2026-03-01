import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { AgentTask } from "../../../shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function AgentTasks() {
  const {
    data: tasks = [],
    isLoading,
    refetch,
  } = useQuery<AgentTask[]>({
    queryKey: ["/api/agent-tasks"],
    queryFn: () => apiGet<AgentTask[]>("/api/agent-tasks"),
    refetchInterval: 5000,
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Agent Tasks & Orchestration
            </h1>
            <p className="text-muted-foreground">
              Monitor the background work of Credit Sentinel Agent.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Filter tasks..."
                className="pl-8"
              />
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Operation Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No agent tasks yet. Upload a CTOS report to start.
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-mono text-xs">
                        {task.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {task.customerName || task.appId.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Bot className="w-3.5 h-3.5 text-primary" />
                          <span className="text-sm capitalize">
                            {task.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.status === "completed" && (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 font-bold"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </Badge>
                        )}
                        {(task.status === "running" ||
                          task.status === "queued") && (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 gap-1.5 font-bold"
                          >
                            <Clock className="w-3 h-3 animate-pulse" />{" "}
                            {task.status === "running" ? "Running" : "Queued"}
                          </Badge>
                        )}
                        {task.status === "error" && (
                          <Badge
                            variant="outline"
                            className="bg-rose-50 text-rose-700 border-rose-200 gap-1.5 font-bold"
                          >
                            <AlertCircle className="w-3 h-3" /> Error
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {timeAgo(task.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-500 max-w-[200px] truncate">
                        {task.detail}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

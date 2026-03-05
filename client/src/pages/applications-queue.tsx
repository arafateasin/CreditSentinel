import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Search,
  Calendar as CalendarIcon,
  Bot,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Application } from "../../../shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function ApplicationsQueue() {
  const {
    data: apps = [],
    isLoading,
    refetch,
  } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
    queryFn: () => apiGet<Application[]>("/api/applications"),
    refetchInterval: 10000,
  });

  // Sort applications by creation time (newest first)
  const sortedApps = [...apps].sort((a, b) => {
    return (
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Applications Queue
            </h1>
            <p className="text-muted-foreground font-medium">
              Each row represents an agent-prepared credit case.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Link href="/applications/new">
              <Button className="font-bold shadow-lg shadow-primary/10">
                + New Case
              </Button>
            </Link>
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search company or reg no..."
                    className="pl-10 h-10 border-slate-200 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px] h-10 border-slate-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="scored">Assessment Ready</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 border-slate-200"
                >
                  <CalendarIcon className="h-4 w-4 text-slate-500" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-slate-900 h-12">
                    Customer
                  </TableHead>
                  <TableHead className="font-bold text-slate-900 h-12">
                    Requested Limit
                  </TableHead>
                  <TableHead className="font-bold text-slate-900 h-12">
                    Agent Stage
                  </TableHead>
                  <TableHead className="font-bold text-slate-900 h-12">
                    Status
                  </TableHead>
                  <TableHead className="font-bold text-slate-900 h-12">
                    Age
                  </TableHead>
                  <TableHead className="text-right font-bold text-slate-900 h-12">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : apps.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-16 text-slate-400 font-medium"
                    >
                      No applications yet — upload your first CTOS report.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedApps.map((app) => (
                    <TableRow
                      key={app.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 text-sm">
                            {app.customerName}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {app.id.slice(0, 8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-700">
                        RM {app.requestedLimit?.toLocaleString() ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              app.status === "scored" ||
                                app.status === "completed"
                                ? "bg-emerald-500"
                                : app.status === "extracting" ||
                                  app.status === "scoring"
                                ? "bg-blue-500 animate-pulse"
                                : app.status === "error"
                                ? "bg-rose-500"
                                : "bg-slate-300",
                            )}
                          />
                          <span className="text-xs font-bold text-slate-600 capitalize">
                            {app.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-black text-[9px] uppercase tracking-widest px-2 py-0.5",
                            app.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : app.status === "scored"
                              ? "bg-blue-50 text-blue-700 border-blue-100"
                              : app.status === "error"
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : "bg-slate-100 text-slate-500 border-slate-200",
                          )}
                        >
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs font-bold">
                        {timeAgo(app.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={
                            app.status === "scored" ||
                            app.status === "completed"
                              ? `/applications/${app.id}/agent-pack`
                              : `/applications/${app.id}/extraction`
                          }
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            className="font-bold hover:bg-primary hover:text-white transition-all rounded-lg h-8"
                          >
                            Open <ArrowRight className="ml-2 w-3 h-3" />
                          </Button>
                        </Link>
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

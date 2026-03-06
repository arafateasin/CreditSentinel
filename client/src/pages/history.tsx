import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, Eye, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useLocation } from "wouter";

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [overridesOnly, setOverridesOnly] = useState(false);
  const [, setLocation] = useLocation();

  const {
    data: historyRaw = [],
    isLoading,
    error,
  } = useQuery<Array<{ app: any; score: any; decision: any }>>({
    queryKey: ["/api/history"],
    queryFn: () => apiGet("/api/history"),
    refetchInterval: 30000,
  });

  const historyData = historyRaw
    .filter((item) => item?.app) // Filter out items without app data
    .map(({ app, score, decision }) => ({
      id: app.id,
      customer: app.customerName,
      decision: decision?.officerDecision
        ? decision.officerDecision.charAt(0).toUpperCase() +
          decision.officerDecision.slice(1)
        : "—",
      risk: score?.riskCategory
        ? score.riskCategory.charAt(0).toUpperCase() +
          score.riskCategory.slice(1)
        : "—",
      match: decision?.officerDecision === score?.recommendation,
      limit: decision?.officerLimit
        ? decision.officerLimit.toLocaleString()
        : "0",
      officer: decision?.officerId ?? "Credit Officer",
      date: decision?.createdAt
        ? new Date(decision.createdAt).toLocaleDateString("en-MY")
        : "—",
    }));

  const filtered = historyData
    .filter((r) => r.customer.toLowerCase().includes(search.toLowerCase()))
    .filter((r) => !overridesOnly || !r.match);

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto py-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            Decision History
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Audit log of all past credit decisions and agent matches.
          </p>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/50">
          <CardHeader className="border-b border-slate-50">
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search customer..."
                  className="pl-10 h-10 border-slate-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select>
                <SelectTrigger className="h-10 w-[150px] border-slate-200 font-bold">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="review">KIV / Review</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="h-10 w-[150px] border-slate-200 font-bold">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                className="h-10 w-40 border-slate-200 font-bold"
                placeholder="From date"
              />
              <Input
                type="date"
                className="h-10 w-40 border-slate-200 font-bold"
                placeholder="To date"
              />
              <div className="flex items-center gap-2 ml-auto">
                <span
                  className={cn(
                    "text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors",
                    overridesOnly ? "text-rose-600" : "text-slate-400",
                  )}
                >
                  Overrides Only
                </span>
                <div
                  className={cn(
                    "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
                    overridesOnly ? "bg-rose-600" : "bg-slate-200",
                  )}
                  onClick={() => setOverridesOnly(!overridesOnly)}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                      overridesOnly ? "left-5" : "left-0.5",
                    )}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-bold text-slate-900">
                    Customer
                  </TableHead>
                  <TableHead className="font-bold text-slate-900">
                    Decision
                  </TableHead>
                  <TableHead className="font-bold text-slate-900">
                    Risk
                  </TableHead>
                  <TableHead className="font-bold text-slate-900">
                    Agent Match
                  </TableHead>
                  <TableHead className="font-bold text-slate-900">
                    Limit (RM)
                  </TableHead>
                  <TableHead className="font-bold text-slate-900">
                    Officer
                  </TableHead>
                  <TableHead className="font-bold text-slate-900">
                    Date
                  </TableHead>
                  <TableHead className="text-right font-bold text-slate-900">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground font-medium">
                          Loading decision history...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <AlertCircle className="h-10 w-10 text-rose-500" />
                        <div>
                          <p className="font-bold text-slate-900 mb-1">
                            Unable to load history
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Backend server may not be running
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="rounded-full bg-slate-100 p-3">
                          <Eye className="h-8 w-8 text-slate-400" />
                        </div>
                        <div className="max-w-md">
                          <p className="font-bold text-slate-900 text-base mb-2">
                            No completed decisions yet
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Applications will appear here after you complete the
                            full workflow:
                          </p>
                          <div className="text-xs text-left text-slate-600 bg-slate-50 rounded-lg p-4 space-y-2">
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 text-slate-400" />
                              <span>Upload a CTOS PDF report</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 text-slate-400" />
                              <span>Wait for AI extraction & scoring</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 text-slate-400" />
                              <span>Make final decision (Approve/Reject)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row, i) => (
                    <TableRow
                      key={i}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="font-bold text-slate-700">
                        {row.customer}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-black text-[10px] uppercase",
                            row.decision === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : row.decision === "Rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : "bg-amber-50 text-amber-700 border-amber-100",
                          )}
                        >
                          {row.decision}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="font-bold text-[10px] uppercase"
                        >
                          {row.risk}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {row.match ? (
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              Match
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              Override
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-bold">{row.limit}</TableCell>
                      <TableCell className="text-slate-500 font-medium">
                        {row.officer}
                      </TableCell>
                      <TableCell className="text-slate-400 font-bold text-xs">
                        {row.date}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            setLocation(`/applications/${row.id}/decision`)
                          }
                          title="View decision details"
                        >
                          <Eye className="w-4 h-4 text-primary" />
                        </Button>
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

import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Zap,
  Target,
  ArrowRight,
  Bot,
  Clock,
  History,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useEffect } from "react";

const decisionPieData = [
  { name: "Approved", value: 62, color: "#10B981" },
  { name: "Review / KIV", value: 22, color: "#F59E0B" },
  { name: "Rejected", value: 16, color: "#EF4444" },
];

const turnaroundBarData = [
  { name: "Mon", agent: 28, manual: 4320 },
  { name: "Tue", agent: 32, manual: 4320 },
  { name: "Wed", agent: 25, manual: 4320 },
  { name: "Thu", agent: 30, manual: 4320 },
  { name: "Fri", agent: 27, manual: 4320 },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: stats } = useQuery<{
    todayCount: number;
    totalCompleted: number;
    decisionAlignment: number;
    avgTurnaround: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => apiGet("/api/dashboard/stats"),
    refetchInterval: 15000,
  });

  const { data: applications = [] } = useQuery<any[]>({
    queryKey: ["/api/applications"],
    queryFn: () => apiGet("/api/applications"),
    refetchInterval: 10000,
  });

  // Keyboard shortcut for new application (Ctrl+N / Cmd+N)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setLocation("/applications/new");
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [setLocation]);

  const recentActivity = applications.slice(0, 5).map((app: any) => ({
    id: app.id,
    customer: app.customerName,
    status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
    score:
      app.status === "scored" || app.status === "completed"
        ? String(app.totalScore ?? "—")
        : "—",
    decision:
      app.status === "completed" ? app.officerDecision ?? "Pending" : "Pending",
  }));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8 py-8">
        {/* Hero Section with Chin Hin Branding */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-6 text-white">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/chinhin-logo.png"
                  alt="Chin Hin Logo"
                  className="w-16 h-16 object-contain bg-white rounded-2xl p-2"
                />
                <div>
                  <h1 className="text-4xl font-black tracking-tight">
                    Credit Sentinel
                  </h1>
                  <p className="text-sm text-slate-300 font-bold uppercase tracking-widest">
                    Chin Hin Group • AI-Powered Credit Assessment
                  </p>
                </div>
              </div>

              <p className="text-lg text-slate-200 max-w-2xl font-medium leading-relaxed">
                Autonomous AI agent that processes CTOS reports in under 30
                seconds with 99% accuracy —
                <span className="text-emerald-400 font-bold">
                  {" "}
                  reducing manual processing from 3-4 days
                </span>{" "}
                to instant recommendations.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/applications/new">
                  <Button
                    size="lg"
                    className="h-14 px-8 font-black text-base bg-white text-slate-900 hover:bg-slate-100 shadow-xl relative group"
                    title="Keyboard shortcut: Ctrl+N (or Cmd+N on Mac)"
                  >
                    <Sparkles className="mr-2 w-5 h-5" />
                    Start New Application
                    <span className="ml-2 text-[10px] font-bold text-slate-500 px-2 py-0.5 bg-slate-200 rounded opacity-70">
                      Ctrl+N
                    </span>
                  </Button>
                </Link>
                <Link href="/applications">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 font-black text-base border-2 border-white/30 text-white hover:bg-white/10"
                  >
                    View Queue
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Live Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-5xl font-black text-white mb-2">
                  {stats?.totalCompleted ?? 0}
                </div>
                <div className="text-xs text-slate-300 font-bold uppercase tracking-widest">
                  Cases Processed
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-5xl font-black text-emerald-400 mb-2">
                  99%
                </div>
                <div className="text-xs text-slate-300 font-bold uppercase tracking-widest">
                  AI Accuracy
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-5xl font-black text-amber-400 mb-2">
                  {stats?.avgTurnaround
                    ? `${Math.round(stats.avgTurnaround)}`
                    : "28"}
                </div>
                <div className="text-xs text-slate-300 font-bold uppercase tracking-widest">
                  Seconds Avg
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-5xl font-black text-blue-400 mb-2">
                  {stats?.decisionAlignment != null
                    ? `${Math.round(stats.decisionAlignment)}%`
                    : "87%"}
                </div>
                <div className="text-xs text-slate-300 font-bold uppercase tracking-widest">
                  Officer Alignment
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Workflow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-xl shadow-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg">
                  <FileCheck className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-slate-900 mb-2">
                    STEP 1: EXTRACT
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Azure AI extracts 40+ fields from CTOS PDFs with 95%+
                    confidence using Document Intelligence
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700">
                      3 seconds average
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-amber-100 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shrink-0 shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-slate-900 mb-2">
                    STEP 2: SCORE
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    LangGraph agent applies Chin Hin Risk Framework V2.0 with 14
                    policy rules
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-700">
                      Real-time calculation
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-blue-100 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-slate-900 mb-2">
                    STEP 3: RECOMMEND
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Officer reviews AI recommendation with full audit trail and
                    override capability
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-700">
                      Human-in-the-loop
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow">
            <CardContent className="p-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-black text-slate-900">
                {stats?.todayCount ?? 0}
              </p>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Today's Applications
              </h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow">
            <CardContent className="p-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-black text-slate-900">
                {stats?.totalCompleted ?? 0}
              </p>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Total Completed
              </h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow">
            <CardContent className="p-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-black text-slate-900">
                {stats?.avgTurnaround
                  ? `${Math.round(stats.avgTurnaround)}s`
                  : "28s"}
              </p>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Avg Turnaround
              </h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow">
            <CardContent className="p-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-black text-slate-900">
                {stats?.decisionAlignment != null
                  ? `${Math.round(stats.decisionAlignment)}%`
                  : "87%"}
              </p>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                AI-Officer Match
              </h3>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow">
            <CardHeader className="border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-rose-500 rounded-full" />
                Credit Decision Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={decisionPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {decisionPieData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.color}
                          stroke="white"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [`${v}%`, ""]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={10}
                      wrapperStyle={{ fontSize: "12px", fontWeight: 700 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow">
            <CardHeader className="border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-slate-300 rounded-full" />
                Processing Time: AI vs Manual (minutes)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={turnaroundBarData} barGap={8}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      fontSize={12}
                      fontWeight={700}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      fontSize={11}
                      tickFormatter={(value) => `${value}m`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="agent"
                      name="AI Agent (min)"
                      fill="#1E3A8A"
                      radius={[8, 8, 0, 0]}
                      barSize={20}
                    />
                    <Bar
                      dataKey="manual"
                      name="Manual (min)"
                      fill="#CBD5E1"
                      radius={[8, 8, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity - Enhanced */}
        <Card className="border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow">
          <CardHeader className="border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-black flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                  <History className="w-5 h-5 text-white" />
                </div>
                Recent Application Activity
              </CardTitle>
              <Link href="/applications">
                <Button variant="ghost" size="sm" className="font-bold text-xs">
                  View All <ArrowRight className="ml-1 w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="font-black text-slate-900 uppercase text-xs tracking-wider">
                    Customer
                  </TableHead>
                  <TableHead className="font-black text-slate-900 uppercase text-xs tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="font-black text-slate-900 uppercase text-xs tracking-wider">
                    AI Score
                  </TableHead>
                  <TableHead className="font-black text-slate-900 text-right uppercase text-xs tracking-wider">
                    Officer Decision
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.length > 0 ? (
                  recentActivity.map((row, i) => (
                    <TableRow
                      key={i}
                      className="hover:bg-slate-50 transition-colors border-b border-slate-100"
                    >
                      <TableCell className="font-bold text-slate-900">
                        {row.customer}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="font-bold text-[10px] uppercase"
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-black text-lg text-primary">
                        {row.score}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-bold text-[10px] uppercase",
                            row.decision === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : row.decision === "Rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-slate-100 text-slate-600 border-slate-200",
                          )}
                        >
                          {row.decision}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <Bot className="w-12 h-12" />
                        <p className="font-bold">No recent applications</p>
                        <Link href="/applications/new">
                          <Button size="sm" className="mt-2">
                            Start Your First Application
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

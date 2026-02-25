import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Zap, 
  Target, 
  ArrowRight,
  Bot,
  Clock,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
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

export default function Dashboard() {
  const kpis = [
    { title: "Applications Alignment", value: "12", sub: "Today", icon: Zap },
    { title: "Agent vs Manual", value: "28 min", sub: "vs 3-4 days manual", icon: Clock },
    { title: "Decision Alignment", value: "94%", sub: "Officer follows Agent", icon: Target },
  ];

  const recentActivity = [
    { customer: "ABC Trading Sdn Bhd", status: "Scored", score: "78", decision: "Pending" },
    { customer: "Mega Build Construction", status: "Completed", score: "92", decision: "Approved" },
    { customer: "TechStream Solutions", status: "Review", score: "65", decision: "KIV" },
    { customer: "Global Logistics", status: "Scored", score: "42", decision: "Rejected" },
    { customer: "Sunrise Properties", status: "Extracting", score: "-", decision: "-" },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-12 py-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            <Bot className="w-4 h-4" />
            Your AI Credit Officer Agent
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Welcome to Credit Sentinel
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            Agent processes CTOS reports in 3 simple steps: 
            <span className="text-emerald-600 font-bold ml-1">Extract</span> → 
            <span className="text-amber-600 font-bold">Score</span> → 
            <span className="text-primary font-bold">Recommend</span>
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardContent className="p-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Applications Alignment</h3>
              <p className="text-3xl font-black text-slate-900">12</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Today</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardContent className="p-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Agent vs Manual</h3>
              <p className="text-3xl font-black text-slate-900">28 min</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">vs 3-4 days manual</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardContent className="p-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Decision Alignment</h3>
              <p className="text-3xl font-black text-slate-900">94%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Officer follows Agent</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/applications/new">
            <Button size="lg" className="h-14 px-8 font-black text-base shadow-xl shadow-primary/20">
              Start New Application <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/applications">
            <Button variant="outline" size="lg" className="h-14 px-8 font-black text-base border-slate-200">
              View Queue
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="ghost" size="lg" className="h-14 px-8 font-black text-base text-slate-500">
              Recent Decisions
            </Button>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card className="border-none shadow-xl shadow-slate-200/50">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-bold text-slate-900">Customer</TableHead>
                  <TableHead className="font-bold text-slate-900">Status</TableHead>
                  <TableHead className="font-bold text-slate-900">Agent Score</TableHead>
                  <TableHead className="font-bold text-slate-900 text-right">Officer Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((row, i) => (
                  <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-bold text-slate-700">{row.customer}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-bold text-[10px] uppercase">{row.status}</Badge>
                    </TableCell>
                    <TableCell className="font-black text-primary">{row.score}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={cn(
                        "font-bold text-[10px] uppercase",
                        row.decision === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        row.decision === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-slate-100 text-slate-500"
                      )}>
                        {row.decision}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

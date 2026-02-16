import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation, useParams } from "wouter";
import { 
  CheckCircle2, 
  AlertTriangle, 
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Info,
  Clock,
  Bot,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScoreRecommendation() {
  const [, setLocation] = useLocation();
  const { id } = useParams();

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-4">
            <Link href={`/applications/${id}/extraction`}>
              <Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5"/></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Score & Explanation</h1>
              <p className="text-sm text-muted-foreground">Deep dive into Agent Reasoning for Mega Build Construction.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Link href={`/applications/${id}/extraction`}>
                <Button variant="outline">Back to Extraction</Button>
             </Link>
             <Button onClick={() => setLocation(`/applications/${id}/decision`)}>
                Proceed to Final Decision <ArrowRight className="ml-2 w-4 h-4" />
             </Button>
          </div>
        </div>

        {/* Agent Thought Process Timeline */}
        <Card className="bg-primary/5 border-primary/10 shadow-none">
          <CardHeader className="pb-3">
             <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                <Bot className="w-4 h-4" />
                Agent Thought Process
             </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col sm:flex-row items-start justify-between gap-6 relative">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-primary/10 hidden sm:block -z-0" />
                {[
                  { step: "1", title: "Data Parsing", desc: "Parsed 26 fields from CTOS", status: "completed" },
                  { step: "2", title: "Rule Engine", desc: "Applied 12 Chin Hin policy rules", status: "completed" },
                  { step: "3", title: "Risk Simulation", desc: "Simulated limit at RM 500k", status: "completed" },
                  { step: "4", title: "Rec Generation", desc: "Built rationale & category", status: "completed" }
                ].map((s, i) => (
                  <div key={i} className="flex gap-4 sm:flex-col sm:items-center sm:text-center relative z-10 sm:flex-1">
                     <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md ring-4 ring-white">
                        {s.step}
                     </div>
                     <div className="space-y-1 pt-1 sm:pt-0">
                        <p className="text-sm font-bold text-slate-900">{s.title}</p>
                        <p className="text-[11px] text-muted-foreground leading-tight">{s.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>

        {/* Score Summary Card */}
        <Card className="bg-slate-900 text-white border-slate-800 shadow-xl">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Assessment Target</p>
                <h2 className="text-2xl font-black">Mega Build Construction</h2>
                <div className="flex items-center gap-3 pt-2">
                  <div className="px-3 py-1 bg-slate-800 rounded-md border border-slate-700">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Requested</span>
                    <span className="text-sm font-bold">RM 500,000</span>
                  </div>
                  <div className="px-3 py-1 bg-slate-800 rounded-md border border-slate-700">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Application ID</span>
                    <span className="text-sm font-bold">#APP-001</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center border-x border-slate-700/50 px-8">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Final Risk Category</p>
                <div className="relative">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.78)} className="text-emerald-500" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">78</span>
                    <span className="text-[8px] text-slate-400 font-bold">/ 100</span>
                  </div>
                </div>
                <Badge className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-4 py-1">
                  LOW RISK
                </Badge>
              </div>

              <div className="flex flex-col items-center justify-center pl-4 text-center">
                <div className="bg-emerald-500/10 p-3 rounded-full mb-3 ring-1 ring-emerald-500/20">
                   <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Agent Recommendation</p>
                <span className="text-2xl font-black text-emerald-400">APPROVE</span>
                <p className="text-sm text-slate-300 font-medium mt-1">Full Limit: RM 500,000</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Key Drivers */}
          <Card className="shadow-none border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Strengths & Weaknesses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Positives
                </h3>
                <div className="space-y-2">
                   {[
                     "Strong paid-up capital (RM 500k) supports the requested limit.",
                     "Clean legal profile: No active litigation or bankruptcy history.",
                     "Established market presence (12 years) provides operational stability."
                   ].map((s, i) => (
                     <div key={i} className="flex gap-3 text-sm p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-slate-700 font-medium">{s}</span>
                     </div>
                   ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Potential Risks
                </h3>
                <div className="space-y-2">
                   {[
                     "Gearing ratio (2.8x) is slightly above the industry benchmark (2.1x).",
                     "Recent banking facility restructure indicates tighter cash flow management."
                   ].map((w, i) => (
                     <div key={i} className="flex gap-3 text-sm p-3 bg-amber-50/50 rounded-lg border border-amber-100/50">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-slate-700 font-medium">{w}</span>
                     </div>
                   ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: Policy Rules */}
          <Card className="shadow-none border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Policy Compliance Table</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-border">
                 {[
                   { name: "Minimum Capital Rule", condition: "Paid-up ≥ RM 100k", result: "RM 500k", score: "+10", pass: true },
                   { name: "Company Age Policy", condition: "Age ≥ 3 years", result: "12 years", score: "+5", pass: true },
                   { name: "Legal Blacklist Check", condition: "No active cases", result: "Clean", score: "+15", pass: true },
                   { name: "Sector Gearing Cap", condition: "Ratio < 3.0x", result: "2.8x", score: "-5", pass: false },
                   { name: "Facility Integrity", condition: "Performing Status", result: "Passed", score: "+10", pass: true },
                 ].map((rule, i) => (
                   <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <p className="font-bold text-sm text-slate-900">{rule.name}</p>
                           {rule.pass ? (
                             <Badge variant="outline" className="text-[9px] h-4 bg-emerald-50 text-emerald-700 border-emerald-200 font-bold uppercase">Pass</Badge>
                           ) : (
                             <Badge variant="outline" className="text-[9px] h-4 bg-amber-50 text-amber-700 border-amber-200 font-bold uppercase">Warning</Badge>
                           )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{rule.condition} • Found: {rule.result}</p>
                     </div>
                     <div className="text-right">
                       <span className={cn(
                         "text-sm font-black",
                         rule.score.startsWith("+") ? "text-emerald-600" : "text-rose-600"
                       )}>{rule.score}</span>
                     </div>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-slate-500" />
           </div>
           <p className="text-sm text-slate-600 leading-relaxed font-medium">
              The assessment logic follows the <span className="text-primary font-bold">Chin Hin Risk Framework V2.0</span>. While the agent achieves 99% accuracy in rule application, final discretionary power rests with the Credit Officer.
           </p>
        </div>
      </div>
    </Layout>
  );
}

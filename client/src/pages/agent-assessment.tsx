import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, useParams, Link } from "wouter";
import { 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight,
  CheckCircle2,
  Bot,
  ChevronLeft,
  Search,
  Zap,
  FileText
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AgentAssessment() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agent Assessment – Mega Build Construction</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold">1</span>
              <span className="text-sm font-medium text-emerald-600">Upload & Start Agent</span>
              <div className="w-8 h-px bg-emerald-500" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
              <span className="text-sm font-medium text-foreground">Agent Assessment</span>
              <div className="w-8 h-px bg-border" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">3</span>
              <span className="text-sm text-muted-foreground">Human Decision</span>
            </div>
          </div>
          <Link href="/applications">
             <Button variant="ghost" size="sm"><ChevronLeft className="w-4 h-4 mr-1" /> Back to Queue</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4">
                <Bot className="w-12 h-12 text-primary/10" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Zap className="w-5 h-5" />
                  Agent Summary Card
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="flex flex-col items-center p-6 bg-white rounded-2xl border shadow-sm min-w-[140px]">
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Risk Score</span>
                    <span className="text-4xl font-black text-primary mt-1">78</span>
                    <Badge className="mt-2 bg-amber-500 hover:bg-amber-600 font-bold">MODERATE</Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Suggest APPROVE up to RM 500,000</h3>
                    <p className="text-slate-600 font-medium">Agent completed: Extraction ✓ · Scoring ✓ · Consistency checks ✓</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                       <Badge variant="outline" className="bg-white/50 border-primary/20 text-primary">26/26 fields extracted</Badge>
                       <Badge variant="outline" className="bg-white/50 border-primary/20 text-primary">3 risk warnings</Badge>
                       <Badge variant="outline" className="bg-white/50 border-primary/20 text-primary">No missing pages</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-primary/10">
                  <Button size="lg" className="font-bold shadow-lg shadow-primary/20" onClick={() => setLocation(`/applications/${id}/extraction`)}>
                    Review Details <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="lg" className="font-bold border-primary/20" onClick={() => setLocation(`/applications/${id}/decision`)}>
                    Go Straight to Decision →
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Card>
                 <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                       <FileText className="w-4 h-4 text-primary" />
                       Data Integrity
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="space-y-4">
                       <div className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                             <span>Extraction Confidence</span>
                             <span className="text-emerald-600">98%</span>
                          </div>
                          <Progress value={98} className="h-1.5 bg-slate-100" />
                       </div>
                       <p className="text-xs text-muted-foreground leading-relaxed">
                          All mandatory CTOS sections were located and parsed. Cross-reference with SSM records shows high consistency.
                       </p>
                    </div>
                 </CardContent>
               </Card>

               <Card>
                 <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-primary" />
                       Policy Matching
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="space-y-4">
                       <div className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                             <span>Rule Compliance</span>
                             <span className="text-emerald-600">12/12 Rules</span>
                          </div>
                          <Progress value={100} className="h-1.5 bg-slate-100" />
                       </div>
                       <p className="text-xs text-muted-foreground leading-relaxed">
                          Applicant meets minimum capital requirements and shows no history of high-severity blacklists.
                       </p>
                    </div>
                 </CardContent>
               </Card>
            </div>
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <AlertTriangle className="w-4 h-4 text-amber-500" />
                 Agent Detected Flags
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-border">
                  {[
                    { type: "warning", text: "Gearing ratio (2.8x) is above sector median (2.1x).", link: "Financials" },
                    { type: "warning", text: "Large facility with Bank ABC recently restructured.", link: "Banking" },
                    { type: "success", text: "No active litigation found in last 5 years.", link: "Litigation" },
                    { type: "success", text: "Director records show no bankruptcy history.", link: "Directors" },
                    { type: "info", text: "Company age (12 years) provides stability score bonus.", link: "Profile" }
                  ].map((flag, i) => (
                    <div key={i} className="p-4 flex gap-3 hover:bg-muted/30 transition-colors group cursor-pointer">
                      {flag.type === "warning" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : flag.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Bot className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-700 leading-normal">{flag.text}</p>
                        <span className="text-[10px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">Jump to {flag.link} →</span>
                      </div>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { 
  CheckCircle2, 
  AlertTriangle, 
  ChevronLeft,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScoreRecommendation() {
  const [, setLocation] = useLocation();

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Score & Recommendation</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
              <span className="text-sm text-primary font-medium">Upload CTOS</span>
              <div className="w-8 h-px bg-primary" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
              <span className="text-sm text-primary font-medium">Review Extraction</span>
              <div className="w-8 h-px bg-primary" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
              <span className="text-sm font-medium text-foreground">Score & Decide</span>
            </div>
          </div>
          <Link href="/applications/123/extraction">
            <Button variant="outline" size="sm"><ChevronLeft className="w-4 h-4 mr-2"/> Back to Extraction</Button>
          </Link>
        </div>

        {/* Top Summary Card */}
        <Card className="bg-slate-900 text-white border-slate-800">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div>
                <h2 className="text-xl font-bold">Mega Build Construction Sdn Bhd</h2>
                <p className="text-slate-400">Reg: 201001002345 (999888-X)</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-slate-400">Requested Limit:</span>
                  <span className="text-lg font-bold text-white">RM 500,000</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center border-l border-slate-700">
                <p className="text-sm text-slate-400 mb-1">Risk Category</p>
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1 text-base">
                  Low Risk
                </Badge>
                <p className="text-xs text-slate-400 mt-2">Score: <span className="text-white font-bold">77 / 100</span></p>
              </div>

              <div className="flex flex-col items-center justify-center border-l border-slate-700 pl-6">
                <p className="text-sm text-slate-400 mb-2">AI Recommendation</p>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-xl font-bold">APPROVE</span>
                </div>
                <p className="text-sm text-slate-300 mt-1">Recommended Limit: RM 500,000</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Key Drivers */}
          <Card>
            <CardHeader>
              <CardTitle>Key Drivers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-emerald-700 bg-emerald-50 p-2 rounded mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Strengths
                </h3>
                <ul className="space-y-3">
                   <li className="flex gap-3 text-sm">
                     <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                     <span>Strong paid-up capital (RM 500k) supports the requested limit.</span>
                   </li>
                   <li className="flex gap-3 text-sm">
                     <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                     <span>No active litigation or bankruptcy history detected for company or directors.</span>
                   </li>
                   <li className="flex gap-3 text-sm">
                     <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                     <span>Company age {'>'} 10 years indicates business stability.</span>
                   </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-amber-700 bg-amber-50 p-2 rounded mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Weaknesses & Risks
                </h3>
                <ul className="space-y-3">
                   <li className="flex gap-3 text-sm">
                     <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                     <span>Banking facilities utilization is moderately high (75%).</span>
                   </li>
                   <li className="flex gap-3 text-sm">
                     <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                     <span>Net worth growth is stagnant over last 2 years.</span>
                   </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Right: Policy Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Rules Engine</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                 {[
                   { name: "Minimum Capital Requirement", condition: "Paid-up ≥ RM 100k", result: "Passed", score: "+10", pass: true },
                   { name: "Business Age", condition: "Age ≥ 3 years", result: "Passed", score: "+5", pass: true },
                   { name: "Litigation Check", condition: "No active cases", result: "Passed", score: "+15", pass: true },
                   { name: "Gearing Ratio", condition: "Ratio < 3.0", result: "Warning (2.8)", score: "-5", pass: false },
                   { name: "Director Blacklist", condition: "Clean record", result: "Passed", score: "+10", pass: true },
                 ].map((rule, i) => (
                   <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                     <div className="flex-1">
                       <div className="flex items-center gap-2">
                         <p className="font-medium text-sm">{rule.name}</p>
                         {rule.pass ? (
                           <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Pass</Badge>
                         ) : (
                           <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">Check</Badge>
                         )}
                       </div>
                       <p className="text-xs text-muted-foreground mt-1">{rule.condition}</p>
                     </div>
                     <div className="text-right">
                       <span className={cn(
                         "text-sm font-bold",
                         rule.score.startsWith("+") ? "text-emerald-600" : "text-rose-600"
                       )}>{rule.score}</span>
                     </div>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Actions */}
        <Card className="bg-muted/30 border-muted">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <Info className="w-4 h-4" />
              The score and recommendation are based on Chin Hin’s credit policy rules. You remain the final decision maker.
            </div>
            <Button size="lg" onClick={() => setLocation("/applications/123/decision")}>
              Proceed to Decision <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

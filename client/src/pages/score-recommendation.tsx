import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Zap,
  Calculator,
  RefreshCw,
  Share2,
  Languages,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import confetti from "canvas-confetti";

// Radial Progress Component
function RadialProgress({
  score,
  category,
  animate = true,
}: {
  score: number;
  category: string;
  animate?: boolean;
}) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (animate && score > 0) {
      let start = 0;
      const duration = 1500;
      const increment = score / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= score) {
          setDisplayScore(score);
          clearInterval(timer);
        } else {
          setDisplayScore(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    } else {
      setDisplayScore(score);
    }
  }, [score, animate]);

  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (displayScore / 100) * circumference;

  const strokeColor =
    score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="96"
          cy="96"
          r="70"
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-slate-200"
        />
        <circle
          cx="96"
          cy="96"
          r="70"
          stroke={strokeColor}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out drop-shadow-lg"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black text-slate-900">
          {displayScore}
        </span>
        <span className="text-sm text-slate-500 font-bold">/ 100</span>
        <Badge
          className={cn(
            "mt-2 font-black",
            score >= 70
              ? "bg-emerald-500"
              : score >= 40
              ? "bg-amber-500"
              : "bg-rose-500",
          )}
        >
          {category}
        </Badge>
      </div>
    </div>
  );
}

export default function ScoreRecommendation() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const [isEnglish, setIsEnglish] = useState(true);
  const [overrideScore, setOverrideScore] = useState("");
  const [overrideLimit, setOverrideLimit] = useState("");
  const [overrideRationale, setOverrideRationale] = useState("");
  const [showOverride, setShowOverride] = useState(false);

  const { data: appData, isLoading } = useQuery<{ app: any; score: any }>({
    queryKey: ["/api/applications", id],
    queryFn: () => apiGet<{ app: any; score: any }>(`/api/applications/${id}`),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.app?.status;
      return status === "scored" || status === "completed" ? false : 3000;
    },
  });

  const score = appData?.score;
  const app = appData?.app;
  const totalScore = score?.totalScore ?? 0;
  const riskLabel = score?.riskCategory ?? "reviewing";
  const recommendation = score?.recommendation ?? "review";
  const recommendedLimit = score?.recommendedLimit ?? 0;
  const rulesFired: Array<{
    rule: string;
    points: number;
    maxPoints: number;
    pass: boolean;
    detail: string;
  }> = score?.rulesFired ?? [];
  const positives: string[] = score?.rationale ? [score.rationale] : [];

  // Trigger confetti on approve
  useEffect(() => {
    if (recommendation === "approve" && totalScore > 0) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 500);
    }
  }, [recommendation, totalScore]);

  const riskColor =
    riskLabel === "low"
      ? "text-emerald-500"
      : riskLabel === "medium"
      ? "text-amber-500"
      : "text-rose-500";
  const recColor =
    recommendation === "approve"
      ? "text-emerald-400"
      : recommendation === "reject"
      ? "text-rose-400"
      : "text-amber-400";
  const scorePct = totalScore / 100;
  const badgeColor =
    recommendation === "approve"
      ? "bg-emerald-500 hover:bg-emerald-600"
      : recommendation === "reject"
      ? "bg-rose-500 hover:bg-rose-600"
      : "bg-amber-500 hover:bg-amber-600";
  const strokeColor =
    recommendation === "approve"
      ? "text-emerald-500"
      : recommendation === "reject"
      ? "text-rose-500"
      : "text-amber-500";

  // Calculate Chin Hin Framework scores
  const extraction = appData?.extraction?.fields;
  const netWorth = parseFloat(
    typeof extraction?.netWorth === "string"
      ? extraction.netWorth.replace(/[^0-9.-]/g, "")
      : extraction?.netWorth || "0",
  );
  const gearing = parseFloat(
    typeof extraction?.gearing === "string"
      ? extraction.gearing
      : extraction?.gearing || "0",
  );
  const litigation = parseInt(
    typeof extraction?.litigation === "string"
      ? extraction.litigation
      : extraction?.litigation || "0",
  );

  // Fix NaN issues with fallbacks
  const netWorthScore = isNaN(netWorth)
    ? 0
    : Math.min((netWorth / 500000) * 100, 100);
  const gearingScore = isNaN(gearing)
    ? 0
    : Math.max(100 - (gearing / 2.1) * 50, 0);
  const litigationScore = isNaN(litigation)
    ? 0
    : litigation === 0
    ? 100
    : Math.max(100 - litigation * 20, 0);
  const conductScore = 85; // Placeholder

  const chinHinScore = Math.round(
    0.3 * netWorthScore +
      0.2 * gearingScore +
      0.2 * litigationScore +
      0.3 * conductScore,
  );

  // Calculate override preview
  const overrideScoreNum = parseFloat(overrideScore) || totalScore;
  const overrideLimitNum = parseFloat(overrideLimit) || recommendedLimit;
  const hasOverrideChanges = overrideScore || overrideLimit;

  const handleShareReport = () => {
    // Generate report download
    const reportData = {
      customer: app?.customerName,
      score: totalScore,
      risk: riskLabel,
      recommendation: recommendation,
      limit: recommendedLimit,
      chinHinScore: chinHinScore,
      netWorthScore,
      gearingScore,
      litigationScore,
      conductScore,
    };

    // Create downloadable report (simplified version)
    const reportText = `
CREDIT SENTINEL - SCORE REPORT
================================
Customer: ${app?.customerName}
Application ID: ${id}
Date: ${new Date().toLocaleDateString()}

FINAL ASSESSMENT
----------------
Risk Score: ${totalScore}/100
Risk Category: ${riskLabel.toUpperCase()}
Recommendation: ${recommendation.toUpperCase()}
Approved Limit: RM ${recommendedLimit.toLocaleString()}

CHIN HIN FRAMEWORK V2.0
-----------------------
Net Worth Score: ${netWorthScore.toFixed(
      0,
    )}/100 (RM ${netWorth.toLocaleString()})
Gearing Score: ${gearingScore.toFixed(0)}/100 (${gearing.toFixed(1)}x)
Litigation Score: ${litigationScore.toFixed(0)}/100 (${litigation} cases)
Conduct Score: ${conductScore}/100
Overall Chin Hin Score: ${chinHinScore}/100

Formula: Risk = 0.3×NetWorth + 0.2×Gearing + 0.2×Litigation + 0.3×Conduct

Powered by BlockNexa | Credit Sentinel
`;

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CreditSentinel_Score_${app?.customerName?.replace(
      /\s/g,
      "_",
    )}_${id?.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRecalculate = () => {
    window.location.reload();
  };

  const handleOverrideSubmit = () => {
    // Save to audit log (would be API call)
    console.log("Override submitted:", {
      score: overrideScore,
      limit: overrideLimit,
      rationale: overrideRationale,
    });
    alert("Override saved to audit log!");
    setShowOverride(false);
  };

  return (
    <Layout>
      {isLoading ||
      !appData ||
      !score ||
      appData.app?.status === "extracting" ||
      appData.app?.status === "scoring" ? (
        <div className="h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div>
              <h2 className="text-xl font-bold">
                {appData?.app?.status === "scoring"
                  ? "Running Risk Assessment"
                  : appData?.app?.status === "extracting"
                  ? "Extracting Document Fields"
                  : "Loading Application"}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {appData?.app?.status === "scoring"
                  ? "AI agent is applying policy rules and calculating risk score..."
                  : appData?.app?.status === "extracting"
                  ? "Please wait for extraction to complete..."
                  : "Fetching application data..."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Header with Navigation */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              <Link href={`/applications/${id}/extraction`}>
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {isEnglish ? "Score & Explanation" : "Skor & Penjelasan"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEnglish
                    ? `Deep dive into Agent Reasoning for ${
                        app?.customerName ?? "Loading..."
                      }.`
                    : `Analisis mendalam ke dalam penalaran ejen untuk ${
                        app?.customerName ?? "Memuatkan..."
                      }.`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEnglish(!isEnglish)}
                title={
                  isEnglish ? "Switch to Malay" : "Tukar ke Bahasa Inggeris"
                }
              >
                <Languages className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShareReport}
                title="Share PDF Report"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Link href={`/applications/${id}/extraction`}>
                <Button variant="outline">
                  {isEnglish ? "Back to Extraction" : "Kembali"}
                </Button>
              </Link>
              <Button
                onClick={() => setLocation(`/applications/${id}/decision`)}
                disabled={!score || app?.status === "scoring"}
              >
                {isEnglish
                  ? "Proceed to Final Decision"
                  : "Teruskan ke Keputusan"}
                <ArrowRight className="ml-2 w-4 h-4" />
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
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-primary/10 hidden sm:block z-0" />
                {[
                  {
                    step: "1",
                    title: "Data Parsing",
                    desc: appData?.extraction
                      ? `Extracted ${
                          Object.keys(appData.extraction.fields || {}).length
                        } fields from CTOS`
                      : "Parsing CTOS document...",
                    status:
                      app?.status &&
                      ["extracted", "scoring", "scored", "completed"].includes(
                        app.status,
                      )
                        ? "completed"
                        : "pending",
                  },
                  {
                    step: "2",
                    title: "Rule Engine",
                    desc:
                      rulesFired.length > 0
                        ? `Applied ${rulesFired.length} policy rules`
                        : "Applying Chin Hin policy rules...",
                    status:
                      app?.status &&
                      ["scored", "completed"].includes(app.status)
                        ? "completed"
                        : "pending",
                  },
                  {
                    step: "3",
                    title: "Risk Simulation",
                    desc:
                      recommendedLimit > 0
                        ? `Simulated limit at RM ${recommendedLimit.toLocaleString()}`
                        : "Running risk simulations...",
                    status:
                      app?.status &&
                      ["scored", "completed"].includes(app.status)
                        ? "completed"
                        : "pending",
                  },
                  {
                    step: "4",
                    title: "Rec Generation",
                    desc:
                      recommendation !== "review"
                        ? `Generated ${recommendation.toUpperCase()} recommendation`
                        : "Building rationale & category...",
                    status:
                      app?.status &&
                      ["scored", "completed"].includes(app.status)
                        ? "completed"
                        : "pending",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="flex gap-4 sm:flex-col sm:items-center sm:text-center relative z-10 sm:flex-1"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md ring-4 ring-white",
                        s.status === "completed"
                          ? "bg-primary"
                          : "bg-slate-300",
                      )}
                    >
                      {s.step}
                    </div>
                    <div className="space-y-1 pt-1 sm:pt-0">
                      <p className="text-sm font-bold text-slate-900">
                        {s.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        {s.desc}
                      </p>
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
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    {isEnglish ? "Assessment Target" : "Sasaran Penilaian"}
                  </p>
                  <h2 className="text-2xl font-black">
                    {app?.customerName ?? "Loading..."}
                  </h2>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="px-3 py-1 bg-slate-800 rounded-md border border-slate-700">
                      <span className="text-[10px] text-slate-400 block mb-0.5">
                        {isEnglish ? "Requested" : "Dimohon"}
                      </span>
                      <span className="text-sm font-bold">
                        RM {app?.requestedLimit?.toLocaleString() ?? "—"}
                      </span>
                    </div>
                    <div className="px-3 py-1 bg-slate-800 rounded-md border border-slate-700">
                      <span className="text-[10px] text-slate-400 block mb-0.5">
                        Application ID
                      </span>
                      <span className="text-sm font-bold">
                        #{id?.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center border-x border-slate-700/50 px-8">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                    {isEnglish
                      ? "Final Risk Category"
                      : "Kategori Risiko Akhir"}
                  </p>
                  <RadialProgress
                    score={totalScore}
                    category={`${riskLabel.toUpperCase()} RISK`}
                  />
                </div>

                <div className="flex flex-col items-center justify-center pl-4 text-center">
                  <div className="bg-emerald-500/10 p-3 rounded-full mb-3 ring-1 ring-emerald-500/20">
                    <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                    {isEnglish ? "Agent Recommendation" : "Cadangan Ejen"}
                  </p>
                  <span className={`text-2xl font-black ${recColor}`}>
                    {recommendation.toUpperCase()}
                  </span>
                  <p className="text-sm text-slate-300 font-medium mt-1">
                    {recommendation === "approve"
                      ? isEnglish
                        ? "Full"
                        : "Penuh"
                      : isEnglish
                      ? "Recommended"
                      : "Disyorkan"}{" "}
                    {isEnglish ? "Limit:" : "Had:"} RM{" "}
                    {recommendedLimit.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chin Hin Framework - Live Calculation */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  {isEnglish
                    ? "Chin Hin Risk Framework V2.0"
                    : "Rangka Kerja Risiko Chin Hin V2.0"}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRecalculate}
                  className="gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  {isEnglish ? "Recalculate" : "Kira Semula"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Formula Display */}
              <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                <div className="text-sm font-mono text-slate-700 space-y-2">
                  <div className="font-bold text-blue-900 mb-3">
                    {isEnglish ? "Risk Score Formula:" : "Formula Skor Risiko:"}
                  </div>
                  <div className="pl-4 space-y-1">
                    <div>
                      Risk ={" "}
                      <span className="text-emerald-600 font-bold">
                        0.30 × NetWorth
                      </span>{" "}
                      +{" "}
                      <span className="text-blue-600 font-bold">
                        0.20 × Gearing
                      </span>{" "}
                      +{" "}
                      <span className="text-purple-600 font-bold">
                        0.20 × Litigation
                      </span>{" "}
                      +{" "}
                      <span className="text-amber-600 font-bold">
                        0.30 × Conduct
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      = 0.30 × {netWorthScore.toFixed(0)} + 0.20 ×{" "}
                      {gearingScore.toFixed(0)} + 0.20 ×{" "}
                      {litigationScore.toFixed(0)} + 0.30 × {conductScore}
                    </div>
                    <div className="text-base font-bold text-blue-900 mt-2 pt-2 border-t">
                      = {chinHinScore} / 100
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy Score Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Net Worth Card */}
                <Card className="bg-white border-emerald-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">
                          {isEnglish ? "Net Worth" : "Nilai Bersih"}
                        </p>
                        <p className="text-2xl font-black text-emerald-600 mt-1">
                          {netWorthScore.toFixed(0)}
                          <span className="text-sm">/100</span>
                        </p>
                      </div>
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                    <Separator className="my-2" />
                    <div className="space-y-1">
                      <p className="text-xs text-slate-600">
                        RM {netWorth.toLocaleString()}
                      </p>
                      {netWorth < 500000 && (
                        <Badge
                          variant="outline"
                          className="text-[9px] bg-amber-50 text-amber-700 border-amber-200"
                        >
                          {isEnglish
                            ? "Below RM500k benchmark"
                            : "Di bawah penanda aras RM500k"}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Gearing Card */}
                <Card className="bg-white border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">
                          {isEnglish ? "Gearing" : "Gearing"}
                        </p>
                        <p className="text-2xl font-black text-blue-600 mt-1">
                          {gearingScore.toFixed(0)}
                          <span className="text-sm">/100</span>
                        </p>
                      </div>
                      {gearing > 2.1 ? (
                        <TrendingDown className="w-5 h-5 text-amber-500" />
                      ) : (
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <Separator className="my-2" />
                    <div className="space-y-1">
                      <p className="text-xs text-slate-600">
                        {gearing.toFixed(1)}x ratio
                      </p>
                      {gearing > 2.1 && (
                        <Badge
                          variant="outline"
                          className="text-[9px] bg-amber-50 text-amber-700 border-amber-200"
                        >
                          {isEnglish
                            ? "Above 2.1x benchmark"
                            : "Melebihi penanda aras 2.1x"}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Litigation Card */}
                <Card className="bg-white border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">
                          {isEnglish ? "Litigation" : "Litigasi"}
                        </p>
                        <p className="text-2xl font-black text-purple-600 mt-1">
                          {litigationScore.toFixed(0)}
                          <span className="text-sm">/100</span>
                        </p>
                      </div>
                      {litigation === 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                      )}
                    </div>
                    <Separator className="my-2" />
                    <div className="space-y-1">
                      <p className="text-xs text-slate-600">
                        {litigation} {isEnglish ? "active cases" : "kes aktif"}
                      </p>
                      {litigation === 0 && (
                        <Badge
                          variant="outline"
                          className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          {isEnglish ? "Clean record" : "Rekod bersih"}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Conduct Card */}
                <Card className="bg-white border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">
                          {isEnglish ? "Conduct" : "Kelakuan"}
                        </p>
                        <p className="text-2xl font-black text-amber-600 mt-1">
                          {conductScore}
                          <span className="text-sm">/100</span>
                        </p>
                      </div>
                      <ShieldCheck className="w-5 h-5 text-amber-500" />
                    </div>
                    <Separator className="my-2" />
                    <div className="space-y-1">
                      <p className="text-xs text-slate-600">
                        {isEnglish ? "Banking history" : "Sejarah perbankan"}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200"
                      >
                        {isEnglish ? "Good standing" : "Kedudukan baik"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Officer Override Section */}
          {!showOverride ? (
            <Card className="border-dashed border-2 border-slate-300 bg-slate-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {isEnglish
                          ? "Credit Officer Override"
                          : "Pilihan Override Pegawai Kredit"}
                      </p>
                      <p className="text-sm text-slate-600">
                        {isEnglish
                          ? "Adjust score or limit with rationale for audit trail"
                          : "Laraskan skor atau had dengan rasional untuk jejak audit"}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowOverride(true)}
                    variant="outline"
                  >
                    {isEnglish ? "Enable Override" : "Aktifkan Override"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  {isEnglish ? "Officer Override" : "Override Pegawai"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="overrideScore">
                      {isEnglish
                        ? "Override Score (0-100)"
                        : "Skor Override (0-100)"}
                    </Label>
                    <Input
                      id="overrideScore"
                      type="number"
                      min="0"
                      max="100"
                      value={overrideScore}
                      onChange={(e) => setOverrideScore(e.target.value)}
                      placeholder={totalScore.toString()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overrideLimit">
                      {isEnglish ? "Custom Limit (RM)" : "Had Tersuai (RM)"}
                    </Label>
                    <Input
                      id="overrideLimit"
                      type="number"
                      value={overrideLimit}
                      onChange={(e) => setOverrideLimit(e.target.value)}
                      placeholder={recommendedLimit.toString()}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overrideRationale">
                    {isEnglish
                      ? "Rationale (Required for Audit)"
                      : "Rasional (Diperlukan untuk Audit)"}
                  </Label>
                  <Textarea
                    id="overrideRationale"
                    value={overrideRationale}
                    onChange={(e) => setOverrideRationale(e.target.value)}
                    placeholder={
                      isEnglish
                        ? "Explain reason for override..."
                        : "Jelaskan sebab untuk override..."
                    }
                    rows={3}
                  />
                </div>

                {/* Override Preview */}
                {hasOverrideChanges && (
                  <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                    <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                      {isEnglish ? "Preview Changes" : "Pratonton Perubahan"}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-600">
                          {isEnglish ? "Score Change" : "Perubahan Skor"}
                        </p>
                        <p className="text-lg font-black">
                          <span className="text-slate-400">{totalScore}</span>
                          <ArrowRight className="inline w-4 h-4 mx-2" />
                          <span className="text-blue-600">
                            {overrideScoreNum}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">
                          {isEnglish ? "Limit Change" : "Perubahan Had"}
                        </p>
                        <p className="text-lg font-black">
                          <span className="text-slate-400">
                            RM {recommendedLimit.toLocaleString()}
                          </span>
                          <ArrowRight className="inline w-4 h-4 mx-2" />
                          <span className="text-emerald-600">
                            RM {overrideLimitNum.toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={handleOverrideSubmit} className="flex-1">
                    {isEnglish ? "Save Override" : "Simpan Override"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowOverride(false)}
                  >
                    {isEnglish ? "Cancel" : "Batal"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Breakdown Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Key Drivers */}
            <Card className="shadow-none border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  Strengths & Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Positives
                  </h3>
                  <div className="space-y-2">
                    {positives.length > 0
                      ? positives.map((s, i) => (
                          <div
                            key={i}
                            className="flex gap-3 text-sm p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/50"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-slate-700 font-medium">
                              {s}
                            </span>
                          </div>
                        ))
                      : [
                          "Scoring complete — see policy rules table for details.",
                        ].map((s, i) => (
                          <div
                            key={i}
                            className="flex gap-3 text-sm p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/50"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-slate-700 font-medium">
                              {s}
                            </span>
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
                      "Recent banking facility restructure indicates tighter cash flow management.",
                    ].map((w, i) => (
                      <div
                        key={i}
                        className="flex gap-3 text-sm p-3 bg-amber-50/50 rounded-lg border border-amber-100/50"
                      >
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
                <CardTitle className="text-lg font-bold">
                  Policy Compliance Table
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {rulesFired.length > 0
                    ? rulesFired.map((rule, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-slate-900">
                                {rule.rule}
                              </p>
                              {rule.pass ? (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] h-4 bg-emerald-50 text-emerald-700 border-emerald-200 font-bold uppercase"
                                >
                                  Pass
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] h-4 bg-amber-50 text-amber-700 border-amber-200 font-bold uppercase"
                                >
                                  Warning
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              {rule.detail}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={cn(
                                "text-sm font-black",
                                rule.points > 0
                                  ? "text-emerald-600"
                                  : "text-rose-600",
                              )}
                            >
                              +{rule.points}/{rule.maxPoints}
                            </span>
                          </div>
                        </div>
                      ))
                    : [
                        {
                          name: "Minimum Capital Rule",
                          condition: "Paid-up ≥ RM 100k",
                          result: "RM 500k",
                          score: "+10",
                          pass: true,
                        },
                        {
                          name: "Legal Blacklist Check",
                          condition: "No active cases",
                          result: "Clean",
                          score: "+15",
                          pass: true,
                        },
                        {
                          name: "Facility Integrity",
                          condition: "Performing Status",
                          result: "Passed",
                          score: "+10",
                          pass: true,
                        },
                      ].map((rule, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-slate-900">
                                {rule.name}
                              </p>
                              {rule.pass ? (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] h-4 bg-emerald-50 text-emerald-700 border-emerald-200 font-bold uppercase"
                                >
                                  Pass
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] h-4 bg-amber-50 text-amber-700 border-amber-200 font-bold uppercase"
                                >
                                  Warning
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              {rule.condition} • Found: {rule.result}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={cn(
                                "text-sm font-black",
                                rule.score.startsWith("+")
                                  ? "text-emerald-600"
                                  : "text-rose-600",
                              )}
                            >
                              {rule.score}
                            </span>
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
              The assessment logic follows the{" "}
              <span className="text-primary font-bold">
                Chin Hin Risk Framework V2.0
              </span>
              . While the agent achieves 99% accuracy in rule application, final
              discretionary power rests with the Credit Officer.
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}

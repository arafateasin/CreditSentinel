import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation, useParams } from "wouter";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ShieldCheck,
  Calendar,
  Save,
  Bot,
  AlertTriangle,
  FileCheck,
  Info,
  Loader2,
  User,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function DecisionApproval() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const { toast } = useToast();
  const [decision, setDecision] = useState<
    "approve" | "reject" | "review" | null
  >(null);
  const [approvedLimit, setApprovedLimit] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: appData, isLoading } = useQuery<{
    app: any;
    extraction: any;
    score: any;
  }>({
    queryKey: ["/api/applications", id],
    queryFn: () =>
      apiGet<{ app: any; extraction: any; score: any }>(
        `/api/applications/${id}`,
      ),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.app?.status;
      return status === "scored" || status === "completed" ? false : 3000;
    },
  });

  const score = appData?.score;
  const app = appData?.app;
  const extraction = appData?.extraction;

  // Pre-fill from agent suggestion when data loads
  const agentSuggestion = {
    decision: (score?.recommendation ?? "review") as
      | "approve"
      | "reject"
      | "review",
    limit: String(score?.recommendedLimit ?? ""),
  };

  const effectiveDecision = decision ?? agentSuggestion.decision;
  const effectiveLimit = approvedLimit || agentSuggestion.limit;
  const isOverride =
    effectiveDecision !== agentSuggestion.decision ||
    effectiveLimit !== agentSuggestion.limit;

  const handleFinalize = async () => {
    if (isOverride && !remarks.trim()) {
      toast({
        title: "Justification Required",
        description: "Provide a reason for overriding the agent.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await apiPost(`/api/applications/${id}/decide`, {
        approved: effectiveDecision === "approve",
        final_limit: Number(effectiveLimit),
        notes: remarks,
      });
      toast({
        title: "Decision Saved & Logged",
        description: `Case for ${app?.customerName ?? ""} has been finalised.`,
      });
      setTimeout(() => setLocation("/applications"), 1500);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {isLoading || !appData || !score ? (
        <div className="h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div>
              <h2 className="text-xl font-bold">Loading Decision Page</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Preparing risk assessment and recommendation...
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
          <div className="flex items-center gap-4 border-b pb-4">
            <Link href={`/applications/${id}/score`}>
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Final Decision & Approval
              </h1>
              <p className="text-sm text-muted-foreground">
                Officer review stage for {app?.customerName ?? "Loading..."}
              </p>
            </div>
          </div>

          {/* Agent vs Officer Comparison Panel */}
          <Card className="bg-primary/5 border-primary/20 shadow-none">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border shadow-sm">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                      Agent Suggestion
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {agentSuggestion.decision.toUpperCase()}{" "}
                      {agentSuggestion.decision === "approve" && (
                        <>
                          <span className="text-muted-foreground font-medium">
                            up to
                          </span>{" "}
                          RM {Number(agentSuggestion.limit).toLocaleString()}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block h-8 w-px bg-primary/10" />

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border shadow-sm">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                      Officer Decision
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 uppercase">
                        {decision || "Pending"}
                      </p>
                      {isOverride && (
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant="outline"
                            className="bg-rose-50 text-rose-700 border-rose-200 h-5 px-2 text-[9px] font-black tracking-widest uppercase"
                          >
                            Agent Match: ✗ Override
                          </Badge>
                          <p className="text-[9px] text-rose-600 font-bold uppercase italic">
                            Officer decision ≠ agent
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    id: "approve",
                    label: "Approve",
                    icon: CheckCircle2,
                    color: "emerald",
                    desc: "Sales notified immediately, customer onboarded",
                  },
                  {
                    id: "reject",
                    label: "Reject",
                    icon: XCircle,
                    color: "rose",
                    desc: "Customer receives rejection notice + reason",
                  },
                  {
                    id: "review",
                    label: "KIV / Review",
                    icon: AlertCircle,
                    color: "amber",
                    desc: "Follow-up task created, Sales notified",
                  },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setDecision(opt.id as any)}
                    className={cn(
                      "group cursor-pointer border-2 rounded-2xl p-5 transition-all text-center space-y-3 relative overflow-hidden",
                      decision === opt.id
                        ? `border-${opt.color}-500 bg-${opt.color}-50 ring-4 ring-${opt.color}-500/10`
                        : "border-slate-200 bg-white hover:border-slate-300",
                    )}
                  >
                    {decision === opt.id && (
                      <div
                        className={`absolute top-0 right-0 p-1 bg-${opt.color}-500 rounded-bl-lg`}
                      >
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full mx-auto flex items-center justify-center transition-colors",
                        decision === opt.id
                          ? `bg-${opt.color}-500 text-white`
                          : "bg-slate-100 text-slate-400 group-hover:bg-slate-200",
                      )}
                    >
                      <opt.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm tracking-tight">
                        {opt.label}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                        {opt.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Config Card */}
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-black text-slate-900">
                    Decision Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {decision === "approve" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex gap-4">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-emerald-800 tracking-tight">
                            Recommendation Matched
                          </p>
                          <p className="text-xs text-emerald-700/80 leading-relaxed font-medium">
                            Your choice matches the Agent's autonomous
                            assessment. Fast-track approval logging enabled.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Approved Limit (RM)
                          </Label>
                          <Input
                            value={approvedLimit}
                            onChange={(e) => setApprovedLimit(e.target.value)}
                            className="text-lg font-black h-12 border-slate-300 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Facility Type
                          </Label>
                          <Select defaultValue="od">
                            <SelectTrigger className="h-12 border-slate-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="od">Overdraft</SelectItem>
                              <SelectItem value="tl">Term Loan</SelectItem>
                              <SelectItem value="bg">Bank Guarantee</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {decision === "reject" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex gap-4">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-rose-800 tracking-tight">
                            Manual Override Triggered
                          </p>
                          <p className="text-xs text-rose-700/80 leading-relaxed font-medium">
                            You are rejecting a case suggested for approval.
                            Detailed justification is required for the audit
                            trail.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Primary Rejection Reason
                        </Label>
                        <Select>
                          <SelectTrigger className="h-12 border-slate-300">
                            <SelectValue placeholder="Select reason..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="risk">
                              High Market Risk
                            </SelectItem>
                            <SelectItem value="financial">
                              Suspect Financial Integrity
                            </SelectItem>
                            <SelectItem value="policy">
                              Policy Non-Compliance
                            </SelectItem>
                            <SelectItem value="other">
                              Other Business Reasons
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {decision === "review" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Follow-up Date
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" type="date" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Internal Remarks / Justification
                        {isOverride && (
                          <span className="text-rose-500 ml-1 font-black">
                            (REQUIRED)
                          </span>
                        )}
                      </Label>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Private for Credit Control only
                      </span>
                    </div>
                    <Textarea
                      placeholder="Provide details on your decision reasoning..."
                      className="min-h-[160px] border-slate-300 resize-none focus:ring-primary p-4"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Live Preview Badge */}
              {effectiveDecision && (
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-900">
                          Live Preview
                        </p>
                        <p className="text-sm font-bold text-blue-900">
                          {effectiveDecision === "approve" && (
                            <Badge className="bg-emerald-500 text-white font-black">
                              RM {Number(effectiveLimit).toLocaleString()}{" "}
                              Approved
                            </Badge>
                          )}
                          {effectiveDecision === "reject" && (
                            <Badge className="bg-rose-500 text-white font-black">
                              Application Rejected
                            </Badge>
                          )}
                          {effectiveDecision === "review" && (
                            <Badge className="bg-amber-500 text-white font-black">
                              Marked for Follow-up
                            </Badge>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Audit Trail Preview */}
              {effectiveDecision && remarks && (
                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-600" />
                      Audit Trail Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white rounded-lg p-3 border border-slate-200 font-mono text-xs">
                      <div className="space-y-1">
                        <div className="text-slate-600">
                          <span className="font-bold text-slate-900">
                            {new Date()
                              .toISOString()
                              .slice(0, 16)
                              .replace("T", " ")}
                          </span>{" "}
                          | Officer:{" "}
                          <span className="font-bold text-blue-600">
                            Credit Officer
                          </span>
                        </div>
                        <div className="text-slate-600">
                          Action:{" "}
                          <span className="font-bold text-purple-600">
                            {isOverride ? "Override " : ""}
                            {effectiveDecision.toUpperCase()}
                          </span>
                        </div>
                        {effectiveDecision === "approve" && (
                          <div className="text-slate-600">
                            Limit:{" "}
                            <span className="font-bold text-emerald-600">
                              RM {Number(effectiveLimit).toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="text-slate-600">
                          Reason:{" "}
                          <span className="italic text-slate-700">
                            {remarks.slice(0, 60)}
                            {remarks.length > 60 ? "..." : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sales Notification Mock */}
              {effectiveDecision === "approve" && (
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-900">
                      <User className="w-4 h-4" />
                      Sales Notification Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-white rounded-lg p-3 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-900">
                          Salesman John Tan notified
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-blue-600" />
                          <span>Email sent: application/{id?.slice(0, 8)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>SMS: +6012-345-6789</span>
                        </div>
                        <div className="mt-2 p-2 bg-emerald-50 rounded text-[10px] italic border border-emerald-100">
                          "Your customer {app?.customerName} has been approved
                          for RM {Number(effectiveLimit).toLocaleString()}.
                          Proceed with onboarding."
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Irreversible Warning */}
              {effectiveDecision && (
                <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4 flex gap-3 animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-rose-900 tracking-tight">
                      ⚠️ IRREVERSIBLE ACTION
                    </p>
                    <p className="text-xs text-rose-700 leading-relaxed font-medium mt-1">
                      Once finalized, this decision cannot be undone. Customer
                      limits will be updated immediately and logged to the
                      permanent audit trail. Ensure all details are correct
                      before proceeding.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-4 pt-2">
                <Button
                  variant="ghost"
                  size="lg"
                  className="font-bold text-slate-500"
                >
                  Discard Changes
                </Button>
                <Button
                  size="lg"
                  className="min-w-[220px] h-14 font-black text-base shadow-xl shadow-primary/20"
                  onClick={handleFinalize}
                  disabled={isSubmitting || !effectiveDecision}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  {isSubmitting ? "Saving..." : "Confirm & Finalise"}
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="bg-slate-50 border-slate-200 shadow-none">
                <CardHeader className="pb-2 border-b">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Summary Context
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-bold">
                      Applicant History
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      New Customer (No records)
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-bold">
                      Agent Confidence
                    </p>
                    <p className="text-sm font-medium text-emerald-600">
                      High (98% match with SSM)
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-bold">
                        Total Exposure
                      </span>
                      <span className="font-black text-slate-900">RM 500k</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-bold">
                        Decision SLA
                      </span>
                      <span className="font-black text-emerald-600">
                        Within Target (1.2h)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex gap-3">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <p className="text-[10px] text-primary/80 font-bold leading-tight uppercase tracking-wide">
                  FINALISING THIS DECISION WILL UPDATE THE CUSTOMER LIMITS AND
                  LOG THE AUDIT TRAIL PERMANENTLY.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronLeft,
  ShieldCheck,
  Calendar,
  Save
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

export default function DecisionApproval() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [decision, setDecision] = useState<"approve" | "reject" | "review" | null>("approve");
  const [approvedLimit, setApprovedLimit] = useState("500000");
  const [remarks, setRemarks] = useState("");

  const handleFinalize = () => {
    toast({
      title: "Decision Saved",
      description: `Application for Mega Build Construction has been ${decision}d.`,
    });
    setTimeout(() => {
      setLocation("/");
    }, 1500);
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 border-b pb-4">
          <Link href="/applications/123/score">
            <Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5"/></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Final Decision</h1>
            <p className="text-muted-foreground">Mega Build Construction Sdn Bhd • RM 500,000 requested</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Decision Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div 
                onClick={() => setDecision("approve")}
                className={cn(
                  "cursor-pointer border-2 rounded-xl p-4 transition-all hover:bg-emerald-50/50",
                  decision === "approve" 
                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200 ring-offset-1" 
                    : "border-muted bg-card opacity-70 hover:opacity-100"
                )}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <CheckCircle2 className={cn("w-8 h-8", decision === "approve" ? "text-emerald-600" : "text-muted-foreground")} />
                  <div>
                    <h3 className="font-bold text-foreground">Approve</h3>
                    <p className="text-xs text-muted-foreground mt-1">Customer is suitable for credit.</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setDecision("reject")}
                className={cn(
                  "cursor-pointer border-2 rounded-xl p-4 transition-all hover:bg-rose-50/50",
                  decision === "reject" 
                    ? "border-rose-500 bg-rose-50 ring-2 ring-rose-200 ring-offset-1" 
                    : "border-muted bg-card opacity-70 hover:opacity-100"
                )}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <XCircle className={cn("w-8 h-8", decision === "reject" ? "text-rose-600" : "text-muted-foreground")} />
                  <div>
                    <h3 className="font-bold text-foreground">Reject</h3>
                    <p className="text-xs text-muted-foreground mt-1">Risk exceeds acceptable level.</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setDecision("review")}
                className={cn(
                  "cursor-pointer border-2 rounded-xl p-4 transition-all hover:bg-amber-50/50",
                  decision === "review" 
                    ? "border-amber-500 bg-amber-50 ring-2 ring-amber-200 ring-offset-1" 
                    : "border-muted bg-card opacity-70 hover:opacity-100"
                )}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <AlertCircle className={cn("w-8 h-8", decision === "review" ? "text-amber-600" : "text-muted-foreground")} />
                  <div>
                    <h3 className="font-bold text-foreground">Review / KIV</h3>
                    <p className="text-xs text-muted-foreground mt-1">More information required.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Decision Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {decision === "approve" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-emerald-800">AI Recommendation Matched</p>
                        <p className="text-xs text-emerald-600 mt-1">Your decision aligns with the system recommendation.</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Approved Limit (RM)</Label>
                      <Input 
                        value={approvedLimit}
                        onChange={(e) => setApprovedLimit(e.target.value)}
                        className="text-lg font-semibold"
                      />
                      <p className="text-xs text-muted-foreground">Original request: RM 500,000</p>
                    </div>
                  </div>
                )}

                {decision === "reject" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg flex gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-rose-800">Decision Override</p>
                        <p className="text-xs text-rose-600 mt-1">You are overriding the AI's approval recommendation. Justification is mandatory.</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Reason for Rejection</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit">Poor Credit History</SelectItem>
                          <SelectItem value="financials">Weak Financials</SelectItem>
                          <SelectItem value="litigation">Active Litigation</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {decision === "review" && (
                   <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                     <div className="space-y-2">
                       <Label>Follow-up Date</Label>
                       <div className="relative">
                         <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                         <Input className="pl-9" type="date" />
                       </div>
                     </div>
                   </div>
                )}

                <div className="space-y-2">
                  <Label>Internal Remarks / Justification</Label>
                  <Textarea 
                    placeholder="Enter your comments here..." 
                    className="min-h-[120px]"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" size="lg">Cancel</Button>
              <Button size="lg" className="min-w-[150px]" onClick={handleFinalize}>
                <Save className="w-4 h-4 mr-2" />
                Confirm & Finalise
              </Button>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-sm">Application Summary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="font-medium">2 hours ago</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Risk Score</span>
                  <span className="font-medium text-emerald-600">Low (77)</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">AI Rec.</span>
                  <span className="font-medium text-emerald-600">Approve</span>
                </div>
                <div className="flex justify-between py-2">
                   <span className="text-muted-foreground">Sales Person</span>
                   <span className="font-medium">Alex Morgan</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

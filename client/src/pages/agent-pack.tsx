import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, useParams, Link } from "wouter";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Bot,
  ChevronLeft,
  Search,
  Edit2,
  ShieldCheck,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function AgentPack() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-slate-100/50 p-2 border-y border-slate-200 mt-6 first:mt-0">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
        {title}
      </h3>
    </div>
  );

  const FieldRow = ({
    label,
    value,
    confidence,
    warning,
  }: {
    label: string;
    value: string;
    confidence?: "High" | "Medium" | "Low";
    warning?: boolean;
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 px-2 group">
      <div className="space-y-0.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-sm font-bold text-slate-800",
              warning && "text-amber-600",
            )}
          >
            {value}
          </p>
          {warning && <AlertTriangle className="w-3 h-3 text-amber-500" />}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {confidence && (
          <Badge
            variant="outline"
            className={cn(
              "text-[8px] font-black h-4 px-1.5",
              confidence === "High"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : confidence === "Medium"
                ? "bg-amber-50 text-amber-700 border-amber-100"
                : "bg-rose-50 text-rose-700 border-rose-100",
            )}
          >
            {confidence}{" "}
            {confidence === "High" ? "✓" : confidence === "Medium" ? "⚠" : "✗"}
          </Badge>
        )}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Edit2 className="w-3 h-3 text-slate-400" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Search className="w-3 h-3 text-primary" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/applications">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  Agent Decision Pack
                </h1>
                <p className="text-sm font-bold text-slate-500 italic">
                  Chin Hin Credit Scoring Form (auto-filled by agent) ✓ Matches
                  your existing eForm structure exactly
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="font-bold">
                Review Fields
              </Button>
              <Button
                onClick={() => setLocation(`/applications/${id}/decision`)}
                className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 font-black shadow-lg shadow-primary/20"
              >
                Confirm Decision <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between px-6 shadow-xl">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-sm font-black uppercase tracking-wider">
                Chin Hin Credit Scoring Form Replica
              </span>
            </div>
            <Badge className="bg-primary/20 text-primary border-none font-black text-[10px]">
              OFFICIAL FORM V1.2
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[700px]">
          {/* Left: CTOS Preview - Order changed for mobile: 3rd */}
          <Card className="flex flex-col border-slate-200 shadow-sm overflow-hidden order-3 lg:order-1 h-[400px] lg:h-auto">
            <CardHeader className="bg-slate-50 border-b py-3">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">
                CTOS PDF Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 bg-slate-800 p-4 relative">
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-emerald-500 text-[10px] font-black">
                  93% Confidence
                </Badge>
              </div>
              <img
                src="/assets/pdf-preview.png"
                alt="CTOS"
                className="w-full h-full object-contain shadow-2xl rounded opacity-80"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-3 py-1 rounded-full font-bold">
                Page 1 of 15
              </div>
            </CardContent>
          </Card>

          {/* Center: Scoring Form Replica - Order changed for mobile: 1st */}
          <Card className="lg:col-span-2 flex flex-col border-slate-200 shadow-sm overflow-hidden order-1 lg:order-2">
            <CardHeader className="bg-slate-50 border-b py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">
                Chin Hin Scoring Form Replica
              </CardTitle>
              <Badge
                variant="outline"
                className="bg-white border-primary/20 text-primary font-black"
              >
                MVP V1.0
              </Badge>
            </CardHeader>
            <ScrollArea className="flex-1">
              <CardContent className="p-0">
                <SectionHeader title="Type of Customer" />
                <div className="p-4 flex gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-slate-300" />
                    <span className="text-xs font-bold text-slate-400">
                      New Credit ○
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-4 border-primary" />
                    <span className="text-xs font-bold text-slate-900">
                      Renewal ●
                    </span>
                  </div>
                </div>

                <SectionHeader title="Salesman Profile" />
                <div className="grid grid-cols-2">
                  <FieldRow label="Salesman Name" value="John Tan" />
                  <FieldRow label="Territory" value="Klang Valley" />
                </div>

                <SectionHeader title="Customer Information" />
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <FieldRow
                    label="Customer Name"
                    value="ABC Trading Sdn Bhd"
                    confidence="High"
                  />
                  <FieldRow
                    label="Registration No"
                    value="123456-X"
                    confidence="High"
                  />
                  <FieldRow
                    label="Industry"
                    value="Trading"
                    confidence="Medium"
                  />
                  <FieldRow
                    label="Address"
                    value="Lot 1, Jalan ABC, KL"
                    confidence="High"
                  />
                </div>

                <SectionHeader title="CCRIS/CTOS for Company (25%)" />
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <FieldRow
                    label="Paid-up Capital"
                    value="RM 1,000,000"
                    confidence="High"
                  />
                  <FieldRow
                    label="No. of Directors"
                    value="3"
                    confidence="High"
                  />
                  <FieldRow
                    label="Litigation Status"
                    value="None"
                    confidence="High"
                  />
                  <div className="flex items-end justify-end p-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                      Weight: 25%
                    </span>
                  </div>
                </div>

                <SectionHeader title="Financial Information (25%)" />
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <FieldRow
                    label="Net Worth"
                    value="RM 1,250,000"
                    confidence="Medium"
                  />
                  <FieldRow
                    label="Profit/Loss"
                    value="RM 250,000"
                    confidence="High"
                  />
                  <FieldRow
                    label="Gearing Ratio"
                    value="1.2x"
                    confidence="High"
                    warning={true}
                  />
                  <div className="flex items-end justify-end p-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                      Weight: 25%
                    </span>
                  </div>
                </div>

                <SectionHeader title="Pledged/Collateral (20%)" />
                <div className="p-4 bg-slate-50/50">
                  <div className="border rounded-xl bg-white overflow-hidden">
                    <table className="w-full text-[10px]">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="p-2 text-left font-black">Bank</th>
                          <th className="p-2 text-left font-black">Type</th>
                          <th className="p-2 text-right font-black">
                            Limit (RM)
                          </th>
                          <th className="p-2 text-center font-black">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="p-2 font-bold">Maybank</td>
                          <td className="p-2">Term Loan</td>
                          <td className="p-2 text-right">500,000</td>
                          <td className="p-2 text-center">
                            <span className="bg-emerald-50 text-emerald-700 rounded px-1.5 py-0.5 font-black">
                              Active
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold">CIMB</td>
                          <td className="p-2">Overdraft</td>
                          <td className="p-2 text-right">200,000</td>
                          <td className="p-2 text-center">
                            <span className="bg-emerald-50 text-emerald-700 rounded px-1.5 py-0.5 font-black">
                              Active
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight italic">
                      Matches Chin Hin eForm v1.2
                    </p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                      Weight: 20%
                    </p>
                  </div>
                </div>

                <SectionHeader title="Company Background (10%)" />
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <FieldRow
                    label="Years Trading"
                    value="8 Years"
                    confidence="High"
                  />
                  <FieldRow
                    label="Related Companies"
                    value="None"
                    confidence="High"
                  />
                  <FieldRow
                    label="Business Nature"
                    value="Wholesale Trading"
                    confidence="Medium"
                  />
                  <div className="flex items-end justify-end p-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                      Weight: 10%
                    </span>
                  </div>
                </div>

                <SectionHeader title="Audit Trail" />
                <div className="grid grid-cols-3 bg-slate-50/50">
                  <div className="p-4 text-center border-r border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                      Agent Score
                    </p>
                    <p className="text-xl font-black text-primary">78/100</p>
                  </div>
                  <div className="p-4 text-center border-r border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                      Risk Grade
                    </p>
                    <p className="text-xl font-black text-amber-600">MEDIUM</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                      Prob. Default
                    </p>
                    <p className="text-xl font-black text-slate-900">2.1%</p>
                  </div>
                </div>
              </CardContent>
            </ScrollArea>
          </Card>

          {/* Right: Agent Recommendation - Order changed for mobile: 2nd */}
          <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden h-fit order-2 lg:order-3">
            <CardHeader className="bg-primary/10 border-b border-primary/10 py-3">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Bot className="w-4 h-4" /> Agent Recommends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 py-2 text-lg rounded-xl shadow-lg shadow-emerald-500/20 mb-2">
                  APPROVE
                </Badge>
                <p className="text-xs font-black text-primary uppercase mt-2">
                  Up to RM 500,000
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Rationale
                </p>
                <ul className="space-y-2">
                  <li className="flex gap-2 text-[11px] font-bold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Strong paid-up capital
                  </li>
                  <li className="flex gap-2 text-[11px] font-bold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    No litigation
                  </li>
                  <li className="flex gap-2 text-[11px] font-bold text-slate-700">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    Moderate gearing (1.2x)
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Policy Rules Applied
                </p>
                <div className="space-y-2">
                  {[
                    { name: "Min Capital", pass: true, impact: "+10 pts" },
                    { name: "No Litigation", pass: true, impact: "+15 pts" },
                    { name: "Gearing Penalty", pass: false, impact: "-5 pts" },
                  ].map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-[11px] bg-white/50 p-2 rounded border border-primary/5"
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {r.pass ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        {r.name}
                      </div>
                      <span
                        className={cn(
                          "font-black",
                          r.pass ? "text-emerald-600" : "text-amber-600",
                        )}
                      >
                        {r.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                className="w-full font-black h-12 shadow-xl shadow-primary/20"
                onClick={() => setLocation(`/applications/${id}/decision`)}
              >
                Continue to Decision →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

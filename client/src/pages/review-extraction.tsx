import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link, useLocation, useParams } from "wouter";
import {
  CheckCircle2,
  AlertTriangle,
  Edit2,
  ExternalLink,
  ChevronLeft,
  Eye,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export default function ReviewExtraction() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const [editingField, setEditingField] = useState<string | null>(null);

  const { data: appData, isLoading } = useQuery<{ app: any; extraction: any }>({
    queryKey: ["/api/applications", id],
    queryFn: () =>
      apiGet<{ app: any; extraction: any }>(`/api/applications/${id}`),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.app?.status;
      return status === "extracted" ||
        status === "scored" ||
        status === "completed"
        ? false
        : 3000;
    },
  });

  const fields = appData?.extraction?.fields ?? {};
  const directors: Array<{
    name: string;
    id: string;
    share: string;
    age?: number;
  }> = fields.directors ?? [];
  const banking: Array<{
    bank: string;
    facility: string;
    limit: string;
    outstanding: string;
    status: string;
  }> = fields.bankingFacilities ?? [];

  function fieldVal(key: string, fallback = "—") {
    return fields[key]?.value ?? fallback;
  }
  function fieldConf(key: string) {
    return fields[key]?.confidence ?? "low";
  }

  const ConfidenceBadge = ({ level }: { level: string }) => {
    if (level === "high")
      return (
        <Badge
          variant="outline"
          className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 h-5"
        >
          High Confidence
        </Badge>
      );
    if (level === "medium")
      return (
        <Badge
          variant="outline"
          className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 h-5"
        >
          Medium Confidence
        </Badge>
      );
    return (
      <Badge
        variant="outline"
        className="text-[10px] bg-rose-50 text-rose-700 border-rose-200 h-5"
      >
        Low Confidence
      </Badge>
    );
  };

  const FieldRow = ({
    label,
    fieldKey,
    value,
    confidence,
  }: {
    label: string;
    fieldKey: string;
    value: string;
    confidence: string;
  }) => (
    <div className="group py-3 border-b border-border last:border-0">
      <div className="flex justify-between items-start mb-1">
        <label className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setEditingField(fieldKey)}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary">
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {editingField === fieldKey ? (
        <div className="flex gap-2">
          <Input defaultValue={value} className="h-8 text-sm" autoFocus />
          <Button
            size="sm"
            className="h-8"
            onClick={() => setEditingField(null)}
          >
            Save
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{value}</p>
        </div>
      )}
      <div className="mt-1 flex items-center gap-2">
        <ConfidenceBadge level={confidence} />
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/applications/new">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Review Extraction</h1>
              <p className="text-xs text-muted-foreground">
                Verify AI-extracted fields before scoring.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              <p className="text-sm font-medium">Mandatory Fields</p>
              <div className="flex items-center gap-2">
                <Progress value={92} className="w-32 h-2" />
                <span className="text-xs text-muted-foreground">24/26</span>
              </div>
            </div>
            <Button onClick={() => setLocation(`/applications/${id}/score`)}>
              Confirm & Score →
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          {/* Left Column: PDF Viewer */}
          <div className="col-span-4 bg-slate-900 rounded-lg overflow-hidden flex flex-col">
            <div className="bg-slate-800 p-2 flex items-center justify-between text-white border-b border-slate-700 shrink-0">
              <span className="text-xs font-mono">
                {appData?.app?.originalFileName ?? "CTOS_REPORT.pdf"}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 text-white hover:bg-slate-700"
                >
                  <ZoomOut className="w-3 h-3" />
                </Button>
                <span className="text-xs flex items-center">100%</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 text-white hover:bg-slate-700"
                >
                  <ZoomIn className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-slate-800/50 relative overflow-auto flex justify-center p-8">
              <img
                src="/assets/pdf-preview.png"
                alt="Report Preview"
                className="w-full h-auto object-contain shadow-2xl rounded-sm opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          {/* Middle Column: Fields */}
          <Card className="col-span-5 flex flex-col min-h-0 border-0 shadow-none bg-transparent">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="py-3 bg-muted/30">
                    <CardTitle className="text-sm font-semibold">
                      Company Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <FieldRow
                      label="Company Name"
                      fieldKey="name"
                      value={fieldVal("companyName")}
                      confidence={fieldConf("companyName")}
                    />
                    <FieldRow
                      label="Registration No."
                      fieldKey="reg"
                      value={fieldVal("regNo")}
                      confidence={fieldConf("regNo")}
                    />
                    <FieldRow
                      label="Incorporation Date"
                      fieldKey="inc"
                      value={fieldVal("incDate")}
                      confidence={fieldConf("incDate")}
                    />
                    <FieldRow
                      label="Registered Address"
                      fieldKey="addr"
                      value={fieldVal("address")}
                      confidence={fieldConf("address")}
                    />
                    <FieldRow
                      label="Nature of Business"
                      fieldKey="nob"
                      value={fieldVal("natureOfBusiness")}
                      confidence={fieldConf("natureOfBusiness")}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3 bg-muted/30">
                    <CardTitle className="text-sm font-semibold">
                      Financial Strength
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <FieldRow
                      label="Paid-up Capital"
                      fieldKey="cap"
                      value={
                        fieldVal("paidUpCapital") !== "—"
                          ? `RM ${fieldVal("paidUpCapital")}`
                          : "—"
                      }
                      confidence={fieldConf("paidUpCapital")}
                    />
                    <FieldRow
                      label="Net Worth"
                      fieldKey="net"
                      value={
                        fieldVal("netWorth") !== "—"
                          ? `RM ${fieldVal("netWorth")}`
                          : "—"
                      }
                      confidence={fieldConf("netWorth")}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3 bg-muted/30">
                    <CardTitle className="text-sm font-semibold">
                      Directors & Shareholding
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left">
                        <tr>
                          <th className="p-3 font-medium text-muted-foreground">
                            Name
                          </th>
                          <th className="p-3 font-medium text-muted-foreground">
                            ID
                          </th>
                          <th className="p-3 font-medium text-muted-foreground">
                            Share %
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {directors.length > 0 ? (
                          directors.map((d, i) => (
                            <tr
                              key={i}
                              className="border-b last:border-0 hover:bg-muted/20"
                            >
                              <td className="p-3 font-medium">{d.name}</td>
                              <td className="p-3">{d.id}</td>
                              <td className="p-3">{d.share}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={3}
                              className="p-3 text-sm text-muted-foreground"
                            >
                              No director data extracted
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3 bg-muted/30">
                    <CardTitle className="text-sm font-semibold">
                      Risk Indicators
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <FieldRow
                      label="Active Litigation?"
                      fieldKey="lit"
                      value={fieldVal("litigation")}
                      confidence={fieldConf("litigation")}
                    />
                    <FieldRow
                      label="Bankruptcy History?"
                      fieldKey="bank"
                      value={fieldVal("bankruptcy")}
                      confidence={fieldConf("bankruptcy")}
                    />
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </Card>

          {/* Right Column: Summary/Issues */}
          <Card className="col-span-3 flex flex-col bg-slate-50 border-slate-100">
            <CardHeader>
              <CardTitle className="text-sm">Attention Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const lowFields = Object.entries(fields)
                  .filter(
                    ([k, v]: [string, any]) =>
                      typeof v === "object" && v?.confidence === "low",
                  )
                  .map(([k]) => k);
                const medFields = Object.entries(fields)
                  .filter(
                    ([k, v]: [string, any]) =>
                      typeof v === "object" && v?.confidence === "medium",
                  )
                  .map(([k]) => k);
                return lowFields.length > 0 || medFields.length > 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <div className="flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">
                          Low Confidence Fields
                        </p>
                        <ul className="list-disc list-inside text-xs text-amber-700 mt-1 space-y-1">
                          {[...medFields, ...lowFields].map((f) => (
                            <li key={f}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3">
                    <div className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <p className="text-sm font-semibold text-emerald-800">
                        All fields high confidence
                      </p>
                    </div>
                  </div>
                );
              })()}

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Extraction Source</p>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>
                    File:{" "}
                    <span className="font-mono text-foreground">
                      {appData?.app?.originalFileName ?? "—"}
                    </span>
                  </p>
                  <p>
                    Status:{" "}
                    <span className="text-foreground capitalize">
                      {appData?.app?.status ?? "—"}
                    </span>
                  </p>
                  <p>
                    Engine:{" "}
                    <span className="text-foreground">
                      Azure Document Intelligence
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

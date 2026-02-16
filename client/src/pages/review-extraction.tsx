import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link, useLocation } from "wouter";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Edit2, 
  ExternalLink,
  ChevronLeft,
  Eye,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Mock extracted data
const extractedData = {
  companyName: { value: "Mega Build Construction Sdn Bhd", confidence: "high" },
  regNo: { value: "201001002345 (999888-X)", confidence: "high" },
  incDate: { value: "15/03/2010", confidence: "high" },
  address: { value: "12, Jalan Industri 5, Kawasan Perindustrian Shah Alam, 40200 Shah Alam, Selangor", confidence: "medium" },
  natureOfBusiness: { value: "General construction and civil engineering works", confidence: "high" },
  paidUpCapital: { value: "500000", confidence: "high" },
  netWorth: { value: "1250000", confidence: "medium" },
  litigation: { value: "No", confidence: "high" },
  bankruptcy: { value: "No", confidence: "high" },
};

const directors = [
  { name: "Tan Ah Meng", id: "780101-14-1234", age: 46, share: "60%" },
  { name: "Lee Wei Kang", id: "820505-10-5678", age: 42, share: "40%" },
];

const banking = [
  { bank: "Maybank", facility: "Overdraft", limit: "RM 200,000", outstanding: "RM 150,000", status: "Performing" },
  { bank: "Public Bank", facility: "Term Loan", limit: "RM 500,000", outstanding: "RM 420,000", status: "Performing" },
];

export default function ReviewExtraction() {
  const [, setLocation] = useLocation();
  const [editingField, setEditingField] = useState<string | null>(null);

  const ConfidenceBadge = ({ level }: { level: string }) => {
    if (level === "high") return <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 h-5">High Confidence</Badge>;
    if (level === "medium") return <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 h-5">Medium Confidence</Badge>;
    return <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-200 h-5">Low Confidence</Badge>;
  };

  const FieldRow = ({ label, fieldKey, value, confidence }: { label: string, fieldKey: string, value: string, confidence: string }) => (
    <div className="group py-3 border-b border-border last:border-0">
      <div className="flex justify-between items-start mb-1">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
           <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingField(fieldKey)}>
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
          <Button size="sm" className="h-8" onClick={() => setEditingField(null)}>Save</Button>
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
              <Button variant="ghost" size="icon"><ChevronLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Review Extraction</h1>
              <p className="text-xs text-muted-foreground">Verify AI-extracted fields before scoring.</p>
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
            <Button onClick={() => setLocation("/applications/123/score")}>
              Confirm & Score →
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          {/* Left Column: PDF Viewer */}
          <div className="col-span-4 bg-slate-900 rounded-lg overflow-hidden flex flex-col">
            <div className="bg-slate-800 p-2 flex items-center justify-between text-white border-b border-slate-700 shrink-0">
               <span className="text-xs font-mono">CTOS_REPORT_MEGA_BUILD.pdf</span>
               <div className="flex gap-2">
                 <Button variant="ghost" size="sm" className="h-6 w-6 text-white hover:bg-slate-700"><ZoomOut className="w-3 h-3" /></Button>
                 <span className="text-xs flex items-center">100%</span>
                 <Button variant="ghost" size="sm" className="h-6 w-6 text-white hover:bg-slate-700"><ZoomIn className="w-3 h-3" /></Button>
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
                    <CardTitle className="text-sm font-semibold">Company Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <FieldRow label="Company Name" fieldKey="name" value={extractedData.companyName.value} confidence={extractedData.companyName.confidence} />
                    <FieldRow label="Registration No." fieldKey="reg" value={extractedData.regNo.value} confidence={extractedData.regNo.confidence} />
                    <FieldRow label="Incorporation Date" fieldKey="inc" value={extractedData.incDate.value} confidence={extractedData.incDate.confidence} />
                    <FieldRow label="Registered Address" fieldKey="addr" value={extractedData.address.value} confidence={extractedData.address.confidence} />
                    <FieldRow label="Nature of Business" fieldKey="nob" value={extractedData.natureOfBusiness.value} confidence={extractedData.natureOfBusiness.confidence} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3 bg-muted/30">
                    <CardTitle className="text-sm font-semibold">Financial Strength</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <FieldRow label="Paid-up Capital" fieldKey="cap" value={`RM ${extractedData.paidUpCapital.value}`} confidence={extractedData.paidUpCapital.confidence} />
                    <FieldRow label="Net Worth" fieldKey="net" value={`RM ${extractedData.netWorth.value}`} confidence={extractedData.netWorth.confidence} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3 bg-muted/30">
                    <CardTitle className="text-sm font-semibold">Directors & Shareholding</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left">
                        <tr>
                          <th className="p-3 font-medium text-muted-foreground">Name</th>
                          <th className="p-3 font-medium text-muted-foreground">ID</th>
                          <th className="p-3 font-medium text-muted-foreground">Share %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {directors.map((d, i) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                            <td className="p-3 font-medium">{d.name}</td>
                            <td className="p-3">{d.id}</td>
                            <td className="p-3">{d.share}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3 bg-muted/30">
                    <CardTitle className="text-sm font-semibold">Risk Indicators</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <FieldRow label="Active Litigation?" fieldKey="lit" value={extractedData.litigation.value} confidence={extractedData.litigation.confidence} />
                    <FieldRow label="Bankruptcy History?" fieldKey="bank" value={extractedData.bankruptcy.value} confidence={extractedData.bankruptcy.confidence} />
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
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Low Confidence Fields</p>
                      <ul className="list-disc list-inside text-xs text-amber-700 mt-1 space-y-1">
                        <li>Registered Address</li>
                        <li>Net Worth</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />
                
                <div>
                  <p className="text-sm font-medium mb-2">Extraction Source</p>
                  <div className="text-xs text-muted-foreground space-y-2">
                    <p>File: <span className="font-mono text-foreground">CTOS_REPORT.pdf</span></p>
                    <p>Processed: <span className="text-foreground">Just now</span></p>
                    <p>Engine: <span className="text-foreground">V3.4 (Chin Hin Custom)</span></p>
                  </div>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

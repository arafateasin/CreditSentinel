import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloud, FileText, Bot, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { apiUpload } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function NewApplication() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    limit: "",
    salesman: "",
  });

  const handleStartAgent = async () => {
    if (!file) return;
    setIsAgentRunning(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("pdf", file);
      fd.append("customer_name", formData.customerName);
      fd.append("requested_limit", formData.limit);
      fd.append("salesman", formData.salesman);

      const result = await apiUpload<{ id: string; status: string }>(
        "/api/applications",
        fd,
      );
      toast({
        title: "Agent Started",
        description: "CTOS extraction underway…",
      });
      setLocation(`/applications/${result.id}/extraction`);
    } catch (err: any) {
      setIsAgentRunning(false);
      setError(err.message ?? "Upload failed");
    }
  };

  const isFormValid =
    file && formData.customerName && formData.limit && formData.salesman;

  return (
    <Layout>
      <div className="space-y-8 max-w-5xl mx-auto py-8">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              New Credit Application
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-[10px] font-black">
                1
              </span>
              <span className="text-sm font-black text-primary">
                Upload CTOS
              </span>
              <div className="w-8 h-px bg-slate-200" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black">
                2
              </span>
              <span className="text-sm font-bold text-slate-400">
                Agent Processes
              </span>
              <div className="w-8 h-px bg-slate-200" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black">
                3
              </span>
              <span className="text-sm font-bold text-slate-400">
                Review Decision
              </span>
            </div>
          </div>
        </div>

        {isAgentRunning ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-black">Agent Orchestrating...</h2>
              <p className="text-slate-500 font-medium mt-2 italic">
                Building your Decision Pack (≈30–60s)...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <Card className="lg:col-span-3 border-none shadow-xl shadow-slate-200/50">
              <CardHeader>
                <CardTitle className="text-lg font-black">
                  Upload CTOS Report
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-16 text-center transition-all cursor-pointer",
                    file
                      ? "border-primary/50 bg-primary/5"
                      : "border-slate-200 hover:border-primary/30 hover:bg-slate-50/50",
                  )}
                  onClick={() =>
                    document.getElementById("ctos-upload")?.click()
                  }
                >
                  <input
                    id="ctos-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file ? (
                    <div className="space-y-4">
                      <FileText className="w-16 h-16 text-primary mx-auto" />
                      <div>
                        <p className="font-black text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase mt-1">
                          Ready for Extraction
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <UploadCloud className="w-16 h-16 text-slate-300 mx-auto" />
                      <div>
                        <p className="font-black text-slate-900 text-lg">
                          Drop CTOS PDF here
                        </p>
                        <p className="text-sm text-slate-400 font-medium mt-1">
                          or Browse files
                        </p>
                      </div>
                      <div className="pt-4 flex flex-col items-center gap-2">
                        <div className="flex justify-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span>Supported: CTOS PDF Only</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1" />
                          <span>Max: 15MB</span>
                        </div>
                        <p className="text-[10px] text-amber-600 font-bold italic">
                          Supported: CTOS PDF reports only
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50">
              <CardHeader>
                <CardTitle className="text-lg font-black">
                  Application Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Customer Name *
                  </Label>
                  <Input
                    placeholder="Enter legal name"
                    className="h-12 border-slate-200 focus:ring-primary font-bold"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Requested Limit (RM) *
                  </Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="h-12 border-slate-200 focus:ring-primary font-bold"
                    value={formData.limit}
                    onChange={(e) =>
                      setFormData({ ...formData, limit: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Salesman PIC *
                  </Label>
                  <Select
                    onValueChange={(v) =>
                      setFormData({ ...formData, salesman: v })
                    }
                  >
                    <SelectTrigger className="h-12 border-slate-200 font-bold">
                      <SelectValue placeholder="Select salesman" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john">John Tan</SelectItem>
                      <SelectItem value="sarah">Sarah Chen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    placeholder="Additional context..."
                    className="min-h-[100px] border-slate-200 focus:ring-primary font-medium"
                  />
                </div>
                <Button
                  className="w-full h-14 font-black text-base shadow-xl shadow-primary/20 mt-4"
                  disabled={!isFormValid || isAgentRunning}
                  onClick={handleStartAgent}
                >
                  Start Credit Sentinel Agent →
                </Button>
                {error && (
                  <div className="flex items-center gap-2 text-rose-600 text-sm font-medium mt-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}

import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
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
import { UploadCloud, FileText, Loader2, X, Bot } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function NewApplication() {
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    limit: "",
    salesPerson: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleStartAgent = () => {
    setIsAgentRunning(true);
    // Simulate agent processing delay
    setTimeout(() => {
      setIsAgentRunning(false);
      setLocation("/applications/APP-NEW-001/assessment");
    }, 2500);
  };

  const isFormValid = file && formData.customerName && formData.limit;

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Credit Application</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
              <span className="text-sm font-medium">Upload & Start Agent</span>
              <div className="w-8 h-px bg-border" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">2</span>
              <span className="text-sm text-muted-foreground">Agent Assessment</span>
              <div className="w-8 h-px bg-border" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">3</span>
              <span className="text-sm text-muted-foreground">Human Decision</span>
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
              <h2 className="text-xl font-bold">Agent Started</h2>
              <p className="text-muted-foreground mt-2">Parsing CTOS and building assessment (≈30–60s)...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
            <Card className="md:col-span-2">
              <CardContent className="p-12 text-center">
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-lg p-12 transition-all cursor-pointer",
                    file ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25 hover:bg-muted/50"
                  )}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-12 h-12 text-primary" />
                      <p className="font-medium">{file.name}</p>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Remove</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <UploadCloud className="w-12 h-12 text-muted-foreground" />
                      <p className="font-medium">Drop CTOS PDF here or click to browse</p>
                      <p className="text-xs text-muted-foreground">PDF only, max 15MB</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} placeholder="e.g. Mega Build Sdn Bhd" />
                </div>
                <div className="space-y-2">
                  <Label>Requested Limit (RM)</Label>
                  <Input type="number" value={formData.limit} onChange={(e) => setFormData({...formData, limit: e.target.value})} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Sales PIC</Label>
                  <Select onValueChange={(v) => setFormData({...formData, salesPerson: v})}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alex">Alex Morgan</SelectItem>
                      <SelectItem value="sarah">Sarah Chen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full h-12 text-base font-bold" disabled={!isFormValid} onClick={handleStartAgent}>
                  Start Credit Sentinel Agent →
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}

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
import { UploadCloud, FileText, Loader2, X } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function NewApplication() {
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    setIsUploading(true);
    // Simulate upload and extraction delay
    setTimeout(() => {
      setIsUploading(false);
      setLocation("/applications/APP-NEW-001/extraction");
    }, 2000);
  };

  const isFormValid = file && formData.customerName && formData.limit;

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Credit Application</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
              <span className="text-sm font-medium text-foreground">Upload CTOS</span>
              <div className="w-8 h-px bg-border" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">2</span>
              <span className="text-sm text-muted-foreground">Review Extraction</span>
              <div className="w-8 h-px bg-border" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">3</span>
              <span className="text-sm text-muted-foreground">Score & Decide</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Step 1 of 3</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: File Upload */}
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div 
                className={cn(
                  "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
                  file ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                )}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                />
                
                {!file ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-primary/10 text-primary">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Drop CTOS PDF here</h3>
                      <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                    </div>
                    <p className="text-xs text-muted-foreground">PDF only, max 15MB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-emerald-100 text-emerald-600">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{file.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" /> Remove File
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Meta Form */}
          <Card className="h-fit">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name <span className="text-destructive">*</span></Label>
                <Input 
                  id="customer" 
                  placeholder="e.g. Mega Build Sdn Bhd" 
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">Requested Limit (RM) <span className="text-destructive">*</span></Label>
                <Input 
                  id="limit" 
                  type="number" 
                  placeholder="0.00" 
                  value={formData.limit}
                  onChange={(e) => setFormData({...formData, limit: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sales">Sales Person</Label>
                <Select 
                  value={formData.salesPerson} 
                  onValueChange={(val) => setFormData({...formData, salesPerson: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sales person" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alex">Alex Morgan</SelectItem>
                    <SelectItem value="sarah">Sarah Chen</SelectItem>
                    <SelectItem value="mike">Mike Ross</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any additional context..." 
                  className="min-h-[100px]"
                />
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Button 
                  className="w-full" 
                  disabled={!isFormValid || isUploading}
                  onClick={handleSubmit}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    "Upload & Extract →"
                  )}
                </Button>
                <Button variant="outline" className="w-full" disabled={isUploading}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

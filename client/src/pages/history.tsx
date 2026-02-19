import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";

const historyData = [
  { customer: "ABC Trading Sdn Bhd", decision: "Approved", risk: "Medium", match: true, limit: "500,000", officer: "Alex Morgan", date: "2023-10-24" },
  { customer: "Mega Build Construction", decision: "Approved", risk: "Low", match: true, limit: "500,000", officer: "Alex Morgan", date: "2023-10-23" },
  { customer: "Global Logistics Partners", decision: "Rejected", risk: "High", match: false, limit: "0", officer: "Sarah Chen", date: "2023-10-22" },
  { customer: "Sunrise Properties", decision: "Review", risk: "Medium", match: true, limit: "0", officer: "Alex Morgan", date: "2023-10-21" },
];

export default function HistoryPage() {
  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto py-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Decision History</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Audit log of all past credit decisions and agent matches.</p>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/50">
          <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input placeholder="Search history..." className="pl-10 h-10 border-slate-200" />
              </div>
              <Button variant="outline" className="h-10 border-slate-200"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Show Overrides Only</span>
               <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-bold text-slate-900">Customer</TableHead>
                  <TableHead className="font-bold text-slate-900">Decision</TableHead>
                  <TableHead className="font-bold text-slate-900">Risk</TableHead>
                  <TableHead className="font-bold text-slate-900">Agent Match</TableHead>
                  <TableHead className="font-bold text-slate-900">Limit (RM)</TableHead>
                  <TableHead className="font-bold text-slate-900">Officer</TableHead>
                  <TableHead className="font-bold text-slate-900">Date</TableHead>
                  <TableHead className="text-right font-bold text-slate-900">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.map((row, i) => (
                  <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-bold text-slate-700">{row.customer}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "font-black text-[10px] uppercase",
                        row.decision === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        row.decision === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-amber-50 text-amber-700 border-amber-100"
                      )}>
                        {row.decision}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-bold text-[10px] uppercase">{row.risk}</Badge>
                    </TableCell>
                    <TableCell>
                       {row.match ? (
                         <div className="flex items-center gap-1.5 text-emerald-600">
                           <CheckCircle2 className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Match</span>
                         </div>
                       ) : (
                         <div className="flex items-center gap-1.5 text-rose-600">
                           <AlertCircle className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Override</span>
                         </div>
                       )}
                    </TableCell>
                    <TableCell className="font-bold">{row.limit}</TableCell>
                    <TableCell className="text-slate-500 font-medium">{row.officer}</TableCell>
                    <TableCell className="text-slate-400 font-bold text-xs">{row.date}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                         <Eye className="w-4 h-4 text-primary" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

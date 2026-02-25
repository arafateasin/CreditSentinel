import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Search, Filter, Calendar as CalendarIcon, Bot, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const applications = [
  {
    id: "APP-001",
    customer: "Mega Build Construction Sdn Bhd",
    limit: 500000,
    risk: "Low",
    agentStage: "Assessment Ready",
    officerStatus: "Not Reviewed",
    age: "2h",
  },
  {
    id: "APP-002",
    customer: "TechStream Solutions",
    limit: 150000,
    risk: "Moderate",
    agentStage: "Extracting",
    officerStatus: "Not Reviewed",
    age: "4h",
  },
  {
    id: "APP-003",
    customer: "Global Logistics Partners",
    limit: 1000000,
    risk: "High",
    agentStage: "Assessment Ready",
    officerStatus: "In Review",
    age: "1d",
  },
  {
    id: "APP-004",
    customer: "Retail King Enterprise",
    limit: 50000,
    risk: "Not Scored",
    agentStage: "New",
    officerStatus: "Not Reviewed",
    age: "15m",
  },
  {
    id: "APP-005",
    customer: "Sunrise Properties",
    limit: 750000,
    risk: "Moderate",
    agentStage: "Error",
    officerStatus: "Not Reviewed",
    age: "1h",
  },
];

export default function ApplicationsQueue() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Applications Queue</h1>
            <p className="text-muted-foreground font-medium">Each row represents an agent-prepared credit case.</p>
          </div>
          <Link href="/applications/new">
            <Button className="font-bold shadow-lg shadow-primary/10">+ New Case</Button>
          </Link>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search company or reg no..."
                    className="pl-10 h-10 border-slate-200 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px] h-10 border-slate-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="assessment">Assessment Ready</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[120px] h-10 border-slate-200">
                    <SelectValue placeholder="Risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200">
                  <CalendarIcon className="h-4 w-4 text-slate-500" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-slate-900 h-12">Customer</TableHead>
                  <TableHead className="font-bold text-slate-900 h-12">Requested Limit</TableHead>
                  <TableHead className="font-bold text-slate-900 h-12">Risk Category</TableHead>
                  <TableHead className="font-bold text-slate-900 h-12">Agent Stage</TableHead>
                  <TableHead className="font-bold text-slate-900 h-12">Officer Status</TableHead>
                  <TableHead className="font-bold text-slate-900 h-12">Age</TableHead>
                  <TableHead className="text-right font-bold text-slate-900 h-12">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id} className="hover:bg-slate-50/80 transition-colors group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-sm">{app.customer}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{app.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-700">RM {app.limit.toLocaleString()}</TableCell>
                    <TableCell>
                      {app.risk === "Low" ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold px-2 py-0.5 uppercase tracking-widest text-[9px]">Risk: LOW</Badge>
                      ) : app.risk === "Moderate" ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold px-2 py-0.5 uppercase tracking-widest text-[9px]">Risk: MEDIUM</Badge>
                      ) : app.risk === "High" ? (
                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold px-2 py-0.5 uppercase tracking-widest text-[9px]">Risk: HIGH</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 font-bold px-2 py-0.5 uppercase tracking-widest text-[9px]">Risk: N/A</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <div className={cn(
                           "w-1.5 h-1.5 rounded-full",
                           app.agentStage === "Assessment Ready" ? "bg-emerald-500" : 
                           app.agentStage === "Extracting" ? "bg-blue-500 animate-pulse" : 
                           app.agentStage === "Error" ? "bg-rose-500" : "bg-slate-300"
                         )} />
                         <span className="text-xs font-bold text-slate-600">{app.agentStage}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "font-black text-[9px] uppercase tracking-widest px-2 py-0.5",
                        app.officerStatus === "In Review" ? "bg-indigo-50 text-indigo-700 border-indigo-100" : 
                        app.officerStatus === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                        Status: {app.officerStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs font-bold">{app.age}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/applications/${app.id}/assessment`}>
                        <Button size="sm" variant="ghost" className="font-bold hover:bg-primary hover:text-white transition-all rounded-lg h-8">
                          Open Case <ArrowRight className="ml-2 w-3 h-3" />
                        </Button>
                      </Link>
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

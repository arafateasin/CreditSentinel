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
import { Bot, CheckCircle2, AlertCircle, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const tasks = [
  { id: "JOB-001", customer: "Mega Build Construction", type: "Extraction", status: "Completed", time: "2m ago" },
  { id: "JOB-002", customer: "Mega Build Construction", type: "Scoring", status: "Completed", time: "1m ago" },
  { id: "JOB-003", customer: "Sunrise Properties", type: "Extraction", status: "In Progress", time: "Just now" },
  { id: "JOB-004", customer: "Global Logistics", type: "Audit Check", status: "Completed", time: "1h ago" },
  { id: "JOB-005", customer: "NextGen Tech", type: "Parsing", status: "Error", time: "2h ago" },
];

export default function AgentTasks() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agent Tasks & Orchestration</h1>
            <p className="text-muted-foreground">Monitor the background work of Credit Sentinel Agent.</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Filter tasks..." className="pl-8" />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Operation Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-mono text-xs">{task.id}</TableCell>
                    <TableCell className="font-bold">{task.customer}</TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <Bot className="w-3.5 h-3.5 text-primary" />
                          <span className="text-sm">{task.type}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       {task.status === "Completed" && (
                         <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                         </Badge>
                       )}
                       {task.status === "In Progress" && (
                         <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1.5 font-bold">
                            <Clock className="w-3 h-3 animate-pulse" /> Running
                         </Badge>
                       )}
                       {task.status === "Error" && (
                         <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 gap-1.5 font-bold">
                            <AlertCircle className="w-3 h-3" /> Error
                         </Badge>
                       )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{task.time}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm">Logs</Button>
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

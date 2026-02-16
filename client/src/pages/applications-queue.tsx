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
import { Search, Filter, Calendar as CalendarIcon } from "lucide-react";
import { Link } from "wouter";

const applications = [
  {
    id: "APP-001",
    customer: "Mega Build Construction Sdn Bhd",
    limit: 500000,
    risk: "Low",
    status: "Ready to review",
    age: "2h",
    updatedBy: "System",
  },
  {
    id: "APP-002",
    customer: "TechStream Solutions",
    limit: 150000,
    risk: "Moderate",
    status: "Extraction verified",
    age: "4h",
    updatedBy: "Alex Morgan",
  },
  {
    id: "APP-003",
    customer: "Global Logistics Partners",
    limit: 1000000,
    risk: "High",
    status: "Awaiting decision",
    age: "1d",
    updatedBy: "Sarah Chen",
  },
  {
    id: "APP-004",
    customer: "Retail King Enterprise",
    limit: 50000,
    risk: "Low",
    status: "New",
    age: "15m",
    updatedBy: "System",
  },
  {
    id: "APP-005",
    customer: "Sunrise Properties",
    limit: 750000,
    risk: "Moderate",
    status: "Extracting",
    age: "1h",
    updatedBy: "System",
  },
  {
    id: "APP-006",
    customer: "NextGen Tech",
    limit: 200000,
    risk: "Not Scored",
    status: "New",
    age: "3h",
    updatedBy: "System",
  },
];

export default function ApplicationsQueue() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Applications Queue</h1>
            <p className="text-muted-foreground">Manage and process credit applications.</p>
          </div>
          <Link href="/applications/new">
            <Button>+ New Application</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search company or registration no..."
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="extracted">Extracted</SelectItem>
                    <SelectItem value="scored">Scored</SelectItem>
                    <SelectItem value="hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer / Company</TableHead>
                  <TableHead>Requested Limit</TableHead>
                  <TableHead>Risk Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Last Updated By</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div>
                        {app.customer}
                        <div className="text-xs text-muted-foreground">{app.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>RM {app.limit.toLocaleString()}</TableCell>
                    <TableCell>
                      {app.risk === "Low" && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Low Risk</Badge>}
                      {app.risk === "Moderate" && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Moderate</Badge>}
                      {app.risk === "High" && <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">High Risk</Badge>}
                      {app.risk === "Not Scored" && <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">Not Scored</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn(
                        "font-normal",
                        app.status === "New" && "bg-blue-100 text-blue-700",
                        app.status === "Extracting" && "bg-yellow-100 text-yellow-700",
                        app.status === "Ready to review" && "bg-purple-100 text-purple-700",
                        app.status === "Awaiting decision" && "bg-orange-100 text-orange-700",
                        app.status === "Extraction verified" && "bg-indigo-100 text-indigo-700"
                      )}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{app.age}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{app.updatedBy}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/applications/${app.id}/extraction`}>
                        <Button size="sm">Open</Button>
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

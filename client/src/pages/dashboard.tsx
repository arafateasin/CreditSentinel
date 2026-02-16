import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from "recharts";
import { 
  ArrowUpRight, 
  Users, 
  Clock, 
  CheckCircle2, 
  Zap,
  Bot
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const kpiData = [
  {
    title: "Applications (7d)",
    value: "42",
    label: "Total last 7 days",
    icon: Users,
    trend: "+12%",
    trendUp: true,
  },
  {
    title: "Avg Turnaround",
    value: "1.8h",
    label: "Upload → Decision",
    icon: Clock,
    trend: "-24%",
    trendUp: true,
  },
  {
    title: "Agent Efficiency",
    value: "94%",
    label: "No major edits",
    icon: Zap,
    trend: "+2%",
    trendUp: true,
  },
  {
    title: "Decision Match",
    value: "88%",
    label: "No overrides",
    icon: Bot,
    trend: "+5%",
    trendUp: true,
  },
];

const riskData = [
  { name: "Low Risk", value: 45, color: "hsl(var(--chart-2))" },
  { name: "Moderate", value: 30, color: "hsl(var(--chart-3))" },
  { name: "High Risk", value: 15, color: "hsl(var(--chart-4))" },
];

const timeData = [
  { day: "Mon", hours: 2.2 },
  { day: "Tue", hours: 1.8 },
  { day: "Wed", hours: 2.1 },
  { day: "Thu", hours: 1.6 },
  { day: "Fri", hours: 1.5 },
  { day: "Sat", hours: 1.2 },
  { day: "Sun", hours: 1.1 },
];

const applications = [
  {
    id: "APP-001",
    customer: "Mega Build Construction Sdn Bhd",
    limit: 500000,
    risk: "Low",
    status: "Scored",
    age: "2h",
  },
  {
    id: "APP-002",
    customer: "TechStream Solutions",
    limit: 150000,
    risk: "Moderate",
    status: "Extracted",
    age: "4h",
  },
  {
    id: "APP-003",
    customer: "Global Logistics Partners",
    limit: 1000000,
    risk: "High",
    status: "Scored",
    age: "1d",
  },
];

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Agent Performance Overview</h1>
            <p className="text-muted-foreground">Tracking how Credit Sentinel Agent handles the pipeline.</p>
          </div>
          <div className="flex items-center gap-2">
             <Link href="/applications/new">
                <Button>+ New Application</Button>
             </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <kpi.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-end justify-between mt-2">
                  <div>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
                  </div>
                  <div className="text-emerald-600 text-xs font-medium flex items-center">
                    {kpi.trend} <ArrowUpRight className="h-3 w-3 ml-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Applications by Risk Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avg Turnaround per Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications Waiting for Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Requested Limit</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Agent Status</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.customer}</TableCell>
                    <TableCell>RM {app.limit.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        app.risk === "Low" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      )}>{app.risk}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{app.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{app.age}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/applications/${app.id}/assessment`}>
                        <Button size="sm" variant="ghost">Review Case</Button>
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

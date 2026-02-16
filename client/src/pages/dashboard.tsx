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
  FileText 
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

const kpiData = [
  {
    title: "New Applications",
    value: "12",
    label: "Today",
    icon: Users,
    trend: "+20%",
    trendUp: true,
  },
  {
    title: "Avg Turnaround",
    value: "4.2h",
    label: "Last 7 days",
    icon: Clock,
    trend: "-12%",
    trendUp: true, // actually good if time goes down, but visually green usually means good
  },
  {
    title: "Approval Rate",
    value: "68%",
    label: "Last 7 days",
    icon: CheckCircle2,
    trend: "+5%",
    trendUp: true,
  },
  {
    title: "In Review",
    value: "8",
    label: "Current pending",
    icon: FileText,
    trend: "Active",
    trendUp: null,
  },
];

const riskData = [
  { name: "Low Risk", value: 45, color: "hsl(var(--chart-2))" }, // Green
  { name: "Moderate", value: 30, color: "hsl(var(--chart-3))" }, // Orange
  { name: "High Risk", value: 15, color: "hsl(var(--chart-4))" }, // Red
  { name: "Rejected", value: 10, color: "hsl(var(--muted-foreground))" },
];

const timeData = [
  { day: "Mon", hours: 5.2 },
  { day: "Tue", hours: 4.8 },
  { day: "Wed", hours: 4.1 },
  { day: "Thu", hours: 3.9 },
  { day: "Fri", hours: 4.5 },
  { day: "Sat", hours: 6.0 },
  { day: "Sun", hours: 5.5 },
];

const applications = [
  {
    id: "APP-001",
    customer: "Mega Build Construction Sdn Bhd",
    limit: 500000,
    risk: "Low",
    status: "Ready to Review",
    age: "2h",
  },
  {
    id: "APP-002",
    customer: "TechStream Solutions",
    limit: 150000,
    risk: "Moderate",
    status: "Extraction Verified",
    age: "4h",
  },
  {
    id: "APP-003",
    customer: "Global Logistics Partners",
    limit: 1000000,
    risk: "High",
    status: "Awaiting Decision",
    age: "1d",
  },
  {
    id: "APP-004",
    customer: "Retail King Enterprise",
    limit: 50000,
    risk: "Low",
    status: "New",
    age: "15m",
  },
  {
    id: "APP-005",
    customer: "Sunrise Properties",
    limit: 750000,
    risk: "Moderate",
    status: "Processing",
    age: "1h",
  },
];

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Today's Credit Pipeline</h1>
            <p className="text-muted-foreground">Overview of your credit assessment queue.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="7d">
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button>View Reports</Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <kpi.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-end justify-between mt-2">
                  <div>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
                  </div>
                  {kpi.trendUp !== null && (
                    <div className={cn(
                      "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                      kpi.trendUp 
                        ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" 
                        : "text-rose-700 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400"
                    )}>
                      {kpi.trend}
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)' 
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[4, 4, 0, 0]} 
                      barSize={50}
                    >
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
              <CardTitle>Avg Turnaround Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeData} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)' 
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2} 
                      dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Applications Awaiting Action</CardTitle>
            <Button variant="outline" size="sm">View All Queue</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Requested Limit</TableHead>
                  <TableHead>Risk Profile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Age</TableHead>
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
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          app.status === "New" ? "bg-blue-500" :
                          app.status === "Processing" ? "bg-amber-500" :
                          "bg-slate-300"
                        )} />
                        {app.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{app.age}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">Open</Button>
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

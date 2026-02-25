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
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

const pieData = [
  { name: 'Approve', value: 400, color: '#10B981' },
  { name: 'Reject', value: 100, color: '#EF4444' },
  { name: 'Review', value: 200, color: '#F59E0B' },
];

const barData = [
  { name: 'Alex M.', time: 24 },
  { name: 'Sarah C.', time: 42 },
  { name: 'Mike R.', time: 35 },
  { name: 'System', time: 12 },
];

const topApprovals = [
  { customer: "Global Logistics Partners", limit: "RM 1,200,000", date: "2023-10-24" },
  { customer: "Mega Build Construction", limit: "RM 850,000", date: "2023-10-22" },
  { customer: "Sunrise Properties", limit: "RM 750,000", date: "2023-10-20" },
];

export default function ReportsPage() {
  return (
    <Layout>
      <div className="space-y-8 max-w-6xl mx-auto py-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">System Performance Reports</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Insights into decision trends and operational efficiency.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg font-black uppercase tracking-widest text-slate-400">Decisions Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg font-black uppercase tracking-widest text-slate-400">Avg Turnaround (Min)</CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} fontVariant="bold" />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="time" fill="#1E3A8A" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/50">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-lg font-black uppercase tracking-widest text-slate-400">Top 10 Largest Approvals</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-bold text-slate-900">Customer</TableHead>
                  <TableHead className="font-bold text-slate-900">Agent Match %</TableHead>
                  <TableHead className="font-bold text-slate-900">Approved Limit</TableHead>
                  <TableHead className="text-right font-bold text-slate-900">Approval Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { customer: "Global Logistics Partners", match: "98%", limit: "RM 1,200,000", date: "2023-10-24" },
                  { customer: "Mega Build Construction", match: "94%", limit: "RM 850,000", date: "2023-10-22" },
                  { customer: "Sunrise Properties", match: "100%", limit: "RM 750,000", date: "2023-10-20" },
                ].map((row, i) => (
                  <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-bold text-slate-700">{row.customer}</TableCell>
                    <TableCell>
                       <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[10px]">{row.match}</Badge>
                    </TableCell>
                    <TableCell className="font-black text-primary">{row.limit}</TableCell>
                    <TableCell className="text-right text-slate-400 font-bold text-xs">{row.date}</TableCell>
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

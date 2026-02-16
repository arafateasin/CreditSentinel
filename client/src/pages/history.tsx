import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

const historyData = [
  {
    id: "APP-001",
    customer: "Mega Build Construction Sdn Bhd",
    limit: 500000,
    decision: "Approved",
    date: "2023-10-24",
    officer: "Alex Morgan",
  },
  {
    id: "APP-003",
    customer: "Global Logistics Partners",
    limit: 1000000,
    decision: "Rejected",
    date: "2023-10-23",
    officer: "Sarah Chen",
  },
  {
    id: "APP-007",
    customer: "Klang Valley Distributors",
    limit: 300000,
    decision: "Approved",
    date: "2023-10-22",
    officer: "Alex Morgan",
  },
];

export default function HistoryPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Decision History</h1>
          <p className="text-muted-foreground">Audit log of all past credit decisions.</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search history..." className="pl-8" />
              </div>
              <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Limit (RM)</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead>Officer</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="font-medium">{item.customer}</TableCell>
                    <TableCell>{item.limit.toLocaleString()}</TableCell>
                    <TableCell>
                      {item.decision === "Approved" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Approved</Badge>
                      ) : (
                        <Badge variant="destructive">Rejected</Badge>
                      )}
                    </TableCell>
                    <TableCell>{item.officer}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View Details</Button>
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

import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Shield,
  Mail,
  Phone,
  ChevronLeft,
  Trash2,
  Edit,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "inactive";
  joinDate: string;
  approvals: number;
}

export default function TeamManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Ahmad Bin Abdullah",
      email: "ahmad.abdullah@chinhin.com.my",
      role: "Senior Credit Officer",
      department: "Credit Assessment",
      status: "active",
      joinDate: "2024-01-15",
      approvals: 234,
    },
    {
      id: "2",
      name: "Sarah Lee",
      email: "sarah.lee@chinhin.com.my",
      role: "Credit Analyst",
      department: "Credit Assessment",
      status: "active",
      joinDate: "2024-02-01",
      approvals: 187,
    },
    {
      id: "3",
      name: "Kumar Rajesh",
      email: "kumar.rajesh@chinhin.com.my",
      role: "Credit Manager",
      department: "Credit Assessment",
      status: "active",
      joinDate: "2023-11-10",
      approvals: 412,
    },
    {
      id: "4",
      name: "Linda Tan",
      email: "linda.tan@chinhin.com.my",
      role: "Junior Analyst",
      department: "Risk Management",
      status: "active",
      joinDate: "2024-03-01",
      approvals: 56,
    },
    {
      id: "5",
      name: "David Wong",
      email: "david.wong@chinhin.com.my",
      role: "Credit Officer",
      department: "SME Lending",
      status: "inactive",
      joinDate: "2023-08-20",
      approvals: 198,
    },
  ]);

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email || !newMember.role) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const member: TeamMember = {
      id: String(teamMembers.length + 1),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      department: newMember.department || "Credit Assessment",
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      approvals: 0,
    };

    setTeamMembers([...teamMembers, member]);
    setIsAddDialogOpen(false);
    setNewMember({ name: "", email: "", role: "", department: "" });

    toast({
      title: "Team Member Added",
      description: `${member.name} has been added to your team.`,
    });
  };

  const handleRemoveMember = (id: string, name: string) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
    toast({
      title: "Member Removed",
      description: `${name} has been removed from the team.`,
    });
  };

  const handleToggleStatus = (id: string) => {
    setTeamMembers(
      teamMembers.map((m) =>
        m.id === id
          ? { ...m, status: m.status === "active" ? "inactive" : "active" }
          : m,
      ),
    );
    toast({
      title: "Status Updated",
      description: "Team member status has been changed.",
    });
  };

  const filteredMembers = teamMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeCount = teamMembers.filter((m) => m.status === "active").length;
  const totalApprovals = teamMembers.reduce((sum, m) => sum + m.approvals, 0);

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Team Management
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Manage credit officers and access permissions
              </p>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg">
                <UserPlus className="w-4 h-4" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Team Member</DialogTitle>
                <DialogDescription>
                  Invite a new credit officer to join your team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="memberName">Full Name *</Label>
                  <Input
                    id="memberName"
                    placeholder="e.g. Ahmad Bin Abdullah"
                    value={newMember.name}
                    onChange={(e) =>
                      setNewMember({ ...newMember, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberEmail">Email Address *</Label>
                  <Input
                    id="memberEmail"
                    type="email"
                    placeholder="ahmad.abdullah@chinhin.com.my"
                    value={newMember.email}
                    onChange={(e) =>
                      setNewMember({ ...newMember, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberRole">Role *</Label>
                  <Select
                    value={newMember.role}
                    onValueChange={(value) =>
                      setNewMember({ ...newMember, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit Manager">
                        Credit Manager
                      </SelectItem>
                      <SelectItem value="Senior Credit Officer">
                        Senior Credit Officer
                      </SelectItem>
                      <SelectItem value="Credit Officer">
                        Credit Officer
                      </SelectItem>
                      <SelectItem value="Credit Analyst">
                        Credit Analyst
                      </SelectItem>
                      <SelectItem value="Junior Analyst">
                        Junior Analyst
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberDepartment">Department</Label>
                  <Select
                    value={newMember.department}
                    onValueChange={(value) =>
                      setNewMember({ ...newMember, department: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit Assessment">
                        Credit Assessment
                      </SelectItem>
                      <SelectItem value="Risk Management">
                        Risk Management
                      </SelectItem>
                      <SelectItem value="SME Lending">SME Lending</SelectItem>
                      <SelectItem value="Corporate Finance">
                        Corporate Finance
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddMember} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Separator />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-1">
                    Total Members
                  </p>
                  <p className="text-3xl font-black">{teamMembers.length}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-1">
                    Active Officers
                  </p>
                  <p className="text-3xl font-black text-emerald-600">
                    {activeCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-1">
                    Total Approvals
                  </p>
                  <p className="text-3xl font-black text-amber-600">
                    {totalApprovals}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Table */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Team Members
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approvals</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No team members found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white font-bold">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-sm">
                          {member.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {member.department}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-bold",
                            member.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200",
                          )}
                        >
                          {member.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-sm">
                          {member.approvals}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(member.id)}
                            className="h-8"
                          >
                            {member.status === "active"
                              ? "Deactivate"
                              : "Activate"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveMember(member.id, member.name)
                            }
                            className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Calendar,
  Save,
  Upload,
  Key,
  Bell,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function ProfileSettings() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "Ahmad Bin Abdullah",
    email: "ahmad.abdullah@chinhin.com.my",
    phone: "+60 12-345 6789",
    department: "Credit Assessment Division",
    position: "Senior Credit Officer",
    employeeId: "CH-2024-001",
    joinDate: "January 15, 2024",
    bio: "Experienced credit officer with 8+ years in financial risk assessment. Specialized in SME lending and credit policy compliance.",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
      setIsSaving(false);
      setIsEditing(false);
    }, 1000);
  };

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });

    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Profile Settings
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Manage your account information and preferences
              </p>
            </div>
          </div>
          <Badge className="bg-primary font-bold px-4 py-2">
            <Shield className="w-3 h-3 mr-2" />
            Verified Officer
          </Badge>
        </div>

        <Separator />

        {/* Profile Overview Card */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-slate-100">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl font-black bg-gradient-to-br from-primary to-blue-600 text-white">
                  AA
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-bold">{profile.fullName}</h3>
                <p className="text-sm text-muted-foreground">
                  {profile.position}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-2"
                  onClick={() => {
                    toast({
                      title: "Upload Feature",
                      description: "Photo upload will be available soon.",
                    });
                  }}
                >
                  <Upload className="w-3 h-3" />
                  Change Photo
                </Button>
              </div>
            </div>

            <Separator />

            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={profile.fullName}
                  onChange={(e) =>
                    setProfile({ ...profile, fullName: e.target.value })
                  }
                  disabled={!isEditing}
                  className="font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  disabled={!isEditing}
                  className="font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  disabled={!isEditing}
                  className="font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  Department
                </Label>
                <Input
                  id="department"
                  value={profile.department}
                  disabled
                  className="font-medium bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position" className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  Position
                </Label>
                <Input
                  id="position"
                  value={profile.position}
                  disabled
                  className="font-medium bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Employee ID
                </Label>
                <Input
                  id="employeeId"
                  value={profile.employeeId}
                  disabled
                  className="font-medium bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                Bio / About
              </Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                disabled={!isEditing}
                rows={3}
                className="resize-none font-medium"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="gap-2">
                  <User className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Security & Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-blue-900 mb-1">
                  Password Security
                </h4>
                <p className="text-sm text-blue-700">
                  Use a strong password with at least 8 characters, including
                  uppercase, lowercase, numbers, and symbols.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  placeholder="Enter current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleChangePassword} className="gap-2">
                <Key className="w-4 h-4" />
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                label: "Email Notifications",
                description: "Receive email alerts for new applications",
              },
              {
                label: "Decision Approvals",
                description: "Get notified when decisions need review",
              },
              {
                label: "System Updates",
                description: "Stay informed about system maintenance",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-bold text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast({
                      title: "Preference Updated",
                      description: `${item.label} setting saved.`,
                    })
                  }
                >
                  Enable
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

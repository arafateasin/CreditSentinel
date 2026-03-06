import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Database,
  RefreshCw,
  Download,
  Upload,
  HardDrive,
  Globe,
  ChevronLeft,
  Save,
  Zap,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    criticalAlerts: true,

    // System
    autoRefresh: true,
    refreshInterval: "3000",
    dataRetention: "90",
    language: "en",
    timezone: "Asia/Kuala_Lumpur",

    // Security
    twoFactorAuth: false,
    sessionTimeout: "30",
    ipWhitelist: false,
    auditLogging: true,

    // Display
    theme: "light",
    compactMode: false,
    showAnimations: true,
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export will be ready shortly.",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Import Feature",
      description: "Data import will be available soon.",
    });
  };

  const handleClearCache = () => {
    toast({
      title: "Cache Cleared",
      description: "Application cache has been cleared successfully.",
    });
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
                Application Settings
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Configure system preferences and behaviors
              </p>
            </div>
          </div>
          <Badge className="bg-primary font-bold px-4 py-2">
            <Zap className="w-3 h-3 mr-2" />
            System Active
          </Badge>
        </div>

        <Separator />

        {/* Notifications Settings */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email-notif" className="font-bold">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts for important events
                </p>
              </div>
              <Switch
                id="email-notif"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="push-notif" className="font-bold">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get browser push notifications for urgent matters
                </p>
              </div>
              <Switch
                id="push-notif"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, pushNotifications: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="weekly-reports" className="font-bold">
                  Weekly Reports
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive weekly summary of credit decisions
                </p>
              </div>
              <Switch
                id="weekly-reports"
                checked={settings.weeklyReports}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, weeklyReports: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="critical-alerts" className="font-bold">
                  Critical Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Immediate alerts for high-risk applications
                </p>
              </div>
              <Switch
                id="critical-alerts"
                checked={settings.criticalAlerts}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, criticalAlerts: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-primary" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="auto-refresh" className="font-bold">
                  Auto-Refresh Data
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically update application status
                </p>
              </div>
              <Switch
                id="auto-refresh"
                checked={settings.autoRefresh}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoRefresh: checked })
                }
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="refresh-interval" className="font-bold">
                Refresh Interval (milliseconds)
              </Label>
              <Select
                value={settings.refreshInterval}
                onValueChange={(value) =>
                  setSettings({ ...settings, refreshInterval: value })
                }
              >
                <SelectTrigger id="refresh-interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000">1 second (Fast)</SelectItem>
                  <SelectItem value="3000">3 seconds (Default)</SelectItem>
                  <SelectItem value="5000">5 seconds</SelectItem>
                  <SelectItem value="10000">10 seconds (Slow)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="data-retention" className="font-bold">
                Data Retention Period (days)
              </Label>
              <Select
                value={settings.dataRetention}
                onValueChange={(value) =>
                  setSettings({ ...settings, dataRetention: value })
                }
              >
                <SelectTrigger id="data-retention">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days (Default)</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="language"
                  className="font-bold flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Language
                </Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) =>
                    setSettings({ ...settings, language: value })
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ms">Bahasa Melayu</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone" className="font-bold">
                  Timezone
                </Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) =>
                    setSettings({ ...settings, timezone: value })
                  }
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kuala_Lumpur">
                      Kuala Lumpur (GMT+8)
                    </SelectItem>
                    <SelectItem value="Asia/Singapore">
                      Singapore (GMT+8)
                    </SelectItem>
                    <SelectItem value="Asia/Hong_Kong">
                      Hong Kong (GMT+8)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="2fa" className="font-bold">
                  Two-Factor Authentication
                </Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                id="2fa"
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, twoFactorAuth: checked })
                }
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="session-timeout" className="font-bold">
                Session Timeout (minutes)
              </Label>
              <Select
                value={settings.sessionTimeout}
                onValueChange={(value) =>
                  setSettings({ ...settings, sessionTimeout: value })
                }
              >
                <SelectTrigger id="session-timeout">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes (Default)</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="ip-whitelist" className="font-bold">
                  IP Whitelist
                </Label>
                <p className="text-sm text-muted-foreground">
                  Restrict access to specific IP addresses
                </p>
              </div>
              <Switch
                id="ip-whitelist"
                checked={settings.ipWhitelist}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, ipWhitelist: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="audit-logging" className="font-bold">
                  Audit Logging
                </Label>
                <p className="text-sm text-muted-foreground">
                  Track all system activities and changes
                </p>
              </div>
              <Switch
                id="audit-logging"
                checked={settings.auditLogging}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, auditLogging: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Display & Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme" className="font-bold">
                Theme
              </Label>
              <Select
                value={settings.theme}
                onValueChange={(value) =>
                  setSettings({ ...settings, theme: value })
                }
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light Mode</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                  <SelectItem value="auto">Auto (System)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="compact-mode" className="font-bold">
                  Compact Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Reduce spacing for more content density
                </p>
              </div>
              <Switch
                id="compact-mode"
                checked={settings.compactMode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, compactMode: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="animations" className="font-bold">
                  Animations
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable smooth transitions and effects
                </p>
              </div>
              <Switch
                id="animations"
                checked={settings.showAnimations}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, showAnimations: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleExportData}
              >
                <Download className="w-4 h-4" />
                Export Data
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleImportData}
              >
                <Upload className="w-4 h-4" />
                Import Data
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleClearCache}
              >
                <RefreshCw className="w-4 h-4" />
                Clear Cache
              </Button>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <HardDrive className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 mb-1">
                    Storage Usage
                  </h4>
                  <p className="text-sm text-amber-700">
                    Currently using 2.4 GB of 10 GB allocated storage
                  </p>
                  <div className="mt-2 h-2 bg-amber-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[24%]" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pb-8">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} className="gap-2 shadow-lg">
            <Save className="w-4 h-4" />
            Save All Settings
          </Button>
        </div>
      </div>
    </Layout>
  );
}

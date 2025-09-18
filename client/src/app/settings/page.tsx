"use client"

import { useAppDispatch, useAppSelector } from "@/app/redux"
import { setIsDarkMode } from "@/state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/(components)/ui/card"
import { Switch } from "@/app/(components)/ui/switch"
import { Button } from "@/app/(components)/ui/button"
import { Input } from "@//app/(components)/ui/input"
import { Label } from "@/app/(components)/ui/label"
import { Separator } from "@/app/(components)/ui/separator"
import { useUser } from "@clerk/nextjs"
import { Bell, Moon, Sun, User, Shield, Database, Download } from "lucide-react"

const SettingsPage = () => {
  const dispatch = useAppDispatch()
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode)
  const { user } = useUser()

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>Update your profile information and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue={user?.firstName || ""} placeholder="Enter first name" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue={user?.lastName || ""} placeholder="Enter last name" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.emailAddresses[0]?.emailAddress || ""}
                placeholder="Enter email"
              />
            </div>
            <Button>Save Profile Changes</Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize the appearance of your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-gray-600">Toggle between light and dark themes</p>
              </div>
              <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="low-stock">Low Stock Alerts</Label>
                <p className="text-sm text-gray-600">Get notified when products are running low</p>
              </div>
              <Switch id="low-stock" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sales-reports">Sales Reports</Label>
                <p className="text-sm text-gray-600">Receive daily sales summary reports</p>
              </div>
              <Switch id="sales-reports" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="system-updates">System Updates</Label>
                <p className="text-sm text-gray-600">Get notified about system updates and maintenance</p>
              </div>
              <Switch id="system-updates" />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">Change Password</Button>
            <Button variant="outline">Enable Two-Factor Authentication</Button>
            <Button variant="outline">View Login History</Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription>Export and manage your inventory data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Export Products Data
              </Button>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Export Sales Data
              </Button>
            </div>
            <Separator />
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Danger Zone</h4>
              <p className="text-sm text-red-600 mb-3">These actions cannot be undone. Please be careful.</p>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage

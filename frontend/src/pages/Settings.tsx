import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Settings, UserPlus, Key } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// --- MOCK DATA ---
const users = [
  { id: 1, name: "Admin User", email: "admin@tesc.gov.zw", role: "Admin" },
  { id: 2, name: "Tino Mupezeni", email: "tino@tesc.gov.zw", role: "Developer" },
  { id: 3, name: "Jane Doe", email: "jane.doe@tesc.gov.zw", role: "Analyst" },
  { id: 4, name: "John Smith", email: "john.smith@tesc.gov.zw", role: "Viewer" },
];

// --- COMPONENT ---
export default function Setting() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-7 w-7" />
            System Settings
          </h1>
          <p className="text-muted-foreground">
            Manage system configuration, users, and integrations
          </p>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systemName">System Name</Label>
                <Input id="systemName" defaultValue="TESC Analytics Dashboard" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Current Academic Year</Label>
                <Select defaultValue="2024">
                  <SelectTrigger id="academicYear">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button>Save General Settings</Button>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* API & Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>API & Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="apiKey">System API Key</Label>
                <div className="flex gap-2">
                    <Input id="apiKey" defaultValue="**************" readOnly />
                    <Button variant="outline">Regenerate</Button>
                </div>
            </div>
            <Separator />
            <div className="space-y-2">
                <Label>ZIMSA Integration</Label>
                <div className="flex items-center gap-2">
                    <Input placeholder="ZIMSA API Endpoint" />
                    <Button>Test Connection</Button>
                </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
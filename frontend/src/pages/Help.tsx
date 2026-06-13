import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  HelpCircle, 
  BookOpen, 
  Send, 
  Navigation, 
  Search, 
  Users, 
  FileText, 
  ShieldCheck, 
  Settings, 
  Lock, 
  Upload, 
  GraduationCap 
} from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { StatsCard } from "@/components/dashboard/StatsCard";

// --- COMPONENT ---
export default function Help() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="h-6 w-6 sm:h-7 sm:h-7" />
            Help & Support
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Find answers, tutorials, and contact support
          </p>
        </div>

        {/* Quick Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                All sensitive data (National IDs, Names, DoB) is encrypted at rest using AES-256 (Fernet) to ensure compliance and privacy.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50/50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                RBAC System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Access is governed by 4 Levels: Level 1 (Full Access) down to Level 4 (Restricted Read-Only).
              </p>
            </CardContent>
          </Card>
          <Card className="bg-green-50/50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Upload className="h-4 w-4 text-green-600" />
                Bulk Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Save time by using Excel templates for bulk student and staff uploads. Templates are available on respective pages.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Overview */}
        <Card className="mx-1 border-none sm:border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Navigation className="h-5 w-5 text-blue-500" />
              Getting Around
            </CardTitle>
            <CardDescription>A quick guide to the system layout</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-blue-100 text-blue-600">
                  <Search className="h-4 w-4" />
                </div>
                <h4 className="font-semibold text-sm">Global Search</h4>
              </div>
              <p className="text-xs text-muted-foreground">Press <kbd className="px-1.5 py-0.5 rounded border bg-background font-sans">Ctrl + K</kbd> to quickly search for institutions, students, or navigation pages from anywhere.</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-green-100 text-green-600">
                  <Users className="h-4 w-4" />
                </div>
                <h4 className="font-semibold text-sm">Sidebar Navigation</h4>
              </div>
              <p className="text-xs text-muted-foreground">Use the sidebar to jump between Institutions, Students, Staff, and Reports. Your accessible pages depend on your assigned department.</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-purple-100 text-purple-600">
                  <FileText className="h-4 w-4" />
                </div>
                <h4 className="font-semibold text-sm">Dynamic Reports</h4>
              </div>
              <p className="text-xs text-muted-foreground">The Reports page allows you to build custom datasets. Select a category, add filters, and choose columns before exporting to PDF.</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Institution Management */}
          <Card className="mx-1 border-none sm:border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                Institutional Onboarding
              </CardTitle>
              <CardDescription>Registering and setting up new institutions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="reg-inst">
                  <AccordionTrigger className="text-sm">How do I register a new institution?</AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm space-y-2">
                    <p>1. Go to the <strong>Institutions</strong> page.</p>
                    <p>2. Click <strong>Register Institution</strong>.</p>
                    <p>3. Provide basic details (Name, Type, Location, Address, Capacity, Email).</p>
                    <p>4. <strong>Crucial:</strong> Upon successful registration, the system automatically creates a Level 1 Super Admin account for that institution.</p>
                    <p>5. Copy the generated credentials and share them securely with the institutional head.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="inst-setup">
                  <AccordionTrigger className="text-sm">What happens after registration?</AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm space-y-2">
                    <p>The institutional admin must then log in to their specific portal to:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Configure Faculties and Departments.</li>
                      <li>Add Academic Programs.</li>
                      <li>Onboard their staff and students.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* User & RBAC Management Section */}
          <Card className="mx-1 border-none sm:border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5 text-gray-600" />
                User & Access Control
              </CardTitle>
              <CardDescription>Understanding permissions and levels</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="rbac-levels">
                  <AccordionTrigger className="text-sm">What are the 4 Access Levels?</AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm space-y-2">
                    <p><strong>Level 1 (Super Admin):</strong> Full system access, including user management and system settings.</p>
                    <p><strong>Level 2 (Executive):</strong> High-level reporting and cross-departmental view, restricted settings.</p>
                    <p><strong>Level 3 (Operational):</strong> Daily management of student and staff records within assigned departments.</p>
                    <p><strong>Level 4 (Read-Only):</strong> View-only access to specific records and dashboards.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="add-admin-user">
                  <AccordionTrigger className="text-sm">How do I add a central admin user?</AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm space-y-2">
                    <p>1. Navigate to <strong>Settings</strong> and select the <strong>Users</strong> tab.</p>
                    <p>2. Click <strong>Add User</strong>.</p>
                    <p>3. Assign an appropriate access level (1-4). Users without an assigned institution are treated as Central/Ministry staff.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Data Upload and FAQ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Data Upload Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="bulk-students">
                  <AccordionTrigger className="text-sm text-left">How to perform Bulk Student Upload?</AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm space-y-2">
                    <p>1. Navigate to the <strong>Students</strong> page.</p>
                    <p>2. Click <strong>Upload Students</strong>.</p>
                    <p>3. Download the <strong>Excel Template</strong> provided.</p>
                    <p>4. Fill in the student details. Ensure National ID and Program codes are correct.</p>
                    <p>5. Upload the file. The system will validate all records before saving.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="bulk-staff">
                  <AccordionTrigger className="text-sm text-left">How to perform Bulk Staff Upload?</AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm space-y-2">
                    <p>Similar to students, navigate to the <strong>Staff</strong> page, download the specific staff template, and upload the completed file.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Support Form */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Contact Technical Support</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">Submit a new support ticket</p>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-xs sm:text-sm">Subject</Label>
                <Input id="subject" className="h-9 sm:h-10" placeholder="e.g., Data migration request" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs sm:text-sm">Message</Label>
                <Textarea 
                    id="message" 
                    placeholder="Please describe your issue in detail..." 
                    rows={6}
                    className="text-xs sm:text-sm"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button className="w-full sm:w-auto h-9 sm:h-10">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
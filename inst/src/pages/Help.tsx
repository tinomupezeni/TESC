import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  HelpCircle, 
  BookOpen, 
  Users, 
  Settings, 
  ShieldCheck, 
  Navigation,
  FileText,
  Search,
  Plus,
  Lock,
  Upload,
  GraduationCap,
  Building2
} from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

const HelpPage = () => {
  return (
    <div className="space-y-6">
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <HelpCircle className="h-6 w-6 sm:h-7 sm:h-7 text-primary" />
          Help & User Guide
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Learn how to navigate and manage your institution portal.
        </p>
      </div>

      {/* Quick Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-1">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Data Encryption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Student identities and sensitive records are protected with AES-256 encryption. Only authorized system processes can decrypt this data for reporting.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Access Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Your portal supports 4 Levels of access. Super Admins (Level 1) have total control, while others are restricted to their assigned departments.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4 text-green-600" />
              Bulk Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              You can import hundreds of students or staff at once using the Excel templates found on the Students and Staff pages.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started: Institutional Setup */}
      <Card className="mx-1 border-none sm:border border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Building2 className="h-5 w-5 text-primary" />
            Getting Started: Institutional Setup
          </CardTitle>
          <CardDescription>Follow these steps to configure your institution's academic structure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-background p-4 rounded-md border shadow-sm">
              <h4 className="font-bold text-sm mb-1">1. Create Faculties</h4>
              <p className="text-xs text-muted-foreground">Define your main academic divisions (e.g., Faculty of Education, Faculty of Engineering).</p>
            </div>
            <div className="bg-background p-4 rounded-md border shadow-sm">
              <h4 className="font-bold text-sm mb-1">2. Add Departments</h4>
              <p className="text-xs text-muted-foreground">Assign departments to their respective faculties. These also act as the basis for user permissions.</p>
            </div>
            <div className="bg-background p-4 rounded-md border shadow-sm">
              <h4 className="font-bold text-sm mb-1">3. Register Programs</h4>
              <p className="text-xs text-muted-foreground">Link academic programs (Degrees, Diplomas) to departments. You need these before adding students.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Overview */}
      <Card className="mx-1 border-none sm:border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Navigation className="h-5 w-5 text-blue-500" />
            Navigation Guide
          </CardTitle>
          <CardDescription>A quick guide to the portal layout</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded bg-blue-100 text-blue-600">
                <Search className="h-4 w-4" />
              </div>
              <h4 className="font-semibold text-sm">Global Search</h4>
            </div>
            <p className="text-xs text-muted-foreground">Press <kbd className="px-1.5 py-0.5 rounded border bg-background font-sans">Ctrl + K</kbd> to quickly search for students, staff, or navigation pages from anywhere.</p>
          </div>
          <div className="p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded bg-green-100 text-green-600">
                <Users className="h-4 w-4" />
              </div>
              <h4 className="font-semibold text-sm">Sidebar Navigation</h4>
            </div>
            <p className="text-xs text-muted-foreground">Use the sidebar to jump between Students, Staff, Faculties, and Reports. Your accessible pages depend on your department.</p>
          </div>
          <div className="p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded bg-purple-100 text-purple-600">
                <FileText className="h-4 w-4" />
              </div>
              <h4 className="font-semibold text-sm">Dynamic Reports</h4>
            </div>
            <p className="text-xs text-muted-foreground">The Reports page allows you to build custom datasets. Select a category, add filters, and choose columns before exporting.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Management Section */}
        <Card className="mx-1 border-none sm:border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              Management & Operations
            </CardTitle>
            <CardDescription>Managing your institution's core data</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="add-student">
                <AccordionTrigger className="text-sm">How do I add students?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm space-y-2">
                  <p><strong>Individual:</strong> Go to the Students page and click "Add Student". You must select a Program for each student.</p>
                  <p><strong>Bulk:</strong> Click "Upload Students", download the Excel template, fill it, and upload. The system will automatically link students to their programs based on the provided codes.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="add-user">
                <AccordionTrigger className="text-sm">How do I add portal users?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm space-y-2">
                  <p>1. Navigate to <strong>Users</strong> page (Level 1 only).</p>
                  <p>2. Click <strong>Add User</strong>.</p>
                  <p>3. Assign them to a <strong>Department</strong>. This determines their sidebar visibility and data access.</p>
                  <p>4. Assign an <strong>Access Level</strong> (1-4).</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="rbac-levels">
                <AccordionTrigger className="text-sm">Understanding Access Levels (1-4)</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm space-y-2">
                  <p><strong>Level 1:</strong> Full Admin. Can manage Users, Departments, and all Institutional records.</p>
                  <p><strong>Level 2:</strong> Senior Management. Access to all departments but cannot manage users.</p>
                  <p><strong>Level 3:</strong> Operational. Restricted to seeing and managing data within their assigned department.</p>
                  <p><strong>Level 4:</strong> Read-Only. Can view records within their department but cannot add or edit.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Settings & Profile Section */}
        <Card className="mx-1 border-none sm:border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Settings className="h-5 w-5 text-gray-600" />
              Account Settings
            </CardTitle>
            <CardDescription>Personalizing your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="change-password">
                <AccordionTrigger className="text-sm">How do I change my password?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm">
                  Go to the <strong>Settings</strong> page and select the <strong>Security</strong> tab. Enter your current password and then your new password twice. Passwords must be secure.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="update-profile">
                <AccordionTrigger className="text-sm">Can I update my profile details?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm">
                  Yes, in the <strong>Settings</strong> page under the <strong>Profile</strong> tab, you can update your first name, last name, and contact details. Some fields may be locked by the administrator.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="notifications">
                <AccordionTrigger className="text-sm">How do I manage notifications?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm">
                  The <strong>Notifications</strong> tab in Settings allows you to toggle email or system alerts for various events like student registration or system updates.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Frequently Asked Questions */}
      <Card className="mx-1 border-none sm:border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <BookOpen className="h-5 w-5 text-orange-500" />
            General FAQ
          </CardTitle>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm">How do I edit student details?</h4>
                <p className="text-xs text-muted-foreground mt-1">Go to the Students page, click the three dots (Actions) on a student row, and select "Edit Student".</p>
              </div>
              <div>
                <h4 className="font-medium text-sm">What is the ISEOP program?</h4>
                <p className="text-xs text-muted-foreground mt-1">ISEOP is the special enrollment support program. You can track stats and eligibility in the Special Enrollment tab.</p>
              </div>
            </div>
            <div className="space-y-4 mt-4 md:mt-0">
              <div>
                <h4 className="font-medium text-sm">How do I bulk upload data?</h4>
                <p className="text-xs text-muted-foreground mt-1">Many pages have an "Upload" button next to "Add". Download the provided Excel template, fill it in, and re-upload it.</p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Session Timeout</h4>
                <p className="text-xs text-muted-foreground mt-1">For security, sessions expire after inactivity. You will be automatically redirected to the login page.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpPage;

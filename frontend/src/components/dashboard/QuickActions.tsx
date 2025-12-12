import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileDown, Upload, BarChart, Users, Settings } from "lucide-react";

const quickActions = [
  {
    title: "Add Institution",
    description: "Register a new educational institution",
    icon: Plus,
    action: "add-institution",
    variant: "default" as const,
  },
  {
    title: "Import Data",
    description: "Upload student records or statistics",
    icon: Upload,
    action: "import-data",
    variant: "outline" as const,
  },
  {
    title: "Generate Report",
    description: "Create comprehensive analytics report",
    icon: BarChart,
    action: "generate-report",
    variant: "outline" as const,
  },
  {
    title: "Export Data",
    description: "Download data in Excel or PDF format",
    icon: FileDown,
    action: "export-data",
    variant: "outline" as const,
  },
  {
    title: "Manage Users",
    description: "Add or modify user permissions",
    icon: Users,
    action: "manage-users",
    variant: "outline" as const,
  },
  {
    title: "System Settings",
    description: "Configure system parameters",
    icon: Settings,
    action: "system-settings",
    variant: "outline" as const,
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="h-auto p-4 justify-start"
              onClick={() => console.log(`Action: ${action.action}`)}
            >
              <div className="flex items-start gap-3 w-full">
                <action.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm opacity-70 mt-1">
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
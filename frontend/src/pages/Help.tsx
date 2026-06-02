import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, BookOpen, Send } from "lucide-react";
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

        {/* Stats */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard
                title="Knowledge Base"
                value="120 Articles"
                description="Guides and tutorials"
                icon={BookOpen}
                variant="info"
            />
            <StatsCard
                title="Open Tickets"
                value="3"
                description="Awaiting response"
                icon={HelpCircle}
                variant="warning"
            />
            <StatsCard
                title="Avg. Response"
                value="4 Hours"
                description="Business days"
                icon={Send}
            />
         </div>

        {/* FAQ and Support Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FAQ Accordion */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-sm text-left">How do I add a new institution?</AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm">
                    Navigate to the 'Institutions' page and click the 'Register Institution' button. Fill out the required fields in the modal that appears.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-sm text-left">How do I generate a report?</AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm">
                    Go to the 'Reports' page. Select the 'Report Type', desired 'Institution' filter, and the 'Date Range', then click 'Generate & Download'.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-sm text-left">Can I export data to Excel?</AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm">
                    Yes. On pages like 'Students', you can use the 'Export' button. On the 'Reports' page, all generated reports are available as CSV or PDF downloads.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-sm text-left">Who do I contact for a login issue?</AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm">
                    Please use the 'Contact Support' form on this page to submit a ticket, and an administrator will assist you with password resets or login problems.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Support Form */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Contact Support</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">Submit a new support ticket</p>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-xs sm:text-sm">Subject</Label>
                <Input id="subject" className="h-9 sm:h-10" placeholder="e.g., Unable to add student" />
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
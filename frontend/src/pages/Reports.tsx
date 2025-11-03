import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { FileText, Download, Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker"; // Assuming you use react-day-picker
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils"; // You'll need this utility
import { addDays, format } from "date-fns";
import React from "react";

// --- MOCK DATA ---
const recentReports = [
  { id: "R001", name: "Full Student Enrollment Report", type: "Enrollment", date: "2024-10-28", by: "Admin" },
  { id: "R002", name: "Facility Utilization (Q3)", type: "Facilities", date: "2024-10-01", by: "Admin" },
  { id: "R003", name: "Innovation Grants Summary", type: "Innovation", date: "2024-09-15", by: "Admin" },
  { id: "R004", name: "Regional Analysis - Midlands", type: "Regional", date: "2024-09-05", by: "Admin" },
];

// --- COMPONENT ---
export default function Reports() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-7 w-7" />
            Reports
          </h1>
          <p className="text-muted-foreground">
            Generate, view, and download system reports
          </p>
        </div>

        {/* Report Generator */}
        <Card>
          <CardHeader>
            <CardTitle>Generate New Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Report Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enrollment">Enrollment Report</SelectItem>
                    <SelectItem value="facilities">Facilities Report</SelectItem>
                    <SelectItem value="innovation">Innovation Report</SelectItem>
                    <SelectItem value="financials">Financials Report</SelectItem>
                    <SelectItem value="regional">Regional Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Institution Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Institution</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Institutions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Institutions</SelectItem>
                    <SelectItem value="poly">All Polytechnics</SelectItem>
                    <SelectItem value="tc">All Teachers Colleges</SelectItem>
                    <SelectItem value="itc">All Industrial Training</SelectItem>
                    <SelectItem value="harare-poly">Harare Polytechnic</SelectItem>
                    {/* ...etc */}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline">Schedule Report</Button>
                <Button>Generate & Download</Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Generated Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Generated</TableHead>
                  <TableHead>Generated By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>{report.by}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
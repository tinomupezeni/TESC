import { useState, useEffect } from "react";
import { AddScholarshipDialog } from "@/components/scholarships/AddScholarshipDialog";
import { EditScholarshipDialog } from "@/components/scholarships/EditScholarshipDialog";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { GraduationCap, DollarSign, Calendar, Upload, Pencil, Users } from "lucide-react";
import { getScholarships, StudentScholarship } from "@/services/scholarships.services";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BulkUploadResolver } from "@/components/common/BulkUploadResolver";

export default function Scholarships() {
  const [scholarships, setScholarships] = useState<StudentScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingScholarship, setEditingScholarship] = useState<StudentScholarship | null>(null);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const data = await getScholarships();
      setScholarships(data);
    } catch (error) {
      toast.error("Failed to load scholarships");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const totalAmount = scholarships.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

  const maleCount = scholarships.filter(s => s.student_gender === "Male").length;
  const femaleCount = scholarships.filter(s => s.student_gender === "Female").length;

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Scholarships & Funding</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage student scholarships.
        </p>
      </div>

      <Card className="overflow-hidden border-none sm:border">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Scholarship Directory</CardTitle>
              <CardDescription className="text-xs sm:text-sm">View and manage all awarded scholarships</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <AddScholarshipDialog onSuccess={fetchScholarships} />
              </div>
              <div className="flex-1 sm:flex-none">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Upload className="mr-2 h-4 w-4" /> Bulk Upload
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Bulk Upload Student Scholarships</DialogTitle>
                    </DialogHeader>
                    <BulkUploadResolver moduleType="scholarships" onSuccess={fetchScholarships} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Scholarships</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scholarships.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Year</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{new Date().getFullYear()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gender Dist.</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium mt-2">
                  <span className="text-blue-500">{maleCount} M</span> / <span className="text-pink-500">{femaleCount} F</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] text-xs">Student ID</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="hidden lg:table-cell text-xs">Program</TableHead>
                  <TableHead className="text-xs">Provider</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Duration</TableHead>
                  <TableHead className="text-right text-xs">Year</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton columns={6} rows={5} />
                ) : scholarships.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">No scholarships found.</TableCell>
                  </TableRow>
                ) : (
                  scholarships.map((s) => (
                    <TableRow 
                      key={s.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setEditingScholarship(s)}
                    >
                      <TableCell className="font-medium text-[10px] sm:text-xs">{s.student_id_number}</TableCell>
                      <TableCell className="text-[10px] sm:text-sm truncate max-w-[120px] sm:max-w-none">{s.student_name}</TableCell>
                      <TableCell className="hidden lg:table-cell text-xs">{s.program_name}</TableCell>
                      <TableCell className="text-[10px] sm:text-xs">{s.provider_name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-[10px] sm:text-xs">${Number(s.amount).toLocaleString()}</TableCell>
                      <TableCell className="text-[10px] sm:text-xs">{s.duration || 'N/A'}</TableCell>
                      <TableCell className="text-right text-[10px] sm:text-xs">{s.year_awarded}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingScholarship(s);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingScholarship && (
        <EditScholarshipDialog
          scholarship={editingScholarship}
          open={!!editingScholarship}
          onOpenChange={(open) => {
            if (!open) setEditingScholarship(null);
          }}
          onSuccess={fetchScholarships}
        />
      )}
    </div>
  );
}
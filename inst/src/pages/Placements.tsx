import { useState, useEffect } from "react";
import { AddPlacementDialog } from "@/components/placements/AddPlacementDialog";
import { BulkUploadResolver } from "@/components/common/BulkUploadResolver";
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
  CardDescription // Added CardDescription
} from "@/components/ui/card";
import { Briefcase, Building2, TrendingUp, Upload } from "lucide-react";
import { getPlacements, IndustryPlacement } from "@/services/placements.services";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
export default function Placements() {
  const [placements, setPlacements] = useState<IndustryPlacement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlacements = async () => {
    setLoading(true);
    try {
      const data = await getPlacements();
      setPlacements(data);
    } catch (error) {
      toast.error("Failed to load placements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, []);

  const totalAttachments = placements.filter(p => p.placement_type === 'Attachment').length;
  const totalApprenticeships = placements.filter(p => p.placement_type === 'Apprenticeship').length;

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Industry Placements</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage student attachments and apprenticeships.
        </p>
      </div>

      <Card className="overflow-hidden border-none sm:border">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Placements Directory</CardTitle>
              <CardDescription className="text-xs sm:text-sm">View and manage all registered placements</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Bulk Upload</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader><DialogTitle>Bulk Upload Placements</DialogTitle></DialogHeader>
                    <BulkUploadResolver moduleType="placements" onSuccess={fetchPlacements} />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex-1 sm:flex-none">
                <AddPlacementDialog onSuccess={fetchPlacements} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Placements</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{placements.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attachments</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAttachments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Apprenticeships</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalApprenticeships}</div>
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
                  <TableHead className="text-xs">Company</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs">Type</TableHead>
                  <TableHead className="hidden md:table-cell text-xs">Start Date</TableHead>
                  <TableHead className="text-right text-xs">End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">Loading...</TableCell>
                  </TableRow>
                ) : placements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs">No placements found.</TableCell>
                  </TableRow>
                ) : (
                  placements.map((placement) => (
                    <TableRow key={placement.id}>
                      <TableCell className="font-medium text-[10px] sm:text-xs">{placement.student_id_number}</TableCell>
                      <TableCell className="text-[10px] sm:text-sm truncate max-w-[120px] sm:max-w-none">{placement.student_name}</TableCell>
                      <TableCell className="hidden lg:table-cell text-xs">{placement.program_name}</TableCell>
                      <TableCell className="text-[10px] sm:text-xs">{placement.company_name}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={placement.placement_type === 'Attachment' ? 'default' : 'secondary'} className="text-[10px] sm:text-xs px-1.5 py-0.5 whitespace-nowrap">
                          {placement.placement_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-[10px] sm:text-xs">{placement.start_date}</TableCell>
                      <TableCell className="text-right text-[10px] sm:text-xs">{placement.end_date || 'Ongoing'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>


  );
}
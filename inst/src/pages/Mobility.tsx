import { useState, useEffect } from "react";
import { AddMobilityDialog } from "@/components/mobility/AddMobilityDialog";
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
import { Globe, PlaneTakeoff, PlaneLanding, Upload } from "lucide-react";
import { getMobility, InternationalMobility } from "@/services/mobility.services";
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
import { BulkUploadResolver } from "@/components/common/BulkUploadResolver";

export default function Mobility() {
  const [mobility, setMobility] = useState<InternationalMobility[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMobility = async () => {
    setLoading(true);
    try {
      const data = await getMobility();
      setMobility(data);
    } catch (error) {
      toast.error("Failed to load mobility records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMobility();
  }, []);

  const inboundCount = mobility.filter(m => m.direction === 'Inbound').length;
  const outboundCount = mobility.filter(m => m.direction === 'Outbound').length;

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">International Mobility</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage inbound and outbound student records.
        </p>
      </div>

      <Card className="overflow-hidden border-none sm:border">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Mobility Directory</CardTitle>
              <CardDescription className="text-xs sm:text-sm">View and manage all international mobility records</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <AddMobilityDialog onSuccess={fetchMobility} />
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
                      <DialogTitle>Bulk Upload International Mobility</DialogTitle>
                    </DialogHeader>
                    <BulkUploadResolver moduleType="mobility" onSuccess={fetchMobility} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mobility.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inbound</CardTitle>
                <PlaneLanding className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inboundCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outbound</CardTitle>
                <PlaneTakeoff className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{outboundCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] text-xs">Student ID</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs">Direction</TableHead>
                  <TableHead className="text-xs">Country</TableHead>
                  <TableHead className="hidden lg:table-cell text-xs">Institution</TableHead>
                  <TableHead className="text-right text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
                  </TableRow>
                ) : mobility.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">No records found.</TableCell>
                  </TableRow>
                ) : (
                  mobility.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium text-[10px] sm:text-xs">{m.student_id_number}</TableCell>
                      <TableCell className="text-[10px] sm:text-sm truncate max-w-[120px] sm:max-w-none">{m.student_name}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={m.direction === 'Inbound' ? 'default' : 'secondary'} className="text-[10px] sm:text-xs px-1.5 py-0.5 whitespace-nowrap">
                          {m.direction}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] sm:text-xs">{m.country}</TableCell>
                      <TableCell className="hidden lg:table-cell text-[10px] sm:text-xs">{m.foreign_institution || 'N/A'}</TableCell>
                      <TableCell className="text-right text-[10px] sm:text-xs">{m.status || 'Active'}</TableCell>
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
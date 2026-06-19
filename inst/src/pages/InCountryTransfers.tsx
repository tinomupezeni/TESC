import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

// Components & Services
import { BulkUploadResolver } from "@/components/common/BulkUploadResolver";
import { InCountryTransfer, InCountryTransfersAPIResponse, getInCountryTransfers } from "../services/reports.services";


const InCountryTransfers = () => {
  const { user } = useAuth();
  
  const [transfers, setTransfers] = useState<InCountryTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTransfers = useCallback(async () => {
    if (!user?.institution?.id) return;
    try {
      setLoading(true);
      const apiResponse: InCountryTransfersAPIResponse = await getInCountryTransfers(
        user.institution.id,
        searchQuery
      );
      setTransfers(apiResponse.results);
    } catch (error) {
      console.error("Failed to fetch transfers", error);
      toast.error("Failed to load transfers");
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  }, [user, searchQuery]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          In-Country Transfers
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage student transfers between institutions for{" "}
          <span className="font-semibold text-primary">{user?.institution?.name}</span>
        </p>
      </div>

      {/* Main Content Area */}
      <Card className="overflow-hidden border-none sm:border">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Transfers Directory</CardTitle>
              <CardDescription className="text-xs sm:text-sm">List of student transfers between institutions</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Bulk Upload</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader><DialogTitle>Bulk Upload In-Country Transfers</DialogTitle></DialogHeader>
                    <BulkUploadResolver moduleType="in_country_transfers" onSuccess={fetchTransfers} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student or institution..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 sm:h-10"
              />
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] text-xs">Student ID</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs">From</TableHead>
                  <TableHead className="hidden md:table-cell text-xs">To</TableHead>
                  <TableHead className="text-right text-xs">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading transfers...
                    </TableCell>
                  </TableRow>
                ) : transfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                      No transfers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-medium text-[10px] sm:text-xs">{transfer.student_id_number}</TableCell>
                      <TableCell className="text-[10px] sm:text-sm truncate max-w-[120px] sm:max-w-none">{transfer.student_name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">{transfer.from_institution}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{transfer.to_institution}</TableCell>
                      <TableCell className="text-right text-[10px] sm:text-xs">{transfer.transfer_date}</TableCell>
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
};

export default InCountryTransfers;
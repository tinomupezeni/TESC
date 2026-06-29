import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Handshake, Calendar, Search, Trash2, Loader2 } from "lucide-react";
import { PartnershipFormDialog } from "./Partnership";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { deletePartnership } from "@/services/innovation.services";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PartnershipManagerProps {
  partnerships: any[];
  onRefresh?: () => void;
}

const PartnershipManager = ({ partnerships = [], onRefresh }: PartnershipManagerProps) => {
  const [search, setSearch] = useState("");
  const [partnershipToDelete, setPartnershipToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!partnershipToDelete) return;
    setIsDeleting(true);
    try {
      await deletePartnership(partnershipToDelete.id);
      toast.success("Partnership deleted successfully");
      setPartnershipToDelete(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error("Failed to delete partnership");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPartnerships = partnerships.filter(p => 
    p.partner_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.focus_area?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="border-none shadow-none bg-transparent sm:bg-card">
      <CardHeader className="px-0 sm:px-6 pt-0 sm:pt-6 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Handshake className="h-5 w-5 text-primary" /> Strategic Partnerships
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Manage MOUs and industry collaborations.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-[250px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search partners..." 
                  className="pl-10 h-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-auto">
                <PartnershipFormDialog onSuccess={onRefresh} />
              </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 sm:px-6 pt-0">
        <div className="rounded-md border overflow-x-auto bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 uppercase">
                <TableHead className="text-xs">Partner Organization</TableHead>
                <TableHead className="hidden sm:table-cell text-xs">Focus Area</TableHead>
                <TableHead className="hidden md:table-cell text-xs">Agreement Date</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartnerships.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-xs uppercase">
                    No partnerships found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPartnerships.map((partner) => (
                  <TableRow key={partner.id} className="hover:bg-muted/5 uppercase">
                    <TableCell className="font-medium text-[10px] sm:text-xs">
                      <div>{partner.partner_name}</div>
                      <div className="sm:hidden text-[9px] text-muted-foreground mt-0.5">{partner.focus_area}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="font-normal text-[10px] sm:text-xs uppercase">
                        {partner.focus_area}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-[10px] sm:text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(partner.agreement_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={partner.status === 'Active' ? 'default' : 'secondary'}
                        className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 whitespace-nowrap uppercase ${partner.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200' : ''}`}
                      >
                        {partner.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-1">
                          <PartnershipFormDialog 
                            partnership={partner} 
                            onSuccess={onRefresh} 
                            trigger={
                              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                                <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                              </Button>
                            }
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setPartnershipToDelete(partner)}
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!partnershipToDelete} onOpenChange={(open) => !open && setPartnershipToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="uppercase">Are you absolutely sure?</DialogTitle>
            <DialogDescription className="uppercase">
              This action cannot be undone. This will permanently delete the partnership with{" "}
              <span className="font-semibold text-foreground">{partnershipToDelete?.partner_name?.toUpperCase()}</span> and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPartnershipToDelete(null)} disabled={isDeleting} className="uppercase">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="uppercase">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Partnership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PartnershipManager;
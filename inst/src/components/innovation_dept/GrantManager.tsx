import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Banknote, Calendar, Search, ArrowUpRight, Trash2, Loader2 } from "lucide-react";
import { GrantFormDialog } from "./GrantFormDialog";
import { deleteGrant } from "@/services/innovation.services";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GrantManagerProps {
  grants: any[];
  onRefresh?: () => void;
}

const GrantManager = ({ grants = [], onRefresh }: GrantManagerProps) => {
  const [search, setSearch] = useState("");
  const [grantToDelete, setGrantToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!grantToDelete) return;
    setIsDeleting(true);
    try {
      await deleteGrant(grantToDelete.id);
      toast.success("Grant deleted successfully");
      setGrantToDelete(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error("Failed to delete grant");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredGrants = grants.filter(g => 
    g.donor.toLowerCase().includes(search.toLowerCase()) ||
    (g.project_name && g.project_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Card className="border-none shadow-none bg-transparent sm:bg-card">
      <CardHeader className="px-0 sm:px-6 pt-0 sm:pt-6 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2 uppercase">
              <Banknote className="h-5 w-5 text-primary" /> Research Grants
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm uppercase">
              Track funding received for specific projects.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-[250px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search donor or project..." 
                  className="pl-10 h-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <div className="w-full sm:w-auto">
                <GrantFormDialog onSuccess={onRefresh} />
             </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 sm:px-6 pt-0">
        <div className="rounded-md border overflow-x-auto bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 uppercase">
                <TableHead className="text-xs">Donor / Organization</TableHead>
                <TableHead className="hidden sm:table-cell text-xs">Linked Project</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="hidden md:table-cell text-xs">Date</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGrants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-xs uppercase">
                    No grants recorded.
                  </TableCell>
                </TableRow>
              ) : (
                filteredGrants.map((grant) => (
                  <TableRow key={grant.id} className="hover:bg-muted/5 uppercase">
                    <TableCell className="font-medium text-[10px] sm:text-xs">
                      <div>{grant.donor}</div>
                      <div className="sm:hidden text-[9px] text-muted-foreground mt-0.5 truncate max-w-[150px]">{grant.project_name || "Unlinked"}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {grant.project_name ? (
                        <div className="flex items-center gap-1 text-primary text-[10px] sm:text-xs">
                             <ArrowUpRight className="h-3 w-3 shrink-0" />
                             <span className="truncate max-w-[150px]">{grant.project_name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-[10px]">Unlinked</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono font-medium text-emerald-600 text-[10px] sm:text-xs whitespace-nowrap">
                      ${parseFloat(grant.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-[10px] sm:text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(grant.date_awarded).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-1">
                          <GrantFormDialog 
                            grant={grant} 
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
                            onClick={() => setGrantToDelete(grant)}
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
      <Dialog open={!!grantToDelete} onOpenChange={(open) => !open && setGrantToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="uppercase">Are you absolutely sure?</DialogTitle>
            <DialogDescription className="uppercase">
              This action cannot be undone. This will permanently delete the research grant from{" "}
              <span className="font-semibold text-foreground">{grantToDelete?.donor?.toUpperCase()}</span> and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setGrantToDelete(null)} disabled={isDeleting} className="uppercase">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="uppercase">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Grant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default GrantManager;
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  ExternalLink,
  Search,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllInstitutions,
  deleteInstitution,
} from "@/services/institution.service";
import { Institution } from "@/lib/types/academic.types";
import { Skeleton } from "@/components/ui/skeleton";
import RegisterInst from "@/modules/institutions/RegisterInst";
import { toast } from "sonner";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator, faBridge, faUsers } from '@fortawesome/free-solid-svg-icons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Helper to map institution type to color palette
const getInstitutionTheme = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('polytechnic')) 
    return { bg: "bg-[#0000FF]/5", badge: "bg-[#0000FF] text-white" }; // Royal/Blue
  if (t.includes('teachers college')) 
    return { bg: "bg-[#4682B4]/5", badge: "bg-[#4682B4] text-white" }; // Steel Blue
  if (t.includes('industrial')) 
    return { bg: "bg-[#6495ED]/5", badge: "bg-[#6495ED] text-white" };
  return { bg: "bg-slate-100", badge: "bg-slate-500 text-white" };
};

const InstitutionCardSkeleton = () => (
  <Card className="shadow-sm"><CardContent className="p-6"><Skeleton className="h-6 w-48 mb-2" /><Skeleton className="h-4 w-64" /></CardContent></Card>
);

export default function Institutions() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [registerInst, setRegisterInst] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: institutions, isLoading, refetch } = useQuery({
    queryKey: ["institutions"],
    queryFn: getAllInstitutions,
  });

  const filteredInstitutions = useMemo(() => {
    if (!institutions) return [];
    if (!searchQuery.trim()) return institutions;
    const query = searchQuery.toLowerCase();
    return institutions.filter((i: Institution) => 
      i.name.toLowerCase().includes(query) || i.location.toLowerCase().includes(query) || i.type.toLowerCase().includes(query)
    );
  }, [institutions, searchQuery]);

  const deleteMutation = useMutation({
    mutationFn: deleteInstitution,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["institutions"] }); toast.success("Institution deleted"); },
    onError: () => toast.error("Failed to delete")
  });

  const handleDelete = (id: number) => setDeleteId(id);
  const confirmDelete = () => { if (deleteId) { deleteMutation.mutate(deleteId); setDeleteId(null); } };
  const handleModalClose = (isOpen: boolean) => { if (!isOpen) { setRegisterInst(false); setEditingInstitution(null); refetch(); } };

const stats = useMemo(() => {
    if (!institutions) return { total: 0, active: 0, students: 0, staff: 0 };
    return {
      total: institutions.length,
      active: institutions.filter((i: Institution) => i.status === "Active").length,
      students: institutions.reduce((acc: number, i: Institution) => acc + (i.student_count || 0), 0),
      staff: institutions.reduce((acc: number, i: Institution) => acc + (i.staff_count || 0), 0)
    };
  }, [institutions]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">EDUCATIONAL INSTITUTIONS</h1>
          </div>
          <Button onClick={() => setRegisterInst(true)}><Plus className="mr-2 h-4 w-4" /> Register Institution</Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div><p className="text-xs uppercase text-muted-foreground">TOTAL INSTITUTIONS</p><h3 className="text-xl font-bold">{stats.total}</h3></div></CardContent></Card>
          <Card><CardContent className="p-4"><div><p className="text-xs uppercase text-muted-foreground">ACTIVE INSTITUTIONS</p><h3 className="text-xl font-bold">{stats.active}</h3></div></CardContent></Card>
          <Card><CardContent className="p-4"><div><p className="text-xs uppercase text-muted-foreground">TOTAL STUDENTS</p><h3 className="text-xl font-bold">{stats.students.toLocaleString()}</h3></div></CardContent></Card>
          <Card><CardContent className="p-4"><div><p className="text-xs uppercase text-muted-foreground">TOTAL STAFF</p><h3 className="text-xl font-bold">{stats.staff.toLocaleString()}</h3></div></CardContent></Card>
        </div>

        {/* Table */}
        <div className="w-full rounded-xl border border-border/50 bg-white shadow-sm overflow-hidden">
          <Table className="w-full">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Institution</TableHead><TableHead>Type</TableHead><TableHead>Location</TableHead>
                <TableHead className="text-center">Students</TableHead><TableHead className="text-center">Staff</TableHead>
                <TableHead className="text-center">Programs</TableHead><TableHead className="text-center">Users</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstitutions.map((institution: Institution) => {
                const theme = getInstitutionTheme(institution.type);
                return (
                  <TableRow 
                    key={institution.id} 
                    className={`${theme.bg} hover:bg-muted/50 transition-colors cursor-pointer`}
                    onClick={() => navigate(`/institutions/${institution.id}`)}
                  >
                    <TableCell className="font-bold">{institution.name}</TableCell>
                    <TableCell>
                      <Badge className={`border-none ${theme.badge}`}>{institution.type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{institution.location}</TableCell>
                    <TableCell className="text-center">{institution.student_count.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{institution.staff_count.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{institution.program_count || 0}</TableCell>
                    <TableCell className="text-center font-bold text-blue-700">{institution.user_count || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => setEditingInstitution(institution)}><ExternalLink className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(institution.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <RegisterInst open={registerInst || !!editingInstitution} onOpenChange={handleModalClose} institutionToEdit={editingInstitution} />

      <AlertDialog open={!!deleteId} onOpenChange={(isOpen) => !isOpen && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {institutions?.find((i: Institution) => i.id === deleteId)?.name || "Institution"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <strong className="text-slate-800">{institutions?.find((i: Institution) => i.id === deleteId)?.name}</strong>{" "}
              and all its associated data (students, staff, facilities, etc).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </DashboardLayout>
  );
}
import React, { useEffect, useState } from "react";
import iseopService, { IseopProgram } from "@/services/iseop.services";
import { IseopProgramFormDialog } from "@/components/innovation_dept/IseopProgramFormDialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
// Assuming you are using a table component, import it here
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; 

interface IseopManagerProps {
  onRefresh?: () => void;
}

const IseopManager = ({ onRefresh }: IseopManagerProps) => {
  const [programs, setPrograms] = useState<IseopProgram[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      // 1. Service returns IseopProgram[]
      const data = await iseopService.getPrograms();
      console.log("Fetched Programs Array:", data); 
      
      // 2. Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setPrograms(data);
      } else {
        console.error("Expected array, got:", data);
        setPrograms([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load programs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this program?")) return;
    try {
      await iseopService.deleteProgram(id);
      toast.success("Program deleted!");
      fetchPrograms();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete program.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold">ISEOP Programs</h2>
        <div className="w-full sm:w-auto">
          <IseopProgramFormDialog onSuccess={fetchPrograms} trigger={<Button className="w-full sm:w-auto h-9 text-xs sm:text-sm">Add Program</Button>} />
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-muted-foreground text-sm">Loading programs...</div>
      ) : (
        <div className="border rounded-lg bg-white overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-center text-xs">Cap.</TableHead>
                <TableHead className="text-center text-xs">Occ.</TableHead>
                <TableHead className="hidden sm:table-cell text-xs">Status</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.length > 0 ? (
                programs.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium text-[10px] sm:text-xs max-w-[150px] truncate">{program.name}</TableCell>
                    <TableCell className="text-center text-[10px] sm:text-xs">{program.capacity}</TableCell>
                    <TableCell className="text-center text-[10px] sm:text-xs">{program.occupied}</TableCell>
                    <TableCell className="hidden sm:table-cell text-[10px] sm:text-xs">
                       <span className={`px-2 py-0.5 rounded-full text-[10px] ${program.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                         {program.status}
                       </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <IseopProgramFormDialog
                          program={program}
                          onSuccess={fetchPrograms}
                          trigger={<Button size="sm" variant="ghost" className="h-7 w-7 p-0 sm:h-8 sm:px-2 sm:w-auto text-[10px]">Edit</Button>}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 sm:h-8 sm:px-2 sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 text-[10px]"
                          onClick={() => handleDelete(program.id)}
                        >
                          <span className="hidden sm:inline">Delete</span>
                          <span className="sm:hidden">×</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10 text-xs sm:text-sm">
                    No programs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default IseopManager;
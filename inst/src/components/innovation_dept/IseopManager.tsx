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
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">ISEOP Programs</h2>
        <IseopProgramFormDialog onSuccess={fetchPrograms} trigger={<Button>Add Program</Button>} />
      </div>

      {loading ? (
        <p>Loading programs...</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Occupied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.length > 0 ? (
                programs.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">{program.name}</TableCell>
                    <TableCell>{program.capacity}</TableCell>
                    <TableCell>{program.occupied}</TableCell>
                    <TableCell>{program.status}</TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      <IseopProgramFormDialog
                        program={program}
                        onSuccess={fetchPrograms}
                        trigger={<Button size="sm" variant="outline">Edit</Button>}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(program.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
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
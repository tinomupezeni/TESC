import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function AddProgramDialog() {
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Program added successfully!");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Program
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Program</DialogTitle>
          <DialogDescription>Create a new academic program</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="programName">Program Name</Label>
            <Input id="programName" placeholder="e.g., Bachelor of Science in Computer Science" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="programCode">Program Code</Label>
              <Input id="programCode" placeholder="BSCS" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty</Label>
              <Select required>
                <SelectTrigger id="faculty">
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="sciences">Sciences</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="it">Information Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Years)</Label>
              <Input id="duration" type="number" placeholder="4" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select required>
                <SelectTrigger id="level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="bachelors">Bachelors</SelectItem>
                  <SelectItem value="masters">Masters</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Program Description</Label>
            <Textarea id="description" placeholder="Brief description of the program" rows={3} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coordinator">Program Coordinator</Label>
              <Input id="coordinator" placeholder="Dr. Name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Student Capacity</Label>
              <Input id="capacity" type="number" placeholder="100" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="modules">Core Modules (comma-separated)</Label>
            <Textarea 
              id="modules" 
              placeholder="e.g., Programming Fundamentals, Data Structures, Algorithms" 
              rows={3} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requirements">Entry Requirements</Label>
            <Textarea 
              id="requirements" 
              placeholder="e.g., 5 O-Levels including Maths and English" 
              rows={2} 
              required 
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Program</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

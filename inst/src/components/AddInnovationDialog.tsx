import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createInnovation, CreateInnovationData } from "@/services/innovation.services";
import { useAuth } from "@/context/AuthContext";

interface AddInnovationDialogProps {
  onInnovationAdded?: () => void;
}

function AddInnovationDialog({ onInnovationAdded }: AddInnovationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Safely extract institution ID
  // @ts-ignore
  const institutionId = user?.institution?.id || user?.institution_id;

  const [formData, setFormData] = useState<Partial<CreateInnovationData>>({
    institution: institutionId,
    category: '',
    department: '',
    stage: '',
    team_size: 1,
    timeline_months: 6
  });

  // Update formData when user loads
  useEffect(() => {
    if (institutionId) {
      setFormData(prev => ({ ...prev, institution: institutionId }));
    }
  }, [institutionId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    // Handle number fields
    if (id === 'team_size' || id === 'timeline_months') {
        setFormData(prev => ({ ...prev, [id]: parseInt(value) || 0 }));
    } else {
        setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSelectChange = (field: keyof CreateInnovationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!institutionId) {
        toast.error("Institution ID missing. Please log in again.");
        setIsLoading(false);
        return;
      }

      // Basic validation
      if (!formData.title || !formData.category || !formData.team_name || !formData.problem_statement) {
        toast.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      const payload = {
        ...formData,
        institution: institutionId
      } as CreateInnovationData;

      await createInnovation(payload);
      
      toast.success("Innovation added successfully!");
      setOpen(false);
      
      // Reset form
      setFormData({
        institution: institutionId,
        category: '',
        department: '',
        stage: '',
        team_size: 1,
        timeline_months: 6,
        title: '',
        team_name: '',
        problem_statement: '',
        proposed_solution: ''
      });

      if (onInnovationAdded) onInnovationAdded();

    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.detail || "Failed to create innovation.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Innovation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Innovation</DialogTitle>
          <DialogDescription>
            Register a new innovation project
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Innovation Title *</Label>
              <Input 
                id="title" 
                placeholder="e.g., Smart Parking System" 
                required 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(val) => handleSelectChange('category', val)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agritech">Agriculture Tech</SelectItem>
                  <SelectItem value="edtech">EdTech</SelectItem>
                  <SelectItem value="healthtech">HealthTech</SelectItem>
                  <SelectItem value="fintech">FinTech</SelectItem>
                  <SelectItem value="greentech">Green Energy</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team_name">Team Name *</Label>
              <Input 
                id="team_name" 
                placeholder="Innovation team name" 
                required 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input 
                id="department" 
                placeholder="e.g. Engineering" 
                required 
                onChange={handleInputChange} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="problem_statement">Problem Statement *</Label>
            <Textarea
              id="problem_statement"
              placeholder="What problem does this innovation solve?"
              rows={3}
              required
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="proposed_solution">Proposed Solution *</Label>
            <Textarea
              id="proposed_solution"
              placeholder="Describe your innovative solution"
              rows={3}
              required
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team_size">Team Members</Label>
              <Input 
                id="team_size" 
                type="number" 
                min={1} 
                placeholder="5" 
                required 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeline_months">Timeline (months)</Label>
              <Input 
                id="timeline_months" 
                type="number" 
                min={1} 
                placeholder="12" 
                required 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Initial Stage</Label>
              <Select onValueChange={(val) => handleSelectChange('stage', val)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="incubation">Incubation</SelectItem>
                  <SelectItem value="prototype">Prototyping</SelectItem>
                  <SelectItem value="market">Market Ready</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Innovation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddInnovationDialog;
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  createProject, 
  updateProject, 
  getHubs 
} from "@/services/innovation.services"; 

// --- 1. PROJECT FORM (Handles Create & Edit) ---
interface ProjectFormProps {
  project?: any; // If provided, we are in EDIT mode
  trigger?: React.ReactNode; // Custom trigger button
  onSuccess?: () => void;
}

export const ProjectFormDialog = ({ project, trigger, onSuccess }: ProjectFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hubs, setHubs] = useState<any[]>([]);
  const { user } = useAuth();
  
  // @ts-ignore
  const institutionId = user?.institution?.id || user?.institution_id;
  const isEditing = !!project;

  // Initial state matching the structure expected by components
  const initialData = {
    institution: institutionId,
    hub: null,
    name: '', 
    team_name: '', 
    sector: '', 
    location_category: 'Urban',
    stage: 'ideation', 
    problem_statement: '', 
    proposed_solution: '',
    revenue_generated: 0, 
    funding_acquired: 0, 
    jobs_created: 0,
    // --- IP FIELDS (flattened or nested depending on API) ---
    ip_type: '',
    filing_route: '',
    date_filed: '',
  };

  const [formData, setFormData] = useState(initialData);

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      // 1. Fetch Hubs for the dropdown
      if (institutionId) {
        getHubs({ institution_id: institutionId }).then(setHubs).catch(console.error);
      }

      // 2. If Editing, populate form
      if (project) {
        setFormData({
          institution: project.institution,
          hub: project.hub?.id || project.hub || null, 
          name: project.name,
          team_name: project.team_name,
          sector: project.sector,
          location_category: project.location_category || 'Urban',
          stage: project.stage,
          problem_statement: project.problem_statement,
          proposed_solution: project.proposed_solution,
          revenue_generated: project.revenue_generated,
          funding_acquired: project.funding_acquired,
          jobs_created: project.jobs_created,
          // --- Populate IP data ---
          ip_type: project.ip_type || '',
          filing_route: project.filing_route || '',
          date_filed: project.date_filed || '',
        });
      } else {
        setFormData({ ...initialData, institution: institutionId });
      }
    }
  }, [open, project, institutionId]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- Check if stage is 'ip_registration' ---
  const showPatentFields = formData.stage === 'ip_registration';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- VALIDATION FOR IP FIELDS ---
    if (showPatentFields) {
      if (!formData.ip_type || !formData.filing_route || !formData.date_filed) {
        toast.error("Please fill in all IP Registration Details (Type, Route, and Date)");
        return;
      }
    }

    setLoading(true);
    
    // Structure payload 
    const payload = {
        ...formData,
        // Send IP fields directly on root or nested depending on backend
        ip_type: showPatentFields ? formData.ip_type : null,
        filing_route: showPatentFields ? formData.filing_route : null,
        date_filed: showPatentFields ? formData.date_filed : null,
    };

    try {
      if (isEditing) {
        await updateProject(project.id, payload);
        toast.success("Project updated successfully");
      } else {
        await createProject({ ...payload, institution: institutionId });
        toast.success("Project created successfully");
      }
      
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(isEditing ? "Failed to update project" : "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button>
            <Plus className="mr-2 h-4 w-4"/> Add Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Project Details" : "New Innovation Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* Row 1: Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project Name *</Label>
              <Input required value={formData.name} onChange={e => handleChange('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Team Name</Label>
              <Input value={formData.team_name} onChange={e => handleChange('team_name', e.target.value)} />
            </div>
          </div>

          {/* Row 2: Classification */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Sector *</Label>
              <Select value={formData.sector} onValueChange={val => handleChange('sector', val)}>
                <SelectTrigger><SelectValue placeholder="Select Sector" /></SelectTrigger>
                <SelectContent>
                  {/* --- UPDATED SECTOR KEYS --- */}
                  <SelectItem value="agritech">Agriculture / AgriTech</SelectItem>
                  <SelectItem value="edtech">Education / EdTech</SelectItem>
                  <SelectItem value="healthtech">Health / BioTech</SelectItem>
                  <SelectItem value="fintech">FinTech</SelectItem>
                  <SelectItem value="mining">Mining & Engineering</SelectItem>
                  <SelectItem value="energy">Green Energy</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select value={formData.stage} onValueChange={val => handleChange('stage', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ideation">Ideation</SelectItem>
                  <SelectItem value="prototype">Prototyping</SelectItem>
                  <SelectItem value="incubation">Incubation</SelectItem>
                  <SelectItem value="ip_registration">IP Registration</SelectItem>
                  <SelectItem value="commercialisation">Commercialisation</SelectItem>
                  <SelectItem value="industrial">Industrialised</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assigned Hub</Label>
              <Select 
                value={formData.hub ? String(formData.hub) : "none"} 
                onValueChange={val => handleChange('hub', val === "none" ? null : parseInt(val))}
              >
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- No Hub Assigned --</SelectItem>
                  {hubs.map((h) => (
                    <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* --- CONDITIONAL IP FIELDS --- */}
          {showPatentFields && (
            <Card className="border-dashed bg-green-50/50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-900">IP Registration Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>IP Type *</Label>
                  <Select value={formData.ip_type} onValueChange={val => handleChange('ip_type', val)}>
                    <SelectTrigger><SelectValue placeholder="Select IP Type" /></SelectTrigger>
                    <SelectContent>
                      {/* --- UPDATED IP_TYPE KEYS --- */}
                      <SelectItem value="copyright">Copyright and Neighbouring Rights</SelectItem>
                      <SelectItem value="industrial_design">Industrial Designs</SelectItem>
                      <SelectItem value="ic_layout">Integrated Circuit Lay-Out Designs</SelectItem>
                      <SelectItem value="geographical">Geographical Indications</SelectItem>
                      <SelectItem value="patents">Patents</SelectItem>
                      <SelectItem value="plant_breeders">Plant Breeders Rights</SelectItem>
                      <SelectItem value="trademarks">Trade Marks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Filing Route *</Label>
                  <Select value={formData.filing_route} onValueChange={val => handleChange('filing_route', val)}>
                    <SelectTrigger><SelectValue placeholder="Select Route" /></SelectTrigger>
                    <SelectContent>
                      {/* --- UPDATED FILING_ROUTES KEYS --- */}
                      <SelectItem value="national">National</SelectItem>
                      <SelectItem value="regional">Regional</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Filed *</Label>
                  <Input type="date" value={formData.date_filed} onChange={e => handleChange('date_filed', e.target.value)} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional info */}
          <div className="space-y-2">
            <Label>Problem Statement</Label>
            <Textarea value={formData.problem_statement} onChange={e => handleChange('problem_statement', e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Revenue ($)</Label>
              <Input type="number" value={formData.revenue_generated} onChange={e => handleChange('revenue_generated', parseFloat(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Funding ($)</Label>
              <Input type="number" value={formData.funding_acquired} onChange={e => handleChange('funding_acquired', parseFloat(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Jobs Created</Label>
              <Input type="number" value={formData.jobs_created} onChange={e => handleChange('jobs_created', parseInt(e.target.value))} />
            </div>
          </div>
          
          <Button type="submit" className="mt-4" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            {isEditing ? "Update Project" : "Save Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
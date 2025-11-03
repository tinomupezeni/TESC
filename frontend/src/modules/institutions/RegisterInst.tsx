import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createInstitution,
  updateInstitution, // <-- Import update service
} from "@/services/institution.service";
import { getAllFacilities } from "@/services/academic.service";
import {
  InstitutionWriteData,
  Facility,
  Institution, // <-- Import full Institution type
} from "@/lib/types/academic.types";
import { Checkbox } from "@/components/ui/checkbox";

interface RegisterInstProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionToEdit: Institution | null; // <-- Prop to receive edit data
}

// --- Constants from your backend model ---
const INSTITUTION_TYPES: InstitutionWriteData["type"][] = [
  "Polytechnic",
  "Teachers College",
  "Industrial Training",
  "Other",
];
const INSTITUTION_STATUSES: InstitutionWriteData["status"][] = [
  "Active",
  "Renovation",
  "Closed",
];

const initialFormData: InstitutionWriteData = {
  name: "",
  type: "Polytechnic",
  location: "",
  address: "",
  capacity: 0,
  staff: 0,
  status: "Active",
  established: new Date().getFullYear(),
  facility_ids: [],
};

/**
 * Modal component for registering AND editing an institution.
 */
export default function RegisterInst({
  open,
  onOpenChange,
  institutionToEdit,
}: RegisterInstProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<InstitutionWriteData>(initialFormData);
  const [selectedFacilities, setSelectedFacilities] = useState(new Set<number>());
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});

  const isEditMode = !!institutionToEdit;

  // --- Data Fetching ---
  const { data: allFacilities, isLoading: isLoadingFacilities } = useQuery({
    queryKey: ["facilities"],
    queryFn: getAllFacilities,
    enabled: open, // Only fetch when modal is open
  });

  // --- Populate form on edit ---
  useEffect(() => {
    if (institutionToEdit && open) {
      // Set form data from the institution to edit
      setFormData({
        name: institutionToEdit.name,
        type: institutionToEdit.type,
        location: institutionToEdit.location,
        address: institutionToEdit.address,
        capacity: institutionToEdit.capacity,
        staff: institutionToEdit.staff,
        status: institutionToEdit.status,
        established: institutionToEdit.established,
        facility_ids: institutionToEdit.facilities.map((f) => f.id),
      });
      // Set the checked facilities
      setSelectedFacilities(new Set(institutionToEdit.facilities.map((f) => f.id)));
      setApiErrors({});
    } else {
      // Reset to default for creating
      setFormData(initialFormData);
      setSelectedFacilities(new Set());
      setApiErrors({});
    }
  }, [institutionToEdit, open]);

  // --- Form Submission (handles both create and update) ---
  const { mutate, isPending } = useMutation({
    mutationFn: (data: InstitutionWriteData) =>
      isEditMode
        ? updateInstitution(institutionToEdit.id, data)
        : createInstitution(data),
    onSuccess: () => {
      toast.success(
        `Institution ${isEditMode ? "updated" : "registered"} successfully!`
      );
      // Invalidate both the list and the specific item (if editing)
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      if (isEditMode) {
        queryClient.invalidateQueries({
          queryKey: ["institution", institutionToEdit.id],
        });
      }
      onOpenChange(false);
    },
    onError: (error: any) => {
      if (error.response?.status === 400) {
        setApiErrors(error.response.data);
        toast.error("Please correct the errors in the form.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
  });

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFacilityChange = (facilityId: number, checked: boolean) => {
    const newSet = new Set(selectedFacilities);
    if (checked) {
      newSet.add(facilityId);
    } else {
      newSet.delete(facilityId);
    }
    setSelectedFacilities(newSet);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiErrors({});

    const dataToSend: InstitutionWriteData = {
      ...formData,
      capacity: Number(formData.capacity) || 0,
      staff: Number(formData.staff) || 0,
      established: Number(formData.established) || new Date().getFullYear(),
      facility_ids: Array.from(selectedFacilities),
    };

    mutate(dataToSend);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {isEditMode ? "Edit Institution" : "Register New Institution"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Updating details for ${institutionToEdit.name}.`
              : "Fill in the details for the new educational institution."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto pr-6 space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Institution Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Institution Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Kwekwe Polytechnic"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {apiErrors.name && (
                  <p className="text-xs text-red-500">{apiErrors.name[0]}</p>
                )}
              </div>

              {/* Institution Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Institution Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTITUTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location (Province) */}
              <div className="space-y-2">
                <Label htmlFor="location">Location (Province)</Label>
                <Input
                  id="location"
                  placeholder="e.g., Midlands Province"
                  value={formData.location}
                  onChange={handleInputChange}
                />
                {apiErrors.location && (
                  <p className="text-xs text-red-500">
                    {apiErrors.location[0]}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTITUTION_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Full Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  placeholder="e.g., 123 Main Street, Kwekwe"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="capacity">Total Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="0"
                  value={formData.capacity}
                  onChange={handleInputChange}
                />
              </div>

              {/* Staff */}
              <div className="space-y-2">
                <Label htmlFor="staff">Staff Members</Label>
                <Input
                  id="staff"
                  type="number"
                  placeholder="0"
                  value={formData.staff}
                  onChange={handleInputChange}
                />
              </div>

              {/* Established Year */}
              <div className="space-y-2">
                <Label htmlFor="established">Established (Year)</Label>
                <Input
                  id="established"
                  type="number"
                  placeholder="e.g., 1980"
                  value={formData.established}
                  onChange={handleInputChange}
                />
              </div>

              {/* Facilities (Dynamic) */}
              <div className="space-y-2 md:col-span-2">
                <Label>Facilities</Label>
                {isLoadingFacilities ? (
                  <p className="text-sm text-muted-foreground">
                    Loading facilities...
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 p-4 border rounded-md">
                    {allFacilities?.map((facility: Facility) => (
                      <div
                        key={facility.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`facility-${facility.id}`}
                          onCheckedChange={(checked) =>
                            handleFacilityChange(facility.id, !!checked)
                          }
                          checked={selectedFacilities.has(facility.id)}
                        />
                        <Label
                          htmlFor={`facility-${facility.id}`}
                          className="font-normal"
                        >
                          {facility.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
                {apiErrors.facility_ids && (
                  <p className="text-xs text-red-500">
                    {apiErrors.facility_ids[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isPending ? "Saving..." : isEditMode ? "Save Changes" : "Save Institution"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
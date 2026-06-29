import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Faculty } from "@/services/faculties.services";
import { Building2, GraduationCap, MapPin, AlignLeft, Info } from "lucide-react";

interface ViewFacultyDialogProps {
  faculty: Faculty;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewFacultyDialog: React.FC<ViewFacultyDialogProps> = ({
  faculty,
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background border shadow-lg rounded-xl">
        <DialogHeader className="border-b pb-4 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-primary">
                <Building2 className="w-6 h-6" />
                {faculty.name}
              </DialogTitle>
            </div>
            <Badge
              variant={faculty.status === "Active" ? "default" : "secondary"}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                faculty.status === "Active"
                  ? "bg-emerald-500/15 text-emerald-600 border-emerald-200"
                  : "bg-amber-500/15 text-amber-600 border-amber-200"
              }`}
            >
              {faculty.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dean Info */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/40 border">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                  Dean
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {faculty.dean || "Not Assigned"}
                </p>
              </div>
            </div>

            {/* Location Info */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/40 border">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                  Location
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {faculty.location || "Not Assigned"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {faculty.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <AlignLeft className="w-4 h-4 text-muted-foreground" />
                Description
              </h3>
              <div className="p-4 rounded-lg bg-muted/40 border text-sm text-muted-foreground leading-relaxed">
                {faculty.description}
              </div>
            </div>
          )}

          {/* Departments List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Info className="w-4 h-4 text-muted-foreground" />
              Departments ({faculty.departments_list?.length || 0})
            </h3>
            {faculty.departments_list && faculty.departments_list.length > 0 ? (
              <ScrollArea className="h-48 border rounded-lg bg-card p-4">
                <ul className="space-y-2">
                  {faculty.departments_list.map((dept, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-foreground flex items-center before:content-[''] before:w-1.5 before:h-1.5 before:bg-primary before:rounded-full before:mr-3"
                    >
                      {dept}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <div className="p-4 rounded-lg bg-muted/40 border text-sm text-muted-foreground text-center italic">
                No departments listed.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

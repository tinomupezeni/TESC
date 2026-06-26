import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  user: any;
  setUser: (user: any) => void;
  onSave: () => void;
  departments: any[];
  roles: any[];
  editing: boolean;
}

function UserModal({
  open,
  onClose,
  user,
  setUser,
  onSave,
  departments,
  roles,
  editing,
}: UserModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {editing ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription>
            {editing ? "Update details for the selected user." : "Create a new user account with specific access levels."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">First Name</Label>
              <Input
                placeholder="First Name"
                value={user.firstName}
                className="h-9 sm:h-10 text-xs sm:text-sm"
                onChange={(e) => setUser({ ...user, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Last Name</Label>
              <Input
                placeholder="Last Name"
                value={user.lastName}
                className="h-9 sm:h-10 text-xs sm:text-sm"
                onChange={(e) => setUser({ ...user, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm">Email Address</Label>
            <Input
              type="email"
              placeholder="Email Address"
              value={user.email}
              className="h-9 sm:h-10 text-xs sm:text-sm"
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium">
              Assign Department (Access Control)
            </Label>
            <Select
              value={user.department}
              onValueChange={(val) => setUser({ ...user, department: val })}
            >
              <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name} className="text-xs sm:text-sm">
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium">
              Access Level
            </Label>
            <Select
              value={user.level}
              onValueChange={(val) => setUser({ ...user, level: val })}
            >
              <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1" className="text-xs sm:text-sm">Admin Access</SelectItem>
                <SelectItem value="4" className="text-xs sm:text-sm">Limited Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="h-9 sm:h-10 text-xs sm:text-sm">
            Cancel
          </Button>
          <Button onClick={onSave} className="h-9 sm:h-10 text-xs sm:text-sm">
            {editing ? "Update User" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UserModal;

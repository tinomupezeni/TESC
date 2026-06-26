import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Bed,
  FlaskConical,
  Lightbulb,
  BookOpen,
  Dumbbell,
  Search,
  MapPin,
  Users,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Pencil,
  Trash2,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddFacilityDialog } from "@/components/AddFacilityDialog";
import { EditFacilityDialog } from "@/components/EditFacilityDialog";
import { getFacilities, deleteFacility, Facility } from "@/services/facilities.services";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Extended interface for UI display
interface UIFacility extends Facility {
  current: number; 
  icon: any;
}

const Facilities = () => {
  const [facilities, setFacilities] = useState<UIFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedFacility, setSelectedFacility] = useState<UIFacility | null>(null);
  const [facilityToEdit, setFacilityToEdit] = useState<Facility | null>(null);
  const [facilityToDelete, setFacilityToDelete] = useState<Facility | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { user } = useAuth();
  
  const institutionId = user?.institution?.id || user?.institution_id;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Accommodation': return Bed;
      case 'Laboratory': return FlaskConical;
      case 'Library': return BookOpen;
      case 'Sports': return Dumbbell;
      case 'Innovation': return Lightbulb;
      default: return Building2;
    }
  };

  const fetchFacilities = async () => {
    // Don't fetch until we have an institution ID
    if (!institutionId) return;

    try {
      setLoading(true);
      // Filter by the logged-in user's institution ID
      const data = await getFacilities({ institution_id: institutionId });
      
      // Transform data for UI (Add icons and mock occupancy)
      const uiData = data.map(f => ({
        ...f,
        current: f.current_usage || 0, 
        icon: getIconForType(f.facility_type)
      }));
      
      setFacilities(uiData);
    } catch (error) {
      console.error("Failed to fetch facilities", error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when institutionId is available/changes
  useEffect(() => {
    fetchFacilities();
  }, [institutionId]);

  const handleDelete = async () => {
    if (!facilityToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFacility(facilityToDelete.id);
      toast.success("Facility deleted successfully");
      setFacilityToDelete(null);
      fetchFacilities();
    } catch (error) {
      toast.error("Failed to delete facility");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = 
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.facility_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (facility.building || "").toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = filterType === "all" || facility.facility_type === filterType;
    return matchesSearch && matchesType;
  });

  const facilityTypes = ["Accommodation", "Laboratory", "Library", "Sports", "Innovation", "Other"];
  const totalFacilities = facilities.length;
  const operationalFacilities = facilities.filter(f => f.status === "Active").length;
  const totalCapacity = facilities.reduce((sum, f) => sum + f.capacity, 0);
  const totalOccupancy = facilities.reduce((sum, f) => sum + f.current, 0);

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Facilities Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage institutional facilities, infrastructure, and resources</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-xs sm:text-sm">Total Facilities</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">{totalFacilities}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Across campus</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-xs sm:text-sm">Operational</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl text-green-600">{operationalFacilities}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Fully functional</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-xs sm:text-sm">Total Capacity</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">{totalCapacity}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Available spaces</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-xs sm:text-sm">Occupancy Rate</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl text-primary">
              {totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0}%
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">{totalOccupancy} / {totalCapacity} utilized</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-none sm:border">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Facilities Directory</CardTitle>
              <CardDescription className="text-xs sm:text-sm">View and manage all institutional facilities</CardDescription>
            </div>
            <div className="w-full sm:w-auto">
              <AddFacilityDialog onFacilityAdded={fetchFacilities} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search facilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 sm:h-11"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
                className="h-8 sm:h-9 text-[10px] sm:text-xs whitespace-nowrap"
              >
                All
              </Button>
              {facilityTypes.map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className="h-8 sm:h-9 text-[10px] sm:text-xs whitespace-nowrap"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
             <div className="flex justify-center items-center py-12 text-muted-foreground">
                 <Loader2 className="h-8 w-8 animate-spin mr-2" />
                 <span className="text-xs sm:text-sm">Loading Facilities...</span>
             </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredFacilities.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground text-xs sm:text-sm">
                  No facilities found matching your search.
                </div>
              ) : (
                filteredFacilities.map((facility) => {
                  const Icon = facility.icon;
                  const utilizationRate = facility.capacity > 0 ? Math.round((facility.current / facility.capacity) * 100) : 0;
                  
                  return (
                    <Card key={facility.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col" onClick={() => setSelectedFacility(facility)}>
                      <CardHeader className="p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <CardTitle className="text-sm sm:text-base truncate" title={facility.name}>{facility.name}</CardTitle>
                              <CardDescription className="text-[10px] sm:text-xs truncate">{facility.facility_type}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  setFacilityToEdit(facility);
                                }}>
                                  <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFacilityToDelete(facility);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            {facility.status === "Active" ? (
                              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 pt-0 flex-1 flex flex-col">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[32px] sm:min-h-[40px]">{facility.description}</p>
                        
                        <div className="space-y-3 mt-auto">
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{facility.building}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                            <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="font-medium">
                              {facility.current} / {facility.capacity} 
                              <span className="text-muted-foreground ml-1 font-normal">({utilizationRate}%)</span>
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <Badge 
                              variant={facility.status === "Active" ? "default" : "secondary"}
                              className={`text-[10px] sm:text-xs px-1.5 py-0.5 ${facility.status === "Active" ? "bg-green-600" : "bg-amber-600"}`}
                            >
                              {facility.status}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 px-2 text-[10px] sm:text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFacility(facility);
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Facility Detail Dialog */}
      <Dialog open={!!selectedFacility} onOpenChange={(open) => !open && setSelectedFacility(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedFacility?.name}</DialogTitle>
            <DialogDescription>
              Detailed facility information and specifications
            </DialogDescription>
          </DialogHeader>
          {selectedFacility && (
            <div className="space-y-6 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Facility Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Facility ID</p>
                      <p className="font-medium">{selectedFacility.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedFacility.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">{selectedFacility.facility_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Capacity</p>
                      <p className="font-medium">{selectedFacility.capacity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Occupancy</p>
                      <p className="font-medium">{selectedFacility.current} / {selectedFacility.capacity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{selectedFacility.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Building</p>
                      <p className="font-medium">{selectedFacility.building}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Availability</p>
                      <p className="font-medium">
                        {selectedFacility.capacity > 0 ? Math.round(((selectedFacility.capacity - selectedFacility.current) / selectedFacility.capacity) * 100) : 0}% Available
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Equipment & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                     <p className="text-sm whitespace-pre-wrap">{selectedFacility.equipment || "No equipment listed."}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                     <p className="text-sm whitespace-pre-wrap">{selectedFacility.description || "No description provided."}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Management & Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Manager</p>
                      <p className="font-medium">{selectedFacility.manager || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contact Number</p>
                      <p className="font-medium">{selectedFacility.contact_number || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedFacility(null)}
                  className="order-3 sm:order-1"
                >
                  Close
                </Button>
                <div className="flex gap-3 order-1 sm:order-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFacilityToEdit(selectedFacility);
                      setSelectedFacility(null);
                    }}
                    className="flex-1 sm:flex-none"
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit Facility
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setFacilityToDelete(selectedFacility);
                      setSelectedFacility(null);
                    }}
                    className="flex-1 sm:flex-none"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Facility
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!facilityToDelete} onOpenChange={(open) => !open && setFacilityToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the facility{" "}
              <span className="font-semibold text-foreground">{facilityToDelete?.name}</span> and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setFacilityToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Facility
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditFacilityDialog 
        facility={facilityToEdit} 
        onClose={() => setFacilityToEdit(null)} 
        onSuccess={fetchFacilities}
      />
    </div>
  );
};

export default Facilities;
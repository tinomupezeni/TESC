import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Bed,
  Monitor,
  FlaskConical,
  Lightbulb,
  BookOpen,
  Wifi,
  Utensils,
  Dumbbell,
  Bus,
  Search,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { AddFacilityDialog } from "@/components/AddFacilityDialog";



const Facilities = () => {
  const [facilities, setFacilities] = useState([])
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedFacility, setSelectedFacility] = useState<typeof facilities[0] | null>(null);

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         facility.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         facility.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || facility.type === filterType;
    return matchesSearch && matchesType;
  });

  const facilityTypes = [...new Set(facilities.map(f => f.type))];
  const totalFacilities = facilities.length;
  const operationalFacilities = facilities.filter(f => f.status === "Operational").length;
  const totalCapacity = facilities.reduce((sum, f) => sum + f.capacity, 0);
  const totalOccupancy = facilities.reduce((sum, f) => sum + f.current, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Facilities Management</h1>
        <p className="text-muted-foreground mt-1">Manage institutional facilities, infrastructure, and resources</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Facilities</CardDescription>
            <CardTitle className="text-3xl">{totalFacilities}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across campus</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Operational</CardDescription>
            <CardTitle className="text-3xl text-success">{operationalFacilities}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Fully functional</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Capacity</CardDescription>
            <CardTitle className="text-3xl">{totalCapacity}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Available spaces</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Occupancy Rate</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {Math.round((totalOccupancy / totalCapacity) * 100)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{totalOccupancy} / {totalCapacity} utilized</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Facilities Directory</CardTitle>
              <CardDescription>View and manage all institutional facilities</CardDescription>
            </div>
            <AddFacilityDialog />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search facilities by name, type, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
              >
                All
              </Button>
              {facilityTypes.map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFacilities.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No facilities found
              </div>
            ) : (
              filteredFacilities.map((facility) => {
                const Icon = facility.icon;
                const utilizationRate = Math.round((facility.current / facility.capacity) * 100);
                
                return (
                  <Card key={facility.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{facility.name}</CardTitle>
                            <CardDescription className="text-xs">{facility.type}</CardDescription>
                          </div>
                        </div>
                        {facility.status === "Operational" ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <XCircle className="h-5 w-5 text-warning" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{facility.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{facility.location}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {facility.current} / {facility.capacity} 
                            <span className="text-muted-foreground ml-1">({utilizationRate}%)</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <Badge 
                            variant={facility.status === "Operational" ? "default" : "secondary"}
                            className={facility.status === "Operational" ? "bg-success" : "bg-warning"}
                          >
                            {facility.status}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedFacility(facility)}
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
        </CardContent>
      </Card>

      {/* Facility Detail Dialog */}
      <Dialog open={!!selectedFacility} onOpenChange={(open) => !open && setSelectedFacility(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedFacility?.name}</DialogTitle>
            <DialogDescription>
              Detailed facility information and specifications
            </DialogDescription>
          </DialogHeader>
          {selectedFacility && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Facility Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
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
                      <p className="font-medium">{selectedFacility.type}</p>
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
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{selectedFacility.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Availability</p>
                      <p className="font-medium">
                        {Math.round(((selectedFacility.capacity - selectedFacility.current) / selectedFacility.capacity) * 100)}% Available
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
                    {selectedFacility.type === "Laboratory" && (
                      <>
                        <p className="text-sm">✓ High-speed computers with latest software</p>
                        <p className="text-sm">✓ Network infrastructure and servers</p>
                        <p className="text-sm">✓ Technical support staff available</p>
                        <p className="text-sm">✓ Air conditioning and power backup</p>
                      </>
                    )}
                    {selectedFacility.type === "Accommodation" && (
                      <>
                        <p className="text-sm">✓ Single and shared rooms available</p>
                        <p className="text-sm">✓ Study areas and common rooms</p>
                        <p className="text-sm">✓ 24/7 security and surveillance</p>
                        <p className="text-sm">✓ Laundry facilities</p>
                      </>
                    )}
                    {selectedFacility.type === "Recreation" && (
                      <>
                        <p className="text-sm">✓ Professional sports equipment</p>
                        <p className="text-sm">✓ Changing rooms and showers</p>
                        <p className="text-sm">✓ First aid facilities</p>
                        <p className="text-sm">✓ Trained sports staff</p>
                      </>
                    )}
                    {selectedFacility.type === "Special Facility" && (
                      <>
                        <p className="text-sm">✓ Innovation workspace and prototyping tools</p>
                        <p className="text-sm">✓ Mentorship and incubation support</p>
                        <p className="text-sm">✓ Startup development resources</p>
                        <p className="text-sm">✓ Networking and collaboration spaces</p>
                      </>
                    )}
                    {!["Laboratory", "Accommodation", "Recreation", "Special Facility"].includes(selectedFacility.type) && (
                      <p className="text-sm">{selectedFacility.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance & Operations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Last Maintenance</p>
                      <p className="font-medium">15 Oct 2025</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Scheduled</p>
                      <p className="font-medium">15 Nov 2025</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Operating Hours</p>
                      <p className="font-medium">8:00 AM - 10:00 PM</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contact Person</p>
                      <p className="font-medium">Facilities Manager</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Facilities;
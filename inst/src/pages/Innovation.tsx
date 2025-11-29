import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Lightbulb,
  TrendingUp,
  Rocket,
  Factory,
  ArrowRight,
  Loader2,
  Users,
  Clock,
  Target
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import AddInnovationDialog from "@/components/AddInnovationDialog";
import { getInnovations, updateInnovation, Innovation as InnovationType } from "@/services/innovation.services";
import { useAuth } from "@/context/AuthContext";

// Map backend stages to UI icons/colors
const stageConfig: Record<string, { icon: any; color: string; label: string }> = {
  idea: { icon: Lightbulb, color: "bg-purple-100 text-purple-800 hover:bg-purple-200", label: "Idea Phase" },
  incubation: { icon: TrendingUp, color: "bg-blue-100 text-blue-800 hover:bg-blue-200", label: "Incubation" },
  prototype: { icon: Rocket, color: "bg-amber-100 text-amber-800 hover:bg-amber-200", label: "Prototyping" },
  market: { icon: Factory, color: "bg-green-100 text-green-800 hover:bg-green-200", label: "Market Ready" },
};

const Innovation = () => {
  const [innovations, setInnovations] = useState<InnovationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [selectedInnovation, setSelectedInnovation] = useState<InnovationType | null>(null);
  
  const { user } = useAuth();
  const institutionId = user?.institution?.id || user?.institution_id;

  const fetchInnovations = async () => {
    if (!institutionId) return;

    try {
      setLoading(true);
      const data = await getInnovations({ institution_id: institutionId });
      setInnovations(data);
    } catch (error) {
      console.error("Failed to fetch innovations:", error);
      toast.error("Could not load innovations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInnovations();
  }, [institutionId]);

  const filteredInnovations = innovations.filter((innovation) => {
    const matchesSearch =
      innovation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      innovation.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      innovation.department.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStage =
      filterStage === "all" || innovation.stage === filterStage;
      
    return matchesSearch && matchesStage;
  });

  const handleStageChange = async (innovationId: number, newStage: string) => {
    try {
        await updateInnovation(innovationId, { stage: newStage });
        toast.success("Project stage updated successfully");
        fetchInnovations(); // Refresh list
        
        // Update local selected state to reflect change immediately in dialog
        if (selectedInnovation && selectedInnovation.id === innovationId) {
            setSelectedInnovation({ ...selectedInnovation, stage: newStage } as any);
        }
    } catch (error) {
        toast.error("Failed to update stage");
    }
  };

  // Statistics
  const total = innovations.length;
  const incubationCount = innovations.filter(i => i.stage === 'incubation').length;
  const prototypeCount = innovations.filter(i => i.stage === 'prototype').length;
  const marketCount = innovations.filter(i => i.stage === 'market').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Innovation Hub</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage institutional innovations
          </p>
        </div>
        <AddInnovationDialog onInnovationAdded={fetchInnovations} />
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Innovations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Incubation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{incubationCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Prototyping</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{prototypeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Market Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{marketCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Innovation Projects</CardTitle>
          <CardDescription>
            Monitor and manage all innovation initiatives
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, team, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="idea">Idea Phase</SelectItem>
                <SelectItem value="incubation">Incubation</SelectItem>
                <SelectItem value="prototype">Prototyping</SelectItem>
                <SelectItem value="market">Market Ready</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          {loading ? (
             <div className="flex justify-center py-12">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          ) : (
            <div className="grid gap-4">
                {filteredInnovations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No innovations found.</div>
                ) : (
                    filteredInnovations.map((innovation) => {
                    const config = stageConfig[innovation.stage] || stageConfig.idea;
                    const StageIcon = config.icon;

                    return (
                        <Card
                        key={innovation.id}
                        className="hover:shadow-md transition-shadow cursor-pointer border-l-4"
                        style={{ borderLeftColor: innovation.status === 'approved' ? '#10b981' : 'transparent' }}
                        >
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                    {innovation.title}
                                </h3>
                                <Badge variant="outline">{innovation.category_display}</Badge>
                                <Badge className={config.color}>
                                    <StageIcon className="h-3 w-3 mr-1" />
                                    {innovation.stage_display}
                                </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                <span className="font-medium text-foreground">{innovation.team_name}</span> • {innovation.department}
                                </p>
                                
                                <div className="flex gap-6 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {innovation.team_size} Members
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {innovation.timeline_months} Months
                                    </div>
                                </div>
                            </div>
                            
                            <Dialog>
                                <DialogTrigger asChild>
                                <Button
                                    onClick={() => setSelectedInnovation(innovation)}
                                    variant="outline"
                                >
                                    View Details
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                                </DialogTrigger>
                                
                                {/* Detail Modal */}
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl">
                                    {innovation.title}
                                    </DialogTitle>
                                    <DialogDescription>
                                    {innovation.team_name} • {innovation.department}
                                    </DialogDescription>
                                </DialogHeader>

                                <Tabs defaultValue="overview" className="mt-4">
                                    <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="details">Project Details</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="overview" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm">Current Stage</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Badge className={`text-base px-3 py-1 ${config.color}`}>
                                                <StageIcon className="h-4 w-4 mr-2" />
                                                {innovation.stage_display}
                                            </Badge>
                                            
                                            <div className="mt-6">
                                            <Label>Update Stage</Label>
                                            <Select
                                                onValueChange={(value) =>
                                                handleStageChange(innovation.id, value)
                                                }
                                                defaultValue={innovation.stage}
                                            >
                                                <SelectTrigger className="mt-2">
                                                <SelectValue placeholder="Select new stage" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                <SelectItem value="idea">Idea Phase</SelectItem>
                                                <SelectItem value="incubation">Incubation</SelectItem>
                                                <SelectItem value="prototype">Prototyping</SelectItem>
                                                <SelectItem value="market">Market Ready</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            </div>
                                        </CardContent>
                                        </Card>
                                        
                                        <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm">Key Metrics</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Users className="h-4 w-4" /> Team Size
                                                </span>
                                                <span className="font-medium">{innovation.team_size} Members</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Clock className="h-4 w-4" /> Timeline
                                                </span>
                                                <span className="font-medium">{innovation.timeline_months} Months</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Target className="h-4 w-4" /> Status
                                                </span>
                                                <Badge variant={innovation.status === 'approved' ? 'default' : 'secondary'}>
                                                    {innovation.status}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                        </Card>
                                    </div>
                                    </TabsContent>

                                    <TabsContent value="details" className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                        <CardTitle className="text-sm">Problem Statement</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                        <p className="text-foreground leading-relaxed whitespace-pre-line">
                                            {innovation.problem_statement}
                                        </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                        <CardTitle className="text-sm">Proposed Solution</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                        <p className="text-foreground leading-relaxed whitespace-pre-line">
                                            {innovation.proposed_solution}
                                        </p>
                                        </CardContent>
                                    </Card>
                                    </TabsContent>
                                </Tabs>
                                </DialogContent>
                            </Dialog>
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
    </div>
  );
};

export default Innovation;
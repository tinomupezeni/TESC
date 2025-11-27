import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Lightbulb, TrendingUp, Rocket, Factory, ArrowRight } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";



const stageConfig = {
  "Idea": { icon: Lightbulb, color: "bg-muted text-muted-foreground" },
  "Incubation": { icon: TrendingUp, color: "bg-info text-info-foreground" },
  "Industrialization": { icon: Rocket, color: "bg-warning text-warning-foreground" },
  "Rollout": { icon: Factory, color: "bg-success text-success-foreground" },
};

const Innovation = () => {
  const [innovations, setInnovations] = useState([])
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [selectedInnovation, setSelectedInnovation] = useState<typeof innovations[0] | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredInnovations = innovations.filter(innovation => {
    const matchesSearch = innovation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         innovation.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = filterStage === "all" || innovation.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const handleStageChange = (innovationId: string, newStage: string) => {
    toast.success(`Innovation ${innovationId} promoted to ${newStage}`);
  };

  const handleAddInnovation = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Innovation added successfully!");
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Innovation Hub</h1>
          <p className="text-muted-foreground mt-1">Track and manage institutional innovations</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Innovation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Innovation</DialogTitle>
              <DialogDescription>Register a new innovation project</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddInnovation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Innovation Title</Label>
                  <Input placeholder="e.g., Smart Parking System" required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select required>
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
                  <Label>Team Name</Label>
                  <Input placeholder="Innovation team name" required />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="cs">Computer Science</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Problem Statement</Label>
                <Textarea 
                  placeholder="What problem does this innovation solve?"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Proposed Solution</Label>
                <Textarea 
                  placeholder="Describe your innovative solution"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Team Members</Label>
                  <Input type="number" placeholder="5" required />
                </div>
                <div className="space-y-2">
                  <Label>Timeline (months)</Label>
                  <Input type="number" placeholder="12" required />
                </div>
                <div className="space-y-2">
                  <Label>Initial Stage</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="incubation">Incubation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Innovation</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Innovations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{innovations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Incubation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              {innovations.filter(i => i.stage === "Incubation").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Industrializing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {innovations.filter(i => i.stage === "Industrialization").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ready for Rollout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {innovations.filter(i => i.stage === "Rollout").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Innovation Projects</CardTitle>
              <CardDescription>Monitor and manage all innovation initiatives</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search innovations..."
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
                <SelectItem value="Idea">Idea</SelectItem>
                <SelectItem value="Incubation">Incubation</SelectItem>
                <SelectItem value="Industrialization">Industrialization</SelectItem>
                <SelectItem value="Rollout">Rollout</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredInnovations.map((innovation) => {
              const StageIcon = stageConfig[innovation.stage as keyof typeof stageConfig].icon;
              const stageColor = stageConfig[innovation.stage as keyof typeof stageConfig].color;
              
              return (
                <Card key={innovation.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{innovation.title}</h3>
                          <Badge variant="outline">{innovation.category}</Badge>
                          <Badge className={stageColor}>
                            <StageIcon className="h-3 w-3 mr-1" />
                            {innovation.stage}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {innovation.team} • {innovation.department}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Prototypes:</span>
                            <span className="ml-1 font-medium">{innovation.prototypes}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Team:</span>
                            <span className="ml-1 font-medium">{innovation.members} members</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Funding:</span>
                            <span className="ml-1 font-medium">{innovation.funding}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <span className="ml-1 font-medium">{innovation.startupStatus}</span>
                          </div>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedInnovation(innovation)}>
                            View Details
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl">{innovation.title}</DialogTitle>
                            <DialogDescription>{innovation.team} • {innovation.department}</DialogDescription>
                          </DialogHeader>
                          
                          <Tabs defaultValue="overview" className="mt-4">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="overview">Overview</TabsTrigger>
                              <TabsTrigger value="problem">Problem & Solution</TabsTrigger>
                              <TabsTrigger value="progress">Progress</TabsTrigger>
                              <TabsTrigger value="flowchart">Flowchart</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="overview" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-sm">Stage</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <Badge className={stageColor}>
                                      <StageIcon className="h-3 w-3 mr-1" />
                                      {innovation.stage}
                                    </Badge>
                                    <div className="mt-4">
                                      <Label>Promote to:</Label>
                                      <Select onValueChange={(value) => handleStageChange(innovation.id, value)}>
                                        <SelectTrigger className="mt-2">
                                          <SelectValue placeholder="Select new stage" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Incubation">Incubation</SelectItem>
                                          <SelectItem value="Industrialization">Industrialization</SelectItem>
                                          <SelectItem value="Rollout">Rollout Industrialization</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-sm">Key Metrics</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Team Size:</span>
                                      <span className="font-medium">{innovation.members} members</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Timeline:</span>
                                      <span className="font-medium">{innovation.timeline}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Prototypes:</span>
                                      <span className="font-medium">{innovation.prototypes} versions</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Funding:</span>
                                      <span className="font-medium">{innovation.funding}</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Impact Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-foreground">{innovation.impact}</p>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            
                            <TabsContent value="problem" className="space-y-4">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Problem Identification</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-foreground leading-relaxed">{innovation.problemStatement}</p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Proposed Solution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-foreground leading-relaxed">{innovation.solution}</p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Why This Innovation Started</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-foreground leading-relaxed">
                                    This innovation emerged from direct observation of challenges faced by our community. 
                                    The team conducted extensive field research and stakeholder interviews to validate the 
                                    problem and develop a solution that addresses real-world needs with practical, 
                                    sustainable technology.
                                  </p>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            
                            <TabsContent value="progress" className="space-y-4">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Development Stages</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                      <div className="h-8 w-8 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                                        <span className="text-success-foreground text-sm font-medium">1</span>
                                      </div>
                                      <div>
                                        <h4 className="font-medium">Ideation & Research</h4>
                                        <p className="text-sm text-muted-foreground">Problem identification and market research completed</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <div className="h-8 w-8 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                                        <span className="text-success-foreground text-sm font-medium">2</span>
                                      </div>
                                      <div>
                                        <h4 className="font-medium">Prototype Development</h4>
                                        <p className="text-sm text-muted-foreground">{innovation.prototypes} iterations completed with user testing</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <div className={`h-8 w-8 rounded-full ${innovation.stage === "Incubation" || innovation.stage === "Industrialization" || innovation.stage === "Rollout" ? "bg-success" : "bg-muted"} flex items-center justify-center flex-shrink-0`}>
                                        <span className={`text-sm font-medium ${innovation.stage === "Incubation" || innovation.stage === "Industrialization" || innovation.stage === "Rollout" ? "text-success-foreground" : "text-muted-foreground"}`}>3</span>
                                      </div>
                                      <div>
                                        <h4 className="font-medium">Incubation</h4>
                                        <p className="text-sm text-muted-foreground">Business model development and pilot testing</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <div className={`h-8 w-8 rounded-full ${innovation.stage === "Industrialization" || innovation.stage === "Rollout" ? "bg-success" : "bg-muted"} flex items-center justify-center flex-shrink-0`}>
                                        <span className={`text-sm font-medium ${innovation.stage === "Industrialization" || innovation.stage === "Rollout" ? "text-success-foreground" : "text-muted-foreground"}`}>4</span>
                                      </div>
                                      <div>
                                        <h4 className="font-medium">Industrialization</h4>
                                        <p className="text-sm text-muted-foreground">Scaling production and market entry</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <div className={`h-8 w-8 rounded-full ${innovation.stage === "Rollout" ? "bg-success" : "bg-muted"} flex items-center justify-center flex-shrink-0`}>
                                        <span className={`text-sm font-medium ${innovation.stage === "Rollout" ? "text-success-foreground" : "text-muted-foreground"}`}>5</span>
                                      </div>
                                      <div>
                                        <h4 className="font-medium">Rollout</h4>
                                        <p className="text-sm text-muted-foreground">Full market deployment and expansion</p>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Startup Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-base">{innovation.startupStatus}</Badge>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-foreground font-medium">{innovation.funding} raised</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            
                            <TabsContent value="flowchart" className="space-y-4">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm">Innovation Development Flowchart</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="bg-muted/30 p-6 rounded-lg">
                                    <div className="flex flex-col items-center space-y-4">
                                      <div className="w-full max-w-md">
                                        <div className="bg-card border-2 border-primary p-4 rounded-lg text-center">
                                          <p className="font-medium">Problem Identification</p>
                                        </div>
                                        <div className="flex justify-center my-2">
                                          <div className="h-8 w-0.5 bg-border"></div>
                                        </div>
                                        <div className="bg-card border-2 border-primary p-4 rounded-lg text-center">
                                          <p className="font-medium">Research & Validation</p>
                                        </div>
                                        <div className="flex justify-center my-2">
                                          <div className="h-8 w-0.5 bg-border"></div>
                                        </div>
                                        <div className="bg-card border-2 border-info p-4 rounded-lg text-center">
                                          <p className="font-medium">Prototype Development</p>
                                          <p className="text-xs text-muted-foreground mt-1">Iterations: {innovation.prototypes}</p>
                                        </div>
                                        <div className="flex justify-center my-2">
                                          <div className="h-8 w-0.5 bg-border"></div>
                                        </div>
                                        <div className="bg-card border-2 border-info p-4 rounded-lg text-center">
                                          <p className="font-medium">Incubation Stage</p>
                                          <p className="text-xs text-muted-foreground mt-1">Business Model Development</p>
                                        </div>
                                        <div className="flex justify-center my-2">
                                          <div className="h-8 w-0.5 bg-border"></div>
                                        </div>
                                        <div className={`bg-card border-2 ${innovation.stage === "Industrialization" || innovation.stage === "Rollout" ? "border-warning" : "border-border"} p-4 rounded-lg text-center`}>
                                          <p className="font-medium">Industrialization</p>
                                          <p className="text-xs text-muted-foreground mt-1">Scaling & Production</p>
                                        </div>
                                        <div className="flex justify-center my-2">
                                          <div className="h-8 w-0.5 bg-border"></div>
                                        </div>
                                        <div className={`bg-card border-2 ${innovation.stage === "Rollout" ? "border-success" : "border-border"} p-4 rounded-lg text-center`}>
                                          <p className="font-medium">Market Rollout</p>
                                          <p className="text-xs text-muted-foreground mt-1">Full Deployment</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
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
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Innovation;

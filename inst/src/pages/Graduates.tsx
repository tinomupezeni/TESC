import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, GraduationCap, TrendingUp } from "lucide-react";

const Graduates = () => {
  const [graduates, setGraduates] = useState([]);
  const [filterYear, setFilterYear] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");
  const [selectedGraduate, setSelectedGraduate] = useState<
    (typeof graduates)[0] | null
  >(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredGraduates = graduates.filter((grad) => {
    const matchesYear = filterYear === "all" || grad.year === filterYear;
    const matchesProgram =
      filterProgram === "all" || grad.program === filterProgram;
    return matchesYear && matchesProgram;
  });

  const totalGraduates2024 = graduates
    .filter((g) => g.year === "2024")
    .reduce((sum, g) => sum + g.graduates, 0);
  const totalGraduates2023 = graduates
    .filter((g) => g.year === "2023")
    .reduce((sum, g) => sum + g.graduates, 0);
  const avgPassRate = (
    graduates.reduce((sum, g) => sum + parseFloat(g.passRate), 0) /
    graduates.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Graduates & Completions
        </h1>
        <p className="text-muted-foreground mt-1">
          Track student graduations and program completions by year
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>2024 Graduates</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {totalGraduates2024}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Current academic year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>2023 Graduates</CardDescription>
            <CardTitle className="text-3xl">{totalGraduates2023}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3 w-3" />
              <span>Previous year</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Pass Rate</CardDescription>
            <CardTitle className="text-3xl text-success">{0}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across all programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Programs</CardDescription>
            <CardTitle className="text-3xl">{0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Offering graduations
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Graduation Records</CardTitle>
              <CardDescription>
                View graduation statistics by program and year
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <GraduationCap className="h-4 w-4 mr-2" />
                Add Graduation Batch
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterProgram} onValueChange={setFilterProgram}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                <SelectItem value="Computer Science">
                  Computer Science
                </SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Business Studies">
                  Business Studies
                </SelectItem>
                <SelectItem value="Information Technology">
                  Information Technology
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Total Graduates</TableHead>
                  <TableHead>Distinction</TableHead>
                  <TableHead>Credit</TableHead>
                  <TableHead>Pass</TableHead>
                  <TableHead>Pass Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGraduates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No graduation records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGraduates.map((grad) => (
                    <TableRow key={grad.id}>
                      <TableCell className="font-medium">{grad.year}</TableCell>
                      <TableCell>{grad.program}</TableCell>
                      <TableCell>{grad.level}</TableCell>
                      <TableCell className="font-semibold">
                        {grad.graduates}
                      </TableCell>
                      <TableCell>{grad.distinction}</TableCell>
                      <TableCell>{grad.credit}</TableCell>
                      <TableCell>{grad.pass}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-success">
                          {grad.passRate}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedGraduate(grad)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedGraduate}
        onOpenChange={(open) => !open && setSelectedGraduate(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Graduation Details - {selectedGraduate?.year}
            </DialogTitle>
            <DialogDescription>
              {selectedGraduate?.program} ({selectedGraduate?.level})
            </DialogDescription>
          </DialogHeader>
          {selectedGraduate && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Graduates</CardDescription>
                    <CardTitle className="text-2xl">
                      {selectedGraduate.graduates}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Pass Rate</CardDescription>
                    <CardTitle className="text-2xl text-success">
                      {selectedGraduate.passRate}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Distinction</span>
                      <div className="flex items-center gap-2">
                        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${
                                (selectedGraduate.distinction /
                                  selectedGraduate.graduates) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold w-12 text-right">
                          {selectedGraduate.distinction}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Credit</span>
                      <div className="flex items-center gap-2">
                        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary"
                            style={{
                              width: `${
                                (selectedGraduate.credit /
                                  selectedGraduate.graduates) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold w-12 text-right">
                          {selectedGraduate.credit}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pass</span>
                      <div className="flex items-center gap-2">
                        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent"
                            style={{
                              width: `${
                                (selectedGraduate.pass /
                                  selectedGraduate.graduates) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold w-12 text-right">
                          {selectedGraduate.pass}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Program Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Program</p>
                      <p className="font-medium">{selectedGraduate.program}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Level</p>
                      <p className="font-medium">{selectedGraduate.level}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Academic Year
                      </p>
                      <p className="font-medium">{selectedGraduate.year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Graduation ID
                      </p>
                      <p className="font-medium">{selectedGraduate.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Graduation Batch</DialogTitle>
            <DialogDescription>
              Record a new graduation batch for your institution
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Academic Year</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Program</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cs">Computer Science</SelectItem>
                    <SelectItem value="eng">Engineering</SelectItem>
                    <SelectItem value="bus">Business Studies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Level</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nc">National Certificate</SelectItem>
                  <SelectItem value="nd">National Diploma</SelectItem>
                  <SelectItem value="hnd">Higher National Diploma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Distinction</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Credit</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pass</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowAddDialog(false);
                  // Add toast notification here
                }}
              >
                Add Graduation Batch
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Graduates;

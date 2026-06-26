// frontend/src/pages/Programs.tsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { Program } from "@/lib/types/academic.types";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Programs() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const institutionId = searchParams.get("institution"); // Read ?institution=ID

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = "/api/programs/";
    if (institutionId) {
      url += `?institution=${institutionId}`;
    }

    setLoading(true);
    axiosInstance
      .get(url)
      .then((res) => {
        setPrograms(res.data.results);
      })
      .finally(() => setLoading(false));
  }, [institutionId]);

  if (loading) return <DashboardLayout>Loading programs...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Programs</h1>
        {programs.length === 0 ? (
          <p className="text-muted-foreground">No programs found.</p>
        ) : (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Program List</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Institution</TableHead>
                    <TableHead className="hidden sm:table-cell">Level</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium text-[10px] sm:text-xs">{program.id}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{program.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{program.institution_name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">{program.level}</TableCell>
                      <TableCell className="text-right text-xs">{program.enrolled_students}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
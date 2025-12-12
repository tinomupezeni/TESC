import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function InnovationStagePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const stage = searchParams.get("stage") || "";
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        const fetchProjects = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/innovations/?stage=${encodeURIComponent(stage)}`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                const data = await res.json();
                setProjects(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching projects:", error);
                setProjects([]);
            }
        };

        if (stage) fetchProjects();
    }, [stage]);

    const handleRowClick = (institutionId: number) => {
        navigate(`/institutions/${institutionId}`);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="pb-2 border-b">
                    <h1 className="text-3xl font-bold">{stage} Projects</h1>
                    <p className="text-muted-foreground">
                        List of all active projects in the <strong>{stage}</strong> stage.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{stage} Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {projects.length ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Institution</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {projects.map((item: any) => (
                                        <TableRow 
                                            key={item.id} 
                                            className="cursor-pointer hover:bg-muted"
                                            onClick={() => handleRowClick(item.institution_id)}
                                        >
                                            <TableCell>{item.id}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.institution_name}</TableCell>
                                            <TableCell>{item.status}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-center text-muted-foreground">No projects found in this stage</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

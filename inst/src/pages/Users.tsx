import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    getInstUsers, 
    deleteInstUser, 
    InstUser 
} from "@/services/users.services";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    UserPlus, 
    MoreVertical, 
    Trash2, 
    ShieldCheck, 
    Mail, 
    AlertCircle,
    UserCheck,
    Clock
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import AddUserDialog from "@/components/AddUserDialog";

const Users = () => {
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: users, isLoading, error } = useQuery({
        queryKey: ["inst-users"],
        queryFn: getInstUsers,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteInstUser,
        onSuccess: () => {
            toast.success("User removed successfully");
            queryClient.invalidateQueries({ queryKey: ["inst-users"] });
        },
        onError: () => {
            toast.error("Failed to remove user");
        }
    });

    const getLevelBadge = (level: string) => {
        switch (level) {
            case '1': return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
            case '2': return <Badge variant="secondary">View Only</Badge>;
            case '3': return <Badge className="bg-blue-100 text-blue-800">Dept Access</Badge>;
            case '4': return <Badge className="bg-green-100 text-green-800">Staff</Badge>;
            default: return <Badge variant="outline">Unknown</Badge>;
        }
    };

    if (isLoading) return <div className="p-8">Loading users...</div>;
    if (error) return <div className="p-8 text-red-500">Error loading users</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground mt-1">Manage staff accounts and permissions for your institution.</p>
                </div>
                <Button onClick={() => setIsAddUserOpen(true)} className="gap-2">
                    <UserPlus size={18} />
                    Add New User
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Staff</CardDescription>
                        <CardTitle className="text-2xl">{users?.length || 0}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Active Accounts</CardDescription>
                        <CardTitle className="text-2xl text-green-600">
                            {users?.filter(u => u.is_active).length || 0}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Pending Password Change</CardDescription>
                        <CardTitle className="text-2xl text-amber-600">
                            {users?.filter(u => u.must_change_password).length || 0}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email / Username</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Access Level</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.map((user: InstUser) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.first_name} {user.last_name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm flex items-center gap-1">
                                                <Mail size={12} className="text-muted-foreground" />
                                                {user.email}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground lowercase">
                                                @{user.username}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.role_name || "No Role"}</TableCell>
                                    <TableCell>{getLevelBadge(user.level)}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {user.is_active ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                                                    <UserCheck size={10} /> Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">Inactive</Badge>
                                            )}
                                            {user.must_change_password && (
                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                                                    <Clock size={10} /> Setup Required
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => {}}>
                                                    Edit Permissions
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => {
                                                        if (confirm("Are you sure you want to remove this user?")) {
                                                            deleteMutation.mutate(user.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Remove User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AddUserDialog 
                open={isAddUserOpen} 
                onOpenChange={setIsAddUserOpen} 
            />
        </div>
    );
};

export default Users;

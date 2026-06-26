import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

interface UsersProps {
  setEditingItem: (item: any) => void;
  setNewUser: (user: any) => void;
  setOpenUserModal: (open: boolean) => void;
  users: any[];
  editUserHandler: (user: any) => void;
  deleteUserHandler: (id: number) => void;
}

export default function Users({
  setEditingItem,
  setNewUser,
  setOpenUserModal,
  users = [],
  editUserHandler,
  deleteUserHandler,
}: UsersProps) {
  return (
    <div>
      <Card className="border-none sm:border">
        <CardHeader className="flex flex-row justify-between items-center space-y-0 p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">System Users</CardTitle>
          <Button
            size="sm"
            onClick={() => {
              if (setEditingItem) setEditingItem(null);
              if (setNewUser)
                setNewUser({
                  firstName: "",
                  lastName: "",
                  email: "",
                  role: "",
                  department: "",
                  level: "4",
                });
              if (setOpenUserModal) setOpenUserModal(true);
            }}
            className="h-9 text-xs sm:text-sm"
          >
            Add User
          </Button>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
          <div className="rounded-md border overflow-x-auto mx-1 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="hidden md:table-cell text-xs">Email</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs">Dept</TableHead>
                  <TableHead className="text-xs">Level</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8 text-xs"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-[10px] sm:text-xs">
                        <div>{user.first_name} {user.last_name}</div>
                        <div className="md:hidden text-[9px] text-muted-foreground truncate max-w-[120px]">{user.email}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{user.email}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">{user.department?.name || "N/A"}</TableCell>
                      <TableCell className="text-[10px] sm:text-xs">Lvl {user.level}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-[10px]"
                            onClick={() => editUserHandler(user)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-[10px]"
                            onClick={() => deleteUserHandler(user.id)}
                          >
                            Del
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

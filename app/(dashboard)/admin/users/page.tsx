"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MoreHorizontal, Search, UserCog, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { adminApi, UserFilterDto } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  bookingsCount: number;
}

export default function UsersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(10);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Prepare filters for API call
      const filters: UserFilterDto = {
        page: currentPage,
        limit,
        ...(searchQuery && { search: searchQuery }),
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const response = await adminApi.listUsers(filters);

      if (response.success && response.data) {
        // Type assertion for response data
        const responseData = response.data as { data: User[]; total: number };
        setUsers(responseData.data);
        setTotalUsers(responseData.total);
        setTotalPages(Math.ceil(responseData.total / limit));
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch users",
          variant: "destructive",
        });
        // Fall back to mock data if API call fails in development
        if (process.env.NODE_ENV === "development") {
          setMockData();
        }
      }
    } catch (_error) {
      console.error("Error fetching users:", _error);
      // Fall back to mock data if API call fails in development
      if (process.env.NODE_ENV === "development") {
        setMockData();
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, searchQuery, roleFilter, statusFilter]);

  const setMockData = () => {
    // Mock data for development and testing
    const mockUsers: User[] = [
      {
        id: "usr_123456",
        name: "John Doe",
        email: "john.doe@example.com",
        role: "user",
        status: "active",
        createdAt: "2023-01-15T12:00:00Z",
        bookingsCount: 5,
      },
      {
        id: "usr_234567",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        role: "admin",
        status: "active",
        createdAt: "2023-02-20T09:30:00Z",
        bookingsCount: 2,
      },
      {
        id: "usr_345678",
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
        role: "user",
        status: "inactive",
        createdAt: "2023-03-10T14:45:00Z",
        bookingsCount: 0,
      },
      {
        id: "usr_456789",
        name: "Bob Brown",
        email: "bob.brown@example.com",
        role: "user",
        status: "active",
        createdAt: "2023-04-05T11:15:00Z",
        bookingsCount: 3,
      },
      {
        id: "usr_567890",
        name: "Carol White",
        email: "carol.white@example.com",
        role: "user",
        status: "active",
        createdAt: "2023-05-18T08:20:00Z",
        bookingsCount: 1,
      },
    ];

    setUsers(mockUsers);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter, fetchUsers]);

  // Debounced search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchUsers();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, currentPage, fetchUsers]);

  // Filter users based on search query and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleViewDetails = async (userId: string) => {
    router.push(`/dashboard/admin/users/${userId}`);
  };

  const handleEditRole = async (userId: string) => {
    // In a real app, you would open a modal or redirect to a role edit page
    const user = users.find((u) => u.id === userId);
    const newRole = user?.role === "admin" ? "user" : "admin";

    try {
      const response = await adminApi.updateUserRole(userId, {
        role: newRole as "user" | "admin",
      });

      if (response.success) {
        toast({
          title: "Success",
          description: `User role updated to ${newRole}`,
        });
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update user role",
          variant: "destructive",
        });
      }
    } catch (_error) {
      console.error("Error updating user role:", _error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDisableUser = async (userId: string) => {
    try {
      const response = await adminApi.disableUser(userId);

      if (response.success) {
        toast({
          title: "Success",
          description: "User has been disabled",
        });
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to disable user",
          variant: "destructive",
        });
      }
    } catch (_error) {
      console.error("Error disabling user:", _error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "user":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">View and manage user accounts</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Users</CardTitle>
          <CardDescription>Search and filter the user list</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or ID"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
                setStatusFilter("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Showing {filteredUsers.length} of {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading users...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getRoleBadgeColor(user.role)}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusBadgeColor(user.status)}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{user.bookingsCount}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <button
                                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleViewDetails(user.id)}
                              >
                                View details
                              </button>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <button
                                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleEditRole(user.id)}
                              >
                                <UserCog className="mr-2 h-4 w-4" />
                                <span>Edit role</span>
                              </button>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <button
                                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-red-600 hover:bg-accent hover:text-red-600"
                                onClick={() => handleDisableUser(user.id)}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                <span>Disable account</span>
                              </button>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {users.length} of {totalUsers} users
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      {currentPage > 1 ? (
                        <PaginationPrevious
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        />
                      ) : (
                        <PaginationPrevious className="pointer-events-none opacity-50" />
                      )}
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, totalPages) }).map(
                      (_, i) => {
                        const pageNumber = i + 1;
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNumber)}
                              isActive={currentPage === pageNumber}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                    )}
                    <PaginationItem>
                      {currentPage < totalPages ? (
                        <PaginationNext
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        />
                      ) : (
                        <PaginationNext className="pointer-events-none opacity-50" />
                      )}
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Search, Download, Filter, Users, Building2, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable as DataTableNew } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { EmployeeWithDepartment, Department } from "@/types/employee";
import { createColumns } from "./_components/columns";
import { EmployeeFormDialog } from "./_components/employee-form-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeWithDepartment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithDepartment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeWithDepartment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/employees");
      const result = await response.json();

      console.log("Employees API Response:", result);
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch employees");
      }

      const employeesData = result.data || [];
      console.log("Employees data:", employeesData);
      console.log("Employees count:", employeesData.length);

      setEmployees(employeesData);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      const result = await response.json();

      console.log("Departments API Response:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch departments");
      }

      const departmentsData = result.data || [];
      console.log("Departments data:", departmentsData);
      console.log("Departments count:", departmentsData.length);

      setDepartments(departmentsData);
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  // Filter employees based on search and department
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    // Search filter - filters by name or email
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query),
      );
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((emp) => emp.department_id === departmentFilter);
    }

    return filtered;
  }, [employees, searchQuery, departmentFilter]);

  const columns = useMemo(
    () =>
      createColumns(
        (employee) => {
          setSelectedEmployee(employee);
          setDialogOpen(true);
        },
        (employee) => {
          setEmployeeToDelete(employee);
          setDeleteDialogOpen(true);
        },
      ),
    [],
  );

  const table = useDataTableInstance({
    data: filteredEmployees,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: false,
    defaultPageSize: 10,
    defaultPageIndex: 0,
  });

  // Reset to first page when filters change
  useEffect(() => {
    const currentPageIndex = table.getState().pagination.pageIndex;
    if (currentPageIndex !== 0) {
      console.log('Resetting to page 0 due to filter change');
      table.setPageIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, departmentFilter]);

  // Debug logs
  useEffect(() => {
    console.log("=== EMPLOYEES PAGE DEBUG ===");
    console.log("Employees state:", employees);
    console.log("Employees count:", employees.length);
    console.log("Filtered employees:", filteredEmployees);
    console.log("Filtered count:", filteredEmployees.length);
    console.log("Table rows:", table.getRowModel().rows.length);
    console.log("Table data:", table.options.data);
    console.log("============================");
  }, [employees, filteredEmployees, table]);

  const handleDelete = async () => {
    if (!employeeToDelete) return;

    try {
      const response = await fetch(`/api/employees/${employeeToDelete.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete employee");
      }

      toast.success("Employee deleted successfully");
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      fetchEmployees();
    } catch (error) {
      toast.error("Failed to delete employee", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleSuccess = () => {
    fetchEmployees();
  };

  if (loading) {
    return (
      <div className="@container/main flex flex-col gap-4 md:gap-6">
        <div className="flex h-96 items-center justify-center">
          <div className="text-muted-foreground">Loading employees...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Employees</h1>
          <p className="text-muted-foreground">
            Manage your team members and their information
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 size-4" />
          Add Employee
        </Button>
      </div>

      {/* Stats Cards - Moved above table */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-muted-foreground text-sm font-medium">Total Employees</div>
              <div className="mt-2 text-3xl font-bold">{employees.length}</div>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="text-primary size-6" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-muted-foreground text-sm font-medium">Filtered Results</div>
              <div className="mt-2 text-3xl font-bold">{filteredEmployees.length}</div>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="text-primary size-6" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-muted-foreground text-sm font-medium">Departments</div>
              <div className="mt-2 text-3xl font-bold">{departments.length}</div>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <Building2 className="text-primary size-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 size-4" />
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <DataTableNew table={table} columns={columns} />
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />

      {/* Employee Form Dialog */}
      <EmployeeFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        employee={selectedEmployee}
        departments={departments}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {employeeToDelete?.name} from the system. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

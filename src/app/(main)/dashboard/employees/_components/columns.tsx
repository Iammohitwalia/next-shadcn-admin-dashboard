"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EmployeeWithDepartment } from "@/types/employee";
import { getInitials } from "@/lib/utils";

export const createColumns = (
  onEdit: (employee: EmployeeWithDepartment) => void,
  onDelete: (employee: EmployeeWithDepartment) => void,
): ColumnDef<EmployeeWithDepartment>[] => [
  {
    id: "employee_id",
    accessorKey: "employee_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Employee ID" />,
    cell: ({ row }) => (
      <div className="font-mono text-sm font-medium">{row.original.employee_id}</div>
    ),
    enableHiding: true,
  },
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-9 rounded-lg">
            <AvatarImage src={employee.photo_url || undefined} alt={employee.name} />
            <AvatarFallback className="rounded-lg">{getInitials(employee.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{employee.name}</span>
            <span className="text-muted-foreground text-sm">{employee.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    id: "phone_number",
    accessorKey: "phone_number",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
    cell: ({ row }) => {
      const phone = row.original.phone_number;
      return <div className="text-sm">{phone || <span className="text-muted-foreground">—</span>}</div>;
    },
    enableHiding: true,
  },
  {
    id: "department",
    accessorKey: "departments.name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
    cell: ({ row }) => {
      const department = row.original.departments;
      return (
        <div>
          {department ? (
            <Badge variant="outline" className="font-normal">
              {department.name}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const deptA = rowA.original.departments?.name ?? "";
      const deptB = rowB.original.departments?.name ?? "";
      return deptA.localeCompare(deptB);
    },
    filterFn: (row, id, value) => {
      const department = row.original.departments;
      return department ? value.includes(department.id) : false;
    },
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return (
        <div className="text-muted-foreground text-sm">
          {date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </div>
      );
    },
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="data-[state=open]:bg-muted flex size-8" size="icon">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(employee)}>
              <Pencil className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(employee)} className="text-destructive">
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];


"use client";

import { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
          <Settings2 />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => {
            // Show columns that can be hidden and are not the actions column
            const hasAccessor = column.accessorFn !== undefined || 
                               (column.columnDef as any).accessorKey !== undefined ||
                               column.id !== undefined;
            return hasAccessor && column.getCanHide() && column.id !== "actions";
          })
          .map((column) => {
            const isVisible = column.getIsVisible();
            const columnDef = column.columnDef as any;
            const displayName = column.id
              ? column.id.replace(/_/g, " ").replace(/\./g, " ")
              : columnDef?.header?.toString() || "Column";
            
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={isVisible}
                onCheckedChange={(checked) => {
                  column.toggleVisibility(checked);
                }}
              >
                {displayName}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

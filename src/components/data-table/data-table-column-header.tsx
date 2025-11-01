import * as React from "react";
import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

function getSortIcon(sort: "asc" | "desc" | false | undefined) {
  switch (sort) {
    case "desc":
      return <ArrowDown />;
    case "asc":
      return <ArrowUp />;
    default:
      return <ChevronsUpDown />;
  }
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }
  
  const [isOpen, setIsOpen] = React.useState(false);
  
  const handleToggleSort = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const currentSort = column.getIsSorted();
    if (currentSort === false) {
      column.toggleSorting(false); // Ascending first
    } else if (currentSort === "asc") {
      column.toggleSorting(true); // Descending
    } else {
      column.clearSorting(); // Clear sort
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // If modifier keys are pressed, allow dropdown to open
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return; // Let dropdown handle it
    }
    // Otherwise toggle sort and prevent dropdown
    e.preventDefault();
    e.stopPropagation();
    handleToggleSort(e);
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="data-[state=open]:bg-accent -ml-3 h-8"
            onClick={handleClick}
          >
            <span>{title}</span>
            {getSortIcon(column.getIsSorted())}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="text-muted-foreground/70 h-3.5 w-3.5" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="text-muted-foreground/70 h-3.5 w-3.5" />
            Desc
          </DropdownMenuItem>
          {column.columnDef.enableHiding !== false && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <EyeOff className="text-muted-foreground/70 h-3.5 w-3.5" />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

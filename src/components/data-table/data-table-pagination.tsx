import * as React from "react";
import { Table } from "@tanstack/react-table";
import { ChevronRight, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  
  // Get total rows (filtered, before pagination)
  const totalRows = table.getFilteredRowModel().rows.length;
  
  // Calculate page count
  const pageCount = totalRows > 0 ? Math.ceil(totalRows / pageSize) : 1;
  
  // Ensure pageIndex is valid
  const validPageIndex = Math.max(0, Math.min(pageIndex, Math.max(pageCount - 1, 0)));
  
  // Current page (1-based for display)
  const currentPage = validPageIndex + 1;
  
  // Use table's built-in methods for button states - these are more reliable
  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();
  
  // Debug logging on every render
  console.log('Pagination Render:', {
    pageIndex,
    validPageIndex,
    currentPage,
    pageCount,
    totalRows,
    pageSize,
    canPreviousPage,
    canNextPage,
  });
  
  // Auto-correct page index if out of bounds
  React.useEffect(() => {
    if (totalRows === 0) {
      if (pageIndex !== 0) {
        table.setPageIndex(0);
      }
    } else if (pageIndex >= pageCount && pageCount > 0) {
      table.setPageIndex(Math.max(pageCount - 1, 0));
    }
  }, [totalRows, pageCount, pageIndex, table]);

  const handlePreviousPage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Previous clicked - Before:', { pageIndex, canPreviousPage, pageCount });
    if (canPreviousPage) {
      const newIndex = Math.max(0, pageIndex - 1);
      console.log('Setting pageIndex to:', newIndex);
      table.setPageIndex(newIndex);
      console.log('After setPageIndex:', table.getState().pagination.pageIndex);
    } else {
      console.log('Cannot go to previous page');
    }
  };

  const handleNextPage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Next clicked - Before:', { pageIndex, canNextPage, pageCount });
    if (canNextPage) {
      const newIndex = Math.min(pageCount - 1, pageIndex + 1);
      console.log('Setting pageIndex to:', newIndex);
      table.setPageIndex(newIndex);
      console.log('After setPageIndex:', table.getState().pagination.pageIndex);
    } else {
      console.log('Cannot go to next page');
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 px-4 py-4">
      <Button
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={handlePreviousPage}
        disabled={!canPreviousPage}
        type="button"
      >
        <span className="sr-only">Go to previous page</span>
        <ChevronLeft className="size-4" />
      </Button>
      <div className="flex items-center justify-center text-sm font-medium">
        Page {currentPage} of {pageCount}
      </div>
      <Button
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={handleNextPage}
        disabled={!canNextPage}
        type="button"
      >
        <span className="sr-only">Go to next page</span>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

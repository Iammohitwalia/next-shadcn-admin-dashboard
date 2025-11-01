"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeWithDepartment, Department } from "@/types/employee";
import { getInitials } from "@/lib/utils";
import { supabaseClient } from "@/lib/supabase/client";
import { Label } from "@/components/ui/label";

const employeeSchema = z.object({
  employee_id: z.string().min(1, "Employee ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional().or(z.literal("")),
  department_id: z.string().optional(),
  photo_url: z.string().optional().nullable(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: EmployeeWithDepartment | null;
  departments: Department[];
  onSuccess: () => void;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  departments,
  onSuccess,
}: EmployeeFormDialogProps) {
  const [uploading, setUploading] = useState(false);
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employee_id: "",
      name: "",
      email: "",
      phone_number: "",
      department_id: "",
      photo_url: null,
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        employee_id: employee.employee_id,
        name: employee.name,
        email: employee.email,
        phone_number: employee.phone_number || "",
        department_id: employee.department_id || "",
        photo_url: employee.photo_url || null,
      });
    } else {
      form.reset({
        employee_id: "",
        name: "",
        email: "",
        phone_number: "",
        department_id: "",
        photo_url: null,
      });
    }
  }, [employee, form]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabaseClient.storage.from("strixmedia").upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabaseClient.storage.from("strixmedia").getPublicUrl(filePath);

      form.setValue("photo_url", publicUrl);
      toast.success("Photo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload photo", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      const url = employee ? `/api/employees/${employee.id}` : "/api/employees";
      const method = employee ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          phone_number: data.phone_number || null,
          department_id: data.department_id || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save employee");
      }

      toast.success(employee ? "Employee updated successfully" : "Employee created successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error("Error saving employee", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const photoUrl = form.watch("photo_url");
  const name = form.watch("name");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          <DialogDescription>
            {employee ? "Update employee information" : "Add a new employee to the system"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Photo Upload */}
            <div className="flex items-center gap-6">
              <Avatar className="size-20">
                <AvatarImage src={photoUrl || undefined} alt={name || "Employee"} />
                <AvatarFallback className="text-lg">{getInitials(name || "E")}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <Label htmlFor="photo-upload" className="text-sm font-medium">
                  Profile Photo
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                  {uploading && (
                    <div className="text-muted-foreground text-sm">Uploading...</div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input placeholder="EMP-001" {...field} disabled={!!employee} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+91-9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No Department</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : employee ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


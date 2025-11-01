"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabaseClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";

const FormSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      displayName: "",
      email: "",
    },
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const {
          data: { user },
        } = await supabaseClient.auth.getUser();

        if (user) {
          form.setValue("displayName", user.user_metadata?.full_name || user.user_metadata?.name || "");
          form.setValue("email", user.email || "");
          setAvatarUrl(user.user_metadata?.avatar_url || null);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [form]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setUploading(true);

      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) {
        toast.error("User not found");
        return;
      }

      // Upload to Supabase Storage (if you have storage configured)
      // For now, we'll store as base64 in user metadata
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        const { error } = await supabaseClient.auth.updateUser({
          data: {
            avatar_url: base64String,
            full_name: form.getValues("displayName") || user.user_metadata?.full_name,
            name: form.getValues("displayName") || user.user_metadata?.name,
          },
        });

        if (error) {
          toast.error("Failed to upload image");
          console.error(error);
        } else {
          setAvatarUrl(base64String);
          toast.success("Image uploaded successfully");
        }
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      setUploading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const {
        data: { user },
        error,
      } = await supabaseClient.auth.updateUser({
        email: data.email,
        data: {
          full_name: data.displayName,
          name: data.displayName,
          avatar_url: avatarUrl || undefined,
        },
      });

      if (error) {
        toast.error("Failed to update profile", {
          description: error.message,
        });
        return;
      }

      toast.success("Profile updated successfully!");

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    }
  };

  if (loading) {
    return (
      <div className="@container/main flex flex-col gap-4 md:gap-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const displayName = form.watch("displayName");
  const initials = displayName ? getInitials(displayName) : "?";

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and profile information.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Upload Section */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 rounded-lg">
                <AvatarImage src={avatarUrl || undefined} alt={displayName || "User"} />
                <AvatarFallback className="rounded-lg text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <Button type="button" variant="outline" asChild disabled={uploading}>
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    {uploading ? "Uploading..." : "Upload Image"}
                  </label>
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                <p className="text-muted-foreground text-xs">
                  JPG, PNG or GIF. Max size of 5MB. Or use initials: {initials}
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input id="displayName" type="text" placeholder="John Doe" autoComplete="name" {...field} />
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
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-muted-foreground text-xs">
                    Changing your email will require verification. You&apos;ll receive an email confirmation.
                  </p>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}


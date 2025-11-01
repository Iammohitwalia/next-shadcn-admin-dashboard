import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

const usersToSeed = [
  {
    name: "Sonu Thakur",
    email: "sonu211286@gmail.com",
    password: "Dare2devil1@",
    role: "admin",
  },
  {
    name: "Mohit Walia",
    email: "Mohitwalia5490@gmail.com",
    password: "Dare2devil1@",
    role: "admin",
  },
  {
    name: "Tarun Kumar",
    email: "Tarunkumar211286@gmail.com",
    password: "Dare2devil1@",
    role: "hr",
  },
  {
    name: "strix manager",
    email: "manager@strixdevelopment.net",
    password: "Dare2devil1@",
    role: "manager",
  },
];

export async function POST() {
  try {
    const results = [];

    for (const user of usersToSeed) {
      try {
        // Check if user already exists by listing users
        const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = usersList?.users?.find((u) => u.email === user.email);

        if (existingUser) {
          // Update existing user metadata if name is missing
          if (!existingUser.user_metadata?.name || !existingUser.user_metadata?.full_name) {
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
              existingUser.id,
              {
                user_metadata: {
                  ...existingUser.user_metadata,
                  name: user.name,
                  full_name: user.name,
                  role: user.role,
                },
                app_metadata: {
                  ...existingUser.app_metadata,
                  role: user.role,
                },
              },
            );

            if (updateError) {
              results.push({
                email: user.email,
                status: "error",
                message: `Update failed: ${updateError.message}`,
              });
              continue;
            }

            results.push({
              email: user.email,
              status: "updated",
              message: "User metadata updated successfully",
            });
            continue;
          }

          results.push({
            email: user.email,
            status: "skipped",
            message: "User already exists",
          });
          continue;
        }

        // Create user with email verified
        const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true, // Email verified
          user_metadata: {
            name: user.name,
            full_name: user.name,
            role: user.role,
          },
          app_metadata: {
            role: user.role,
          },
        });

        if (error) {
          results.push({
            email: user.email,
            status: "error",
            message: error.message,
          });
          continue;
        }

        // Store role in a custom table (if you have one) or keep in metadata
        // For now, we'll store role in user_metadata which is accessible

        results.push({
          email: user.email,
          status: "success",
          message: "User created successfully",
          userId: newUser?.user?.id,
        });
      } catch (error) {
        results.push({
          email: user.email,
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Seeding completed",
        results,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to seed users",
      },
      { status: 500 },
    );
  }
}


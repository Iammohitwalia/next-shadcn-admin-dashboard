import { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import { APP_CONFIG } from "@/config/app-config";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main>
      <div className="grid h-dvh justify-center p-2 lg:grid-cols-2">
        <div className="bg-primary relative order-2 hidden h-full rounded-3xl lg:flex">
          <div className="text-primary-foreground absolute top-10 space-y-1 px-10">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-primary-foreground/20 text-primary-foreground text-2xl font-bold">
              S
            </div>
            <h1 className="text-2xl font-medium">{APP_CONFIG.name}</h1>
            <p className="text-sm">Innovate. Elevate. Accelerate.</p>
          </div>

          <div className="absolute bottom-10 flex w-full justify-between px-10">
            <div className="text-primary-foreground flex-1 space-y-1">
              <h2 className="font-medium">Transform Your Vision</h2>
              <p className="text-sm">
                Turn your ideas into powerful, result-driven digital solutions with our expert team.
              </p>
            </div>
            <Separator orientation="vertical" className="mx-3 !h-auto" />
            <div className="text-primary-foreground flex-1 space-y-1">
              <h2 className="font-medium">Get Started Today</h2>
              <p className="text-sm">
                We deliver services 1.8x faster with cutting-edge technology and strategic solutions.
              </p>
            </div>
          </div>
        </div>
        <div className="relative order-1 flex h-full">{children}</div>
      </div>
    </main>
  );
}


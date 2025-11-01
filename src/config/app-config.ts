import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Strix Management",
  version: packageJson.version,
  copyright: `© ${currentYear}, Strix Management.`,
  meta: {
    title: "Strix Management - Modern Next.js Dashboard Starter Template",
    description:
      "Strix Management is a modern, open-source dashboard starter template built with Next.js 16, Tailwind CSS v4, and shadcn/ui. Perfect for SaaS apps, admin panels, and internal tools—fully customizable and production-ready.",
  },
};

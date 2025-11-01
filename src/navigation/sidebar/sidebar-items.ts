import {
  Fingerprint,
  LayoutDashboard,
  ChartBar,
  Banknote,
  Home,
  Users,
  Building,
  Calendar,
  Star,
  UserPlus,
  Folder,
  CheckSquare,
  Paperclip,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        title: "Overview",
        url: "/dashboard/overview",
        icon: Home,
      },
    ],
  },
  {
    id: 2,
    label: "Employees",
    items: [
      {
        title: "All Employees",
        url: "/dashboard/employees",
        icon: Users,
      },
      {
        title: "Departments",
        url: "/dashboard/employees/departments",
        icon: Building,
      },
      {
        title: "Leave Management",
        url: "/dashboard/employees/leave",
        icon: Calendar,
      },
      {
        title: "Performance Reviews",
        url: "/dashboard/employees/performance",
        icon: Star,
      },
      {
        title: "Recruitment / Hiring",
        url: "/dashboard/employees/recruitment",
        icon: UserPlus,
      },
    ],
  },
  {
    id: 3,
    label: "Projects",
    items: [
      {
        title: "All Projects",
        url: "/dashboard/projects",
        icon: Folder,
      },
      {
        title: "Tasks / To-Do",
        url: "/dashboard/projects/tasks",
        icon: CheckSquare,
      },
      {
        title: "Documents / Files",
        url: "/dashboard/projects/documents",
        icon: Paperclip,
      },
      {
        title: "Assigned Teams",
        url: "/dashboard/projects/teams",
        icon: UsersRound,
      },
    ],
  },
  {
    id: 4,
    label: "Settings",
    items: [
      {
        title: "Users",
        url: "/dashboard/settings/users",
        icon: Fingerprint,
      },
    ],
  },
];

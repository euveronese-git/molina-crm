import {
  LayoutDashboard,
  Kanban,
  Building2,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/empreendimentos", label: "Empreendimentos", icon: Building2 },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
];

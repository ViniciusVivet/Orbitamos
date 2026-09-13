"use client";

import PortalSidebar, { type PortalSidebarProps } from "@/components/portal/PortalSidebar";

export default function ColaboradorSidebar(props: PortalSidebarProps) {
  return <PortalSidebar {...props} mode="work" />;
}

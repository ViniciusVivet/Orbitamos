"use client";

import PortalSidebar, { type PortalSidebarProps } from "@/components/portal/PortalSidebar";

export default function EstudanteSidebar(props: PortalSidebarProps) {
  return <PortalSidebar {...props} mode="student" />;
}

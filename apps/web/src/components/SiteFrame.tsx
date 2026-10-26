"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Navigation from "./Navigation";
import { isWorkspacePath } from "@/lib/portalNavigation";

const CursorOrbit = dynamic(() => import("./CursorOrbit"));
const ForumWidget = dynamic(() => import("./ForumWidget"));
const FloatingChat = dynamic(() => import("./chat/FloatingChat"));

export default function SiteFrame({ children }: { children: ReactNode }) {
  const workspace = isWorkspacePath(usePathname());
  return <>
    {!workspace && <><CursorOrbit/><Navigation/><ForumWidget/><FloatingChat/></>}
    <main data-site-context={workspace ? "workspace" : "commercial"} className={`${workspace ? "" : "pt-16 "}min-w-0 overflow-x-clip`}>{children}</main>
  </>;
}

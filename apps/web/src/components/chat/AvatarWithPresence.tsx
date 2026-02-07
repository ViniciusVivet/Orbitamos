"use client";

import { getDisplayAvatarUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 min

function isOnline(lastSeenAt: string | null | undefined): boolean {
  if (!lastSeenAt) return false;
  const d = new Date(lastSeenAt);
  return Date.now() - d.getTime() < ONLINE_THRESHOLD_MS;
}

function lastSeenLabel(lastSeenAt: string | null | undefined): string {
  if (!lastSeenAt) return "Offline";
  if (isOnline(lastSeenAt)) return "Online";
  const d = new Date(lastSeenAt);
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `Offline há ${diffMins} min`;
  if (diffHours < 24) return `Offline há ${diffHours}h`;
  if (diffDays < 7) return `Offline há ${diffDays} dia${diffDays !== 1 ? "s" : ""}`;
  return `Offline em ${d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`;
}

interface AvatarWithPresenceProps {
  avatarUrl?: string | null;
  name: string;
  lastSeenAt?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const dotSizes = {
  sm: "h-2 w-2 bottom-0 right-0 ring-2 ring-black",
  md: "h-2.5 w-2.5 bottom-0 right-0 ring-2 ring-black",
  lg: "h-3 w-3 bottom-0 right-0 ring-2 ring-black",
};

export default function AvatarWithPresence({
  avatarUrl,
  name,
  lastSeenAt,
  size = "md",
  className,
}: AvatarWithPresenceProps) {
  const online = isOnline(lastSeenAt);
  const label = lastSeenLabel(lastSeenAt);
  const avatarSize = sizeClasses[size];
  const dotSize = dotSizes[size];

  return (
    <div
      className={cn("relative shrink-0 rounded-full overflow-hidden ring-2 ring-white/10", avatarSize, className)}
      title={label}
    >
      {getDisplayAvatarUrl(avatarUrl) ? (
        <img src={getDisplayAvatarUrl(avatarUrl)!} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orbit-electric to-orbit-purple text-black font-bold text-lg">
          {(name ?? "?").slice(0, 1).toUpperCase()}
        </span>
      )}
      <span
        className={cn(
          "absolute rounded-full ring-black",
          dotSize,
          online ? "bg-green-500" : "bg-red-500"
        )}
        aria-hidden
      />
    </div>
  );
}

"use client";

import { useState, useCallback, useRef, useEffect } from "react";

const CLAMP_PADDING = 16;
function loadPosition(key: string, defaultRight: number, defaultBottom: number) {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as { right?: number; bottom?: number };
      if (
        typeof parsed?.right === "number" &&
        typeof parsed?.bottom === "number" &&
        parsed.right >= 0 &&
        parsed.bottom >= 0
      ) {
        return { right: parsed.right, bottom: parsed.bottom };
      }
    }
  } catch {
    // keep default
  }
  return { right: defaultRight, bottom: defaultBottom };
}

export function useDraggablePosition(
  storageKey: string,
  defaultRight: number,
  defaultBottom: number
) {
  const key = storageKey;
  const [position, setPosition] = useState<{ right: number; bottom: number }>(() =>
    loadPosition(key, defaultRight, defaultBottom)
  );

  const lastDraggedRef = useRef<{ right: number; bottom: number }>(position);

  useEffect(() => {
    setPosition(loadPosition(key, defaultRight, defaultBottom));
  }, [key, defaultRight, defaultBottom]);

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const startRight = position.right;
      const startBottom = position.bottom;

      const onMove = (ev: MouseEvent) => {
        const deltaX = ev.clientX - startX;
        const deltaY = ev.clientY - startY;
        let newRight = startRight - deltaX;
        let newBottom = startBottom - deltaY;
        const maxRight = typeof window !== "undefined" ? window.innerWidth - CLAMP_PADDING : 400;
        const maxBottom = typeof window !== "undefined" ? window.innerHeight - CLAMP_PADDING : 300;
        newRight = Math.max(CLAMP_PADDING, Math.min(maxRight, newRight));
        newBottom = Math.max(CLAMP_PADDING, Math.min(maxBottom, newBottom));
        lastDraggedRef.current = { right: newRight, bottom: newBottom };
        setPosition(lastDraggedRef.current);
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        try {
          if (typeof window !== "undefined") {
            const { right, bottom } = lastDraggedRef.current;
            localStorage.setItem(key, JSON.stringify({ right, bottom }));
          }
        } catch {
          // ignore
        }
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [key, position]
  );

  const positionStyle: React.CSSProperties = {
    right: position.right,
    bottom: position.bottom,
    left: "auto",
    top: "auto",
  };

  return { positionStyle, startDrag };
}

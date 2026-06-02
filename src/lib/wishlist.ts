"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth/useAuth";

const STORAGE_KEY = "madashop_wishlist";

function loadLocalIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveLocalIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useWishlist() {
  const { user, loading: authLoading } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  // Track whether we've loaded remote wishlist for the current user
  const loadedForEmail = useRef<string | null>(null);

  // Load wishlist: remote if logged in, local otherwise
  useEffect(() => {
    if (authLoading) return;

    if (user?.email) {
      // Already loaded for this user — skip
      if (loadedForEmail.current === user.email) return;
      loadedForEmail.current = user.email;

      fetch("/api/user/wishlist")
        .then((r) => r.json())
        .then((data: { productIds?: string[] }) => {
          setIds(data.productIds ?? []);
        })
        .catch(() => setIds([]));
    } else {
      loadedForEmail.current = null;
      setIds(loadLocalIds());
    }
  }, [user, authLoading]);

  const toggle = useCallback(
    (productId: string) => {
      if (user?.email) {
        // Optimistic update
        setIds((prev) => {
          const removing = prev.includes(productId);
          const next = removing
            ? prev.filter((id) => id !== productId)
            : [...prev, productId];

          // Fire-and-forget API call
          if (removing) {
            fetch("/api/user/wishlist", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId }),
            }).catch(() => {
              // Revert on error
              setIds((cur) => (cur.includes(productId) ? cur : [...cur, productId]));
            });
          } else {
            fetch("/api/user/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId }),
            }).catch(() => {
              // Revert on error
              setIds((cur) => cur.filter((id) => id !== productId));
            });
          }

          return next;
        });
      } else {
        setIds((prev) => {
          const next = prev.includes(productId)
            ? prev.filter((id) => id !== productId)
            : [...prev, productId];
          saveLocalIds(next);
          return next;
        });
      }
    },
    [user]
  );

  const has = useCallback((productId: string) => ids.includes(productId), [ids]);

  return { ids, toggle, has };
}

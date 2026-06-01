"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "madashop_wishlist";

function loadIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(loadIds());
  }, []);

  const toggle = useCallback((productId: string) => {
    setIds((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      saveIds(next);
      return next;
    });
  }, []);

  const has = useCallback((productId: string) => ids.includes(productId), [ids]);

  return { ids, toggle, has };
}

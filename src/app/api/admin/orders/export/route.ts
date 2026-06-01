import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

function escape(val: unknown): string {
  const s = val == null ? "" : String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function row(cells: unknown[]): string {
  return cells.map(escape).join(",");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-MG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export async function GET() {
  const { data: ordersData, error } = await supabase
    .from("Order")
    .select(`
      orderNo, type, status, totalAmount, depositAmount,
      promoCode, discountMGA, createdAt,
      user:User(name, phone, email)
    `)
    .order("createdAt", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orders = ordersData ?? [];

  const headers = [
    "N° commande", "Client", "Téléphone", "Email",
    "Type", "Statut", "Total (Ar)", "Acompte (Ar)", "Solde (Ar)",
    "Code promo", "Réduction (Ar)", "Date",
  ];

  const lines: string[] = [row(headers)];

  for (const o of orders) {
    const user = o.user as { name?: string; phone?: string; email?: string } | null;
    const total = Number(o.totalAmount ?? 0);
    const deposit = Number(o.depositAmount ?? 0);
    const balance = Math.max(total - deposit, 0);
    lines.push(row([
      o.orderNo,
      user?.name ?? "",
      user?.phone ?? "",
      user?.email ?? "",
      o.type,
      o.status,
      o.totalAmount,
      o.depositAmount,
      balance,
      (o as Record<string, unknown>).promoCode ?? "",
      (o as Record<string, unknown>).discountMGA ?? "",
      formatDate(o.createdAt),
    ]));
  }

  const csv = lines.join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="commandes-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

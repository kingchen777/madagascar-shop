import { NextRequest, NextResponse } from "next/server";

interface AgentInquiryBody {
  url: string;
  name?: string;
  spec?: string;
  qty: number;
  notes?: string;
  contact: string;
  locale?: string;
}

function generateInquiryNo(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `AG-${date}-${suffix}`;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { url, name, spec, qty, notes, contact } = body as AgentInquiryBody;

  if (!url?.trim() || !contact?.trim()) {
    return NextResponse.json(
      { error: "url and contact are required" },
      { status: 400 }
    );
  }

  const inquiryNo = generateInquiryNo();
  const inquiryId = `inq-${Date.now()}`;

  // TODO (DB): await db.order.create({
  //   data: {
  //     id: inquiryId, orderNo: inquiryNo,
  //     type: "AGENT", status: "DRAFT",
  //     sourceUrl: url, agentNotes: `${spec ?? ""}\n${notes ?? ""}`.trim(),
  //     customerContact: contact,
  //     items: { create: [{ qty: qty ?? 1, productName: name ?? url }] },
  //   }
  // });

  console.log("[Agent Inquiry]", { inquiryId, inquiryNo, url, name, spec, qty, contact, notes });

  return NextResponse.json({ inquiryId, inquiryNo, status: "DRAFT" });
}

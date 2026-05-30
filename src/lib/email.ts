import { Resend } from "resend";

function formatMGA(n: number) {
  return new Intl.NumberFormat("fr-MG", { maximumFractionDigits: 0 }).format(n) + " Ar";
}

interface OrderEmailData {
  to: string;
  customerName: string;
  orderNo: string;
  items: { name: string; qty: number; priceMGA: number }[];
  totalMGA: number;
  depositMGA: number;
  paymentMethod: string;
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return;
  const resend = new Resend(process.env.RESEND_API_KEY);

  const itemRows = data.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #f3f4f6">${i.name} ×${i.qty}</td>
         <td style="padding:6px 0;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:600">${formatMGA(i.priceMGA * i.qty)}</td></tr>`
    )
    .join("");

  const paymentLabel: Record<string, string> = {
    mvola: "MVola",
    orange_money: "Orange Money",
    bank_transfer: "Virement bancaire / Paiement manuel",
  };

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:system-ui,sans-serif;background:#f9fafb">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#f59e0b;padding:28px 32px">
      <h1 style="margin:0;color:#ffffff;font-size:20px">MadaShop</h1>
      <p style="margin:4px 0 0;color:#fef3c7;font-size:14px">Confirmation de commande</p>
    </div>
    <div style="padding:28px 32px">
      <p style="margin:0 0 8px;color:#374151">Bonjour <strong>${data.customerName}</strong>,</p>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px">Votre commande a bien été reçue. Nous vous contacterons sous 24h pour confirmer le paiement.</p>

      <div style="background:#f9fafb;border-radius:10px;padding:16px 20px;margin-bottom:20px">
        <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em">N° de commande</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#92400e;font-family:monospace">${data.orderNo}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <tbody>${itemRows}</tbody>
      </table>

      <div style="border-top:2px solid #f59e0b;padding-top:12px;display:flex;justify-content:space-between">
        <span style="font-weight:600;color:#111827">Total</span>
        <span style="font-weight:700;color:#92400e">${formatMGA(data.totalMGA)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:6px">
        <span style="color:#6b7280;font-size:14px">Acompte requis (30%)</span>
        <span style="font-weight:600;color:#d97706;font-size:14px">${formatMGA(data.depositMGA)}</span>
      </div>

      <div style="margin-top:20px;background:#fffbeb;border-radius:10px;padding:14px 16px;font-size:13px;color:#92400e">
        <strong>Mode de paiement choisi :</strong> ${paymentLabel[data.paymentMethod] ?? data.paymentMethod}<br>
        Envoyez l'acompte et partagez le justificatif pour valider votre commande.
      </div>

      <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;text-align:center">
        MadaShop · Antananarivo, Madagascar · <a href="mailto:contact@madashop.mg" style="color:#f59e0b">contact@madashop.mg</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: data.to,
    subject: `Commande confirmée — ${data.orderNo} | MadaShop`,
    html,
  });
}

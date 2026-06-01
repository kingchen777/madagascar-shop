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
        <span style="color:#6b7280;font-size:14px">Acompte requis (${Math.round((data.depositMGA / data.totalMGA) * 100)}%)</span>
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

interface StatusUpdateData {
  to: string;
  customerName: string;
  orderNo: string;
  newStatus: string;
  balanceDue?: number;
  orderUrl: string;
}

const STATUS_CONFIG: Record<string, { subject: string; headline: string; body: string; accentColor: string }> = {
  DEPOSIT_PAID: {
    subject: "Acompte reçu — votre commande est confirmée",
    headline: "Acompte reçu !",
    body: "Votre paiement d'acompte a bien été reçu et validé. Nous commençons le traitement de votre commande.",
    accentColor: "#10b981",
  },
  PROCURING: {
    subject: "Commande en cours d'achat",
    headline: "Achat en cours",
    body: "Votre commande est en cours d'achat auprès de nos fournisseurs en Chine.",
    accentColor: "#8b5cf6",
  },
  AT_CN_WAREHOUSE: {
    subject: "Commande arrivée à l'entrepôt en Chine",
    headline: "Arrivée à l'entrepôt",
    body: "Votre commande est arrivée à notre entrepôt en Chine et est en attente d'expédition internationale.",
    accentColor: "#6366f1",
  },
  BALANCE_PENDING: {
    subject: "Solde requis pour expédier votre commande",
    headline: "Règlement du solde requis",
    body: "Votre commande est prête à être expédiée. Merci de régler le solde restant pour lancer l'expédition internationale.",
    accentColor: "#f59e0b",
  },
  BALANCE_PAID: {
    subject: "Solde reçu — expédition en cours",
    headline: "Solde reçu !",
    body: "Votre règlement du solde a été validé. Votre commande est en cours d'expédition.",
    accentColor: "#10b981",
  },
  INTL_SHIPPING: {
    subject: "Votre commande est en transit",
    headline: "En route vers Madagascar !",
    body: "Votre commande a quitté la Chine et est en transit international vers Madagascar.",
    accentColor: "#06b6d4",
  },
  ARRIVED_MG: {
    subject: "Votre commande est arrivée à Madagascar",
    headline: "Arrivée à Madagascar",
    body: "Votre commande est arrivée à Madagascar et est en cours de dédouanement. Nous vous préviendrons dès qu'elle sera disponible.",
    accentColor: "#14b8a6",
  },
  READY_FOR_PICKUP: {
    subject: "Votre commande est prête à retirer",
    headline: "Prête à retirer !",
    body: "Votre commande est disponible. Vous pouvez venir la retirer à notre bureau. Munissez-vous de votre numéro de commande.",
    accentColor: "#22c55e",
  },
  COMPLETED: {
    subject: "Commande terminée — merci !",
    headline: "Commande terminée",
    body: "Votre commande a été clôturée. Merci de votre confiance et à bientôt sur MadaShop !",
    accentColor: "#22c55e",
  },
  CANCELLED: {
    subject: "Commande annulée",
    headline: "Commande annulée",
    body: "Votre commande a été annulée. Si vous avez des questions, n'hésitez pas à nous contacter.",
    accentColor: "#ef4444",
  },
};

export async function sendStatusUpdate(data: StatusUpdateData): Promise<void> {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return;
  const config = STATUS_CONFIG[data.newStatus];
  if (!config) return; // no email for this status

  const resend = new Resend(process.env.RESEND_API_KEY);

  const balanceBlock = data.balanceDue && data.balanceDue > 0
    ? `<div style="margin-top:16px;background:#fffbeb;border-radius:10px;padding:14px 16px;font-size:13px;color:#92400e">
        <strong>Solde restant à régler :</strong> ${formatMGA(data.balanceDue)}<br>
        Envoyez le montant via MVola ou Orange Money et partagez le justificatif.
      </div>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:system-ui,sans-serif;background:#f9fafb">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:${config.accentColor};padding:28px 32px">
      <h1 style="margin:0;color:#ffffff;font-size:20px">MadaShop</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:14px">${config.headline}</p>
    </div>
    <div style="padding:28px 32px">
      <p style="margin:0 0 8px;color:#374151">Bonjour <strong>${data.customerName}</strong>,</p>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px">${config.body}</p>

      <div style="background:#f9fafb;border-radius:10px;padding:16px 20px;margin-bottom:20px">
        <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em">N° de commande</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#92400e;font-family:monospace">${data.orderNo}</p>
      </div>

      ${balanceBlock}

      <div style="margin-top:24px;text-align:center">
        <a href="${data.orderUrl}" style="display:inline-block;background:${config.accentColor};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600">
          Suivre ma commande →
        </a>
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
    subject: `${config.subject} — ${data.orderNo} | MadaShop`,
    html,
  });
}

// src/components/PayWithAffirm.tsx
import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { loadAffirm } from "../lib/affirm";

/**
 * PayWithAffirm: crea y envía un <form> con los campos que Affirm espera.
 * - NO usa fetch al backend para crear checkout: emula exactamente el POST que veías en Network (checkout/).
 * - Si tu app luego intercepta el POST para enviar a Affirm, esto funciona igual (rellena los campos).
 *
 * IMPORTANTE: asegúrate de tener VITE_AFFIRM_PUBLIC_KEY en .env.local antes de probar.
 */

const toCents = (n: number) => Math.round(n * 100);

export default function PayWithAffirm() {
  const { items, totalUSD, clear } = useCart();
  const [busy, setBusy] = useState(false);

  // Form state local (puedes enlazar estos inputs al UI que ya tenés)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("US");

  const currentUrl = typeof window !== "undefined" ? window.location.href : "/";

  async function handlePay(e?: React.MouseEvent) {
    if (e) e.preventDefault();
    if (!items || items.length === 0 || !totalUSD) return;

    setBusy(true);

    // Load Affirm script (no-op if ya está cargado)
    await loadAffirm((import.meta as any).env.VITE_AFFIRM_PUBLIC_KEY);

    // Validación mínima
    if (!firstName || !lastName || !email) {
      // Puedes reemplazar por tu toast / modal
      alert("Completa nombre y email para probar Affirm (puede rechazarse si son ficticios).");
      setBusy(false);
      return;
    }

    try {
      // Construir un formulario hidden y enviarlo.
      // Endpoint: usamos 'checkout/' como en tu proyecto (si tu app usa otro, cámbialo)
      const action = "/checkout/"; // deja como en tu proyecto; si usas el checkout de affirm directo, cámbialo.
      const form = document.createElement("form");
      form.method = "POST";
      form.action = action;
      form.style.display = "none";

      // Datos merchant mínimos que vimos en tus screenshots:
      const publicKey = (import.meta as any).env.VITE_AFFIRM_PUBLIC_KEY || "";
      form.appendChild(makeInput("merchant[public_api_key]", publicKey));
      form.appendChild(makeInput("merchant[user_confirmation_url]", `${window.location.origin}/affirm/confirm`));
      form.appendChild(makeInput("merchant[user_cancel_url]", `${window.location.origin}/affirm/cancel`));
      form.appendChild(makeInput("merchant[user_confirmation_url_action]", "GET"));
      // optional merchant name
      form.appendChild(makeInput("merchant[name][full]", (document.title || "Merchant").slice(0, 60)));

      // Meta fields (optional)
      form.appendChild(makeInput("meta[locale]", "en_US"));
      form.appendChild(makeInput("meta[user_timezone]", Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"));

      // Items: convierte cada item al formato items[index][field]
      items.forEach((it: any, i: number) => {
        const idx = String(i);
        form.appendChild(makeInput(`items[${idx}][display_name]`, String(it.name || it.display_name || "Item")));
        form.appendChild(makeInput(`items[${idx}][sku]`, String(it.sku || it.id || idx)));
        // Affirm espera unit_price en centavos
        const unit_price = toCents(Number(it.price || it.unit_price || 0));
        form.appendChild(makeInput(`items[${idx}][unit_price]`, String(unit_price)));
        form.appendChild(makeInput(`items[${idx}][qty]`, String(Number(it.qty || 1))));
        form.appendChild(makeInput(`items[${idx}][item_url]`, it.url || currentUrl));
      });

      // Billing fields (muy importantes para evitar John Doe)
      form.appendChild(makeInput("billing[name][first]", firstName));
      form.appendChild(makeInput("billing[name][last]", lastName));
      form.appendChild(makeInput("billing[email]", email));
      form.appendChild(makeInput("billing[phone]", phone || ""));
      form.appendChild(makeInput("billing[address][line1]", addressLine));
      form.appendChild(makeInput("billing[address][city]", city));
      form.appendChild(makeInput("billing[address][state]", state));
      form.appendChild(makeInput("billing[address][zipcode]", zip));
      form.appendChild(makeInput("billing[address][country]", country));

      // Totales / montos
      const totalCents = toCents(Number(totalUSD || 0));
      form.appendChild(makeInput("total_amount", String(totalCents))); // si tu endpoint lo usa
      form.appendChild(makeInput("total_cents", String(totalCents)));

      // Agrego el form a body y submit
      document.body.appendChild(form);

      // Antes de submit: registra el listener en network devtools o logs
      // En tu flow, el endpoint puede devolver error si key inválida; eso lo verás en Network -> checkout/

      form.submit();

      // No clear hasta confirmar por webhook / netlify fn; pero puedes limpiar el carrito si quieres.
      // clear();

    } catch (err) {
      console.error("[PayWithAffirm] error", err);
      alert("Error al crear checkout Affirm (mira console para más detalles).");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* small form — puedes adaptar estilos a tu UI */}
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="First name" className="p-2 rounded" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input placeholder="Last name" className="p-2 rounded" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <input placeholder="Email" className="p-2 rounded col-span-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Phone" className="p-2 rounded col-span-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input placeholder="Address" className="p-2 rounded col-span-2" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
        <input placeholder="City" className="p-2 rounded" value={city} onChange={(e) => setCity(e.target.value)} />
        <input placeholder="State" className="p-2 rounded" value={state} onChange={(e) => setState(e.target.value)} />
        <input placeholder="ZIP" className="p-2 rounded" value={zip} onChange={(e) => setZip(e.target.value)} />
        <input placeholder="Country" className="p-2 rounded" value={country} onChange={(e) => setCountry(e.target.value)} />
      </div>

      <button
        onClick={handlePay}
        disabled={busy || items.length === 0 || !totalUSD}
        className="w-full bg-white/10 text-black px-4 py-3 rounded-lg font-bold disabled:opacity-50"
      >
        {busy ? "Processing..." : "Pay with Affirm"}
      </button>
    </div>
  );
}

function makeInput(name: string, value: any) {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  input.value = value == null ? "" : String(value);
  return input;
}

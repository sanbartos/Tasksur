// services/payment.service.ts

type PaymentPayload = {
  planId: string
  userId: string
}

export async function startCheckout(payload: PaymentPayload) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Error al iniciar checkout")
  }

  return res.json()
}

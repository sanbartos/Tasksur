// services/contact.service.ts

type ContactFormData = {
  name: string
  email: string
  subject?: string
  message: string
}

export async function sendContactMessage(data: ContactFormData) {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const json = await res.json()

    if (!res.ok) {
      throw new Error(json.error || "Error al enviar el mensaje")
    }

    return json
  } catch (error) {
    console.error("Contact service error:", error)
    throw error
  }
}

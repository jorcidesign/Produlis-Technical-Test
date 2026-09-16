"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

export type ActionResult = { error?: string };

export async function createCustomer(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  try {
    const res = await fetch(`${API_URL}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body?.message ?? "Error al crear el cliente." };
    }

    updateTag("customers");
  } catch {
    return { error: "No se pudo conectar con el servidor." };
  }

  redirect("/customers");
}

export async function updateCustomer(
  id: number,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  try {
    const res = await fetch(`${API_URL}/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body?.message ?? "Error al actualizar el cliente." };
    }

    updateTag("customers");
  } catch {
    return { error: "No se pudo conectar con el servidor." };
  }

  redirect("/customers");
}

export async function toggleCustomerActive(
  id: number,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const res = await fetch(`${API_URL}/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body?.message ?? "Error al cambiar el estado." };
    }

    updateTag("customers");
    return {};
  } catch {
    return { error: "No se pudo conectar con el servidor." };
  }
}

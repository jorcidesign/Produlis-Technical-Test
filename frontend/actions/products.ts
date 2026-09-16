"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

export type ActionResult = { error?: string };

export async function createProduct(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);

  if (!name || isNaN(price) || price <= 0) {
    return { error: "Nombre y precio válido son requeridos." };
  }

  try {
    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body?.message ?? "Error al crear el producto." };
    }

    updateTag("products");
  } catch {
    return { error: "No se pudo conectar con el servidor." };
  }

  redirect("/products");
}

export async function updateProduct(
  id: number,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);

  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body?.message ?? "Error al actualizar el producto." };
    }

    updateTag("products");
  } catch {
    return { error: "No se pudo conectar con el servidor." };
  }

  redirect("/products");
}

export async function toggleProductActive(
  id: number,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body?.message ?? "Error al cambiar el estado." };
    }

    updateTag("products");
    return {};
  } catch {
    return { error: "No se pudo conectar con el servidor." };
  }
}

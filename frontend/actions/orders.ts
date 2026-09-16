"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { OrderStatus } from "@/services/api";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

export type ActionResult = { error?: string };

export interface OrderItemInput {
  product_id: number;
  quantity: number;
}

export async function createOrder(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const customer_id = parseInt(formData.get("customer_id") as string, 10);
  const itemsRaw = formData.get("items") as string;

  if (isNaN(customer_id)) {
    return { error: "Selecciona un cliente." };
  }

  let items: OrderItemInput[] = [];
  try {
    items = JSON.parse(itemsRaw) as OrderItemInput[];
  } catch {
    return { error: "Los ítems de la orden no son válidos." };
  }

  if (!items.length) {
    return { error: "Agrega al menos un producto a la orden." };
  }

  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id, items }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body?.message ?? "Error al crear la orden." };
    }

    const created = await res.json();
    updateTag("orders");
    redirect(`/orders/${created.id}`);
  } catch (err) {
    // redirect throws internally, re-throw it
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { error: "No se pudo conectar con el servidor." };
  }

  return {};
}

export async function changeOrderStatus(
  id: number,
  status: OrderStatus
): Promise<ActionResult> {
  try {
    const res = await fetch(`${API_URL}/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body?.message ?? "Error al cambiar el estado." };
    }

    updateTag("orders");
    return {};
  } catch {
    return { error: "No se pudo conectar con el servidor." };
  }
}

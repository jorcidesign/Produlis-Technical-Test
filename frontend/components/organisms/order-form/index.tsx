"use client";

import { useState, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/atoms/select";
import type { Customer, Product } from "@/services/api";
import type { ActionResult } from "@/actions/orders";

interface OrderItem {
  product_id: number;
  quantity: number;
  product_name: string;
  unit_price: number;
}

interface OrderFormProps {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  customers: Customer[];
  products: Product[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creando orden..." : "Crear orden"}
    </Button>
  );
}

const fmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export function OrderForm({ action, customers, products }: OrderFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, {});
  const [items, setItems] = useState<OrderItem[]>([
    { product_id: 0, quantity: 1, product_name: "", unit_price: 0 },
  ]);
  const [customerId, setCustomerId] = useState("");

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { product_id: 0, quantity: 1, product_name: "", unit_price: 0 },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof OrderItem, value: string | number) {
    setItems((prev) => {
      const next = [...prev];
      if (field === "product_id") {
        const product = products.find((p) => p.id === Number(value));
        next[index] = {
          ...next[index],
          product_id: Number(value),
          product_name: product?.name ?? "",
          unit_price: product?.price ?? 0,
        };
      } else if (field === "quantity") {
        next[index] = { ...next[index], quantity: Math.max(1, Number(value)) };
      }
      return next;
    });
  }

  const previewTotal = items.reduce(
    (sum, it) => sum + it.unit_price * it.quantity,
    0
  );

  const validItems = items.filter((it) => it.product_id > 0 && it.quantity > 0);

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {/* Hidden inputs */}
      <input type="hidden" name="customer_id" value={customerId} />
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          validItems.map(({ product_id, quantity }) => ({ product_id, quantity }))
        )}
      />

      {/* Customer select */}
      <div className="space-y-1.5">
        <Label htmlFor="customer">Cliente *</Label>
        <Select
          value={customerId}
          onValueChange={(v) => setCustomerId(v ?? "")}
        >
          <SelectTrigger id="customer" aria-label="Cliente" className="w-full">
            <SelectValue placeholder="Selecciona un cliente" />
          </SelectTrigger>
          <SelectContent>
            {customers
              .filter((c) => c.is_active)
              .map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name} — {c.email}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items */}
      <div className="space-y-3">
        <Label>Productos *</Label>
        {items.map((item, i) => (
          <div key={i} className="flex items-end gap-3">
            <div className="flex-1">
              <Select
                value={item.product_id ? String(item.product_id) : ""}
                onValueChange={(v) => updateItem(i, "product_id", v ?? "")}
              >
                <SelectTrigger className="w-full" aria-label="Producto">
                  <SelectValue placeholder="Selecciona producto" />
                </SelectTrigger>
                <SelectContent>
                  {products
                    .filter((p) => p.is_active)
                    .map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name} — {fmt.format(p.price)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateItem(i, "quantity", e.target.value)}
                placeholder="Cant."
                aria-label="Cantidad"
              />
            </div>
            {item.product_id > 0 && (
              <div className="w-28 text-sm text-muted-foreground text-right pb-1.5">
                {fmt.format(item.unit_price * item.quantity)}
              </div>
            )}
            {items.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeItem(i)}
                aria-label="Eliminar línea"
              >
                ✕
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          + Agregar producto
        </Button>
      </div>

      {/* Preview total */}
      {previewTotal > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            Total estimado (referencia visual — el total real lo calcula el
            servidor):
          </p>
          <p className="text-xl font-semibold mt-1">{fmt.format(previewTotal)}</p>
        </div>
      )}

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <div className="flex gap-3">
        <SubmitButton />
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/orders")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { InputField } from "@/components/molecules/input-field";
import type { Product } from "@/services/api";
import type { ActionResult } from "@/actions/products";

interface ProductFormProps {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  product?: Product;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : label}
    </Button>
  );
}

export function ProductForm({ action, product }: ProductFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, {});

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-5 max-w-md">
      <InputField
        label="Nombre del producto"
        name="name"
        required
        defaultValue={product?.name ?? ""}
        placeholder="Ej. Camiseta básica"
        error={undefined}
      />
      <InputField
        label="Precio"
        name="price"
        type="number"
        required
        min={0.01}
        step={0.01}
        defaultValue={product?.price?.toString() ?? ""}
        placeholder="0.00"
        error={undefined}
      />
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <div className="flex gap-3 pt-2">
        <SubmitButton label={product ? "Guardar cambios" : "Crear producto"} />
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/products")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

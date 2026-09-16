"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { InputField } from "@/components/molecules/input-field";
import type { Customer } from "@/services/api";
import type { ActionResult } from "@/actions/customers";

interface CustomerFormProps {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  customer?: Customer;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : label}
    </Button>
  );
}

export function CustomerForm({ action, customer }: CustomerFormProps) {
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
        label="Nombre"
        name="name"
        required
        defaultValue={customer?.name ?? ""}
        placeholder="Nombre completo del cliente"
        error={undefined}
      />
      <InputField
        label="Email"
        name="email"
        type="email"
        required
        defaultValue={customer?.email ?? ""}
        placeholder="email@ejemplo.com"
        error={undefined}
      />
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <div className="flex gap-3 pt-2">
        <SubmitButton label={customer ? "Guardar cambios" : "Crear cliente"} />
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/customers")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

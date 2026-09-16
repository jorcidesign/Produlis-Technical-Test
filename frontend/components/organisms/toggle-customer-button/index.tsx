"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { toggleCustomerActive } from "@/actions/customers";

interface ToggleCustomerButtonProps {
  id: number;
  name: string;
  isActive: boolean;
}

export function ToggleCustomerButton({ id, name, isActive }: ToggleCustomerButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function toggle() {
    startTransition(async () => {
      const result = await toggleCustomerActive(id, isActive);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isActive ? "Cliente desactivado." : "Cliente activado.");
        router.refresh();
      }
      setConfirmOpen(false);
    });
  }

  function handleClick() {
    if (isActive) {
      setConfirmOpen(true);
    } else {
      toggle();
    }
  }

  return (
    <>
      {isActive ? (
        <Button
          variant="destructive"
          size="icon-xs"
          onClick={handleClick}
          disabled={isPending}
          aria-label="Desactivar cliente"
        >
          <Trash2 />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="xs"
          onClick={handleClick}
          disabled={isPending}
        >
          {isPending ? "..." : "Activar"}
        </Button>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Desactivar cliente"
        description={`Esto ocultará a ${name} de tu lista de clientes activos. No podrás usarlo en nuevas órdenes, pero su historial de pedidos se conserva.`}
        variant="destructive"
        confirmLabel="Desactivar"
        isPending={isPending}
        onConfirm={toggle}
      />
    </>
  );
}

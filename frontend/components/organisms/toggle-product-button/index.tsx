"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { toggleProductActive } from "@/actions/products";

interface ToggleProductButtonProps {
  id: number;
  name: string;
  isActive: boolean;
}

export function ToggleProductButton({ id, name, isActive }: ToggleProductButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function toggle() {
    startTransition(async () => {
      const result = await toggleProductActive(id, isActive);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isActive ? "Producto desactivado." : "Producto activado.");
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
          aria-label="Desactivar producto"
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
        title="Desactivar producto"
        description={`Esto ocultará a ${name} de tu catálogo de productos activos. No podrás usarlo en nuevas órdenes, pero permanecerá visible en las órdenes ya creadas.`}
        variant="destructive"
        confirmLabel="Desactivar"
        isPending={isPending}
        onConfirm={toggle}
      />
    </>
  );
}

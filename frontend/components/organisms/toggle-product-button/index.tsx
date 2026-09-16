"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { toggleProductActive } from "@/actions/products";

interface ToggleProductButtonProps {
  id: number;
  isActive: boolean;
}

export function ToggleProductButton({ id, isActive }: ToggleProductButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleProductActive(id, isActive);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isActive ? "Producto desactivado." : "Producto activado.");
        router.refresh();
      }
    });
  }

  return (
    <Button
      variant={isActive ? "destructive" : "outline"}
      size="xs"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "..." : isActive ? "Desactivar" : "Activar"}
    </Button>
  );
}

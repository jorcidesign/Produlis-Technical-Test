"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { toggleCustomerActive } from "@/actions/customers";

interface ToggleCustomerButtonProps {
  id: number;
  isActive: boolean;
}

export function ToggleCustomerButton({ id, isActive }: ToggleCustomerButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleCustomerActive(id, isActive);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isActive ? "Cliente desactivado." : "Cliente activado.");
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

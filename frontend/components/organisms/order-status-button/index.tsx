"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { changeOrderStatus } from "@/actions/orders";
import type { OrderStatus } from "@/services/api";

interface OrderStatusButtonProps {
  orderId: number;
  targetStatus: OrderStatus;
  label: string;
  variant?: "default" | "destructive" | "outline" | "ghost";
}

export function OrderStatusButton({
  orderId,
  targetStatus,
  label,
  variant = "default",
}: OrderStatusButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await changeOrderStatus(orderId, targetStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Orden marcada como ${targetStatus}.`);
        router.refresh();
      }
    });
  }

  return (
    <Button variant={variant} onClick={handleClick} disabled={isPending}>
      {isPending ? "..." : label}
    </Button>
  );
}

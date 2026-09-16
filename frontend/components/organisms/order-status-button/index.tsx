"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { changeOrderStatus } from "@/actions/orders";
import type { OrderStatus } from "@/services/api";

interface OrderStatusButtonProps {
  orderId: number;
  targetStatus: OrderStatus;
  label: string;
  variant?: "default" | "destructive" | "outline" | "ghost";
}

const CONFIRM_TEXT: Record<string, string> = {
  completed: "completar",
  cancelled: "cancelar",
};

export function OrderStatusButton({
  orderId,
  targetStatus,
  label,
  variant = "default",
}: OrderStatusButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function confirmChange() {
    startTransition(async () => {
      const result = await changeOrderStatus(orderId, targetStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Orden marcada como ${targetStatus}.`);
        router.refresh();
      }
      setConfirmOpen(false);
    });
  }

  return (
    <>
      <Button variant={variant} onClick={() => setConfirmOpen(true)} disabled={isPending}>
        {isPending ? "..." : label}
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={label}
        description={`¿Confirmas ${CONFIRM_TEXT[targetStatus] ?? targetStatus} la orden #${orderId}?`}
        variant={variant === "destructive" ? "destructive" : "default"}
        confirmLabel={label}
        isPending={isPending}
        onConfirm={confirmChange}
      />
    </>
  );
}

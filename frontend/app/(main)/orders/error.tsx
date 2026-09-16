"use client";

import { Button } from "@/components/atoms/button";

export default function OrdersError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
      <p className="text-lg font-semibold text-destructive">
        Error al cargar las órdenes
      </p>
      <p className="text-sm text-muted-foreground max-w-sm">
        {error.message || "Ocurrió un error inesperado. Intenta nuevamente."}
      </p>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}

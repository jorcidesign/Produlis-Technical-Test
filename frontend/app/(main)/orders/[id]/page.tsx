import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/services/api";
import { PageHeader } from "@/components/organisms/page-header";
import { OrderStatusButton } from "@/components/organisms/order-status-button";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Separator } from "@/components/atoms/separator";

export const metadata: Metadata = { title: "Detalle de orden" };

const fmt = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const dateFmt = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "long",
  timeStyle: "short",
});

const statusVariant = {
  pending: "secondary",
  completed: "default",
  cancelled: "destructive",
} as const;

const statusLabel = {
  pending: "Pendiente",
  completed: "Completada",
  cancelled: "Cancelada",
} as const;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const orderId = parseInt(id, 10);

  if (isNaN(orderId)) notFound();

  let order;
  try {
    order = await getOrder(orderId);
  } catch {
    notFound();
  }

  const items = order.items ?? [];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title={`Orden #${order.id}`}
          description={`Creada el ${dateFmt.format(new Date(order.created_at))}`}
        />
        <Button render={<Link href="/orders" />} variant="outline" size="sm">
          ← Volver
        </Button>
      </div>

      {/* Status + Customer */}
      <div className="flex flex-wrap gap-6 rounded-lg border border-border p-5 bg-muted/20">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Estado</p>
          <Badge variant={statusVariant[order.status]}>
            {statusLabel[order.status]}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Cliente</p>
          <p className="text-sm font-medium">
            {order.customer?.name ?? `ID: ${order.customer_id}`}
          </p>
          {order.customer?.email && (
            <p className="text-xs text-muted-foreground">{order.customer.email}</p>
          )}
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Total</p>
          <p className="text-lg font-semibold">{fmt.format(order.total_amount)}</p>
        </div>
      </div>

      {/* Items table */}
      <div>
        <h2 className="text-base font-semibold mb-3">Productos</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Producto</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Precio unit.</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Cantidad</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Sin ítems registrados.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">{item.product_name}</td>
                    <td className="px-4 py-3 text-right">{fmt.format(item.unit_price)}</td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {fmt.format(item.unit_price * item.quantity)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/30">
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold">
                  Total
                </td>
                <td className="px-4 py-3 text-right font-bold text-base">
                  {fmt.format(order.total_amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* State transition actions — only shown when pending */}
      {order.status === "pending" && (
        <>
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-medium">Cambiar estado</p>
            <div className="flex gap-3">
              <OrderStatusButton
                orderId={order.id}
                targetStatus="completed"
                label="Marcar completada"
                variant="default"
              />
              <OrderStatusButton
                orderId={order.id}
                targetStatus="cancelled"
                label="Cancelar orden"
                variant="destructive"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

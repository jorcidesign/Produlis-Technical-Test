import type { Metadata } from "next";
import { getAllCustomers, getAllProducts } from "@/services/api";
import { OrderForm } from "@/components/organisms/order-form";
import { PageHeader } from "@/components/organisms/page-header";
import { createOrder } from "@/actions/orders";

export const metadata: Metadata = { title: "Nueva orden" };

export default async function NewOrderPage() {
  const [customers, products] = await Promise.all([
    getAllCustomers(),
    getAllProducts(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva orden"
        description="Selecciona un cliente y agrega los productos."
      />
      <OrderForm action={createOrder} customers={customers} products={products} />
    </div>
  );
}

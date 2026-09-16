import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCustomer } from "@/services/api";
import { CustomerForm } from "@/components/organisms/customer-form";
import { PageHeader } from "@/components/organisms/page-header";
import { updateCustomer } from "@/actions/customers";

export const metadata: Metadata = { title: "Editar cliente" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({ params }: PageProps) {
  const { id } = await params;
  const customerId = parseInt(id, 10);

  if (isNaN(customerId)) notFound();

  let customer;
  try {
    customer = await getCustomer(customerId);
  } catch {
    notFound();
  }

  const boundAction = updateCustomer.bind(null, customerId);

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Editar cliente"
        description={`Modificando: ${customer.name}`}
      />
      <CustomerForm action={boundAction} customer={customer} />
    </div>
  );
}

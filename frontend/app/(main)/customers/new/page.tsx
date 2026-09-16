import type { Metadata } from "next";
import { CustomerForm } from "@/components/organisms/customer-form";
import { PageHeader } from "@/components/organisms/page-header";
import { createCustomer } from "@/actions/customers";

export const metadata: Metadata = { title: "Nuevo cliente" };

export default function NewCustomerPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Nuevo cliente" description="Completa los datos del nuevo cliente." />
      <CustomerForm action={createCustomer} />
    </div>
  );
}

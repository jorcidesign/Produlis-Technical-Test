import { Spinner } from "@/components/atoms/spinner";

/**
 * Root Loading UI component for App Router.
 * Automatically activates during React Suspense transitions and streaming SSR.
 */
export default function Loading() {
  return (
    <main className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 p-8">
      <Spinner className="size-8 text-primary" />
      <p className="text-sm font-medium text-muted-foreground">Cargando contenido...</p>
    </main>
  );
}

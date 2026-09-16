// ============================================================
// services/api.ts — Cliente API (server-side únicamente)
// API_URL es una variable de entorno de servidor (no NEXT_PUBLIC_).
// Todas estas funciones se llaman desde Server Components o Server Actions.
// ============================================================

const API_URL = process.env.API_URL ?? "http://localhost:3001";

// ── Tipos base ────────────────────────────────────────────────

export interface Customer {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = "pending" | "completed" | "cancelled";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
}

export interface Order {
  id: number;
  customer_id: number;
  customer?: Customer;
  status: OrderStatus;
  total_amount: number;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ── Helpers ───────────────────────────────────────────────────

function buildUrl(path: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(`${API_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Customers ─────────────────────────────────────────────────

export function getCustomers(params: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<PaginatedResponse<Customer>> {
  const url = buildUrl("/customers", {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search,
  });
  return apiFetch<PaginatedResponse<Customer>>(url, {
    next: { revalidate: 30, tags: ["customers"] },
  });
}

export function getCustomer(id: number): Promise<Customer> {
  return apiFetch<Customer>(`${API_URL}/customers/${id}`, {
    next: { revalidate: 30, tags: ["customers"] },
  });
}

export function getAllCustomers(): Promise<Customer[]> {
  return apiFetch<Customer[]>(
    buildUrl("/customers", { limit: 1000, page: 1 }),
    { next: { revalidate: 60, tags: ["customers"] } }
  ).then((r) => (Array.isArray(r) ? r : (r as PaginatedResponse<Customer>).data));
}

// ── Products ──────────────────────────────────────────────────

export function getProducts(params: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<PaginatedResponse<Product>> {
  const url = buildUrl("/products", {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search,
  });
  return apiFetch<PaginatedResponse<Product>>(url, {
    next: { revalidate: 30, tags: ["products"] },
  });
}

export function getProduct(id: number): Promise<Product> {
  return apiFetch<Product>(`${API_URL}/products/${id}`, {
    next: { revalidate: 30, tags: ["products"] },
  });
}

export function getAllProducts(): Promise<Product[]> {
  return apiFetch<Product[]>(
    buildUrl("/products", { limit: 1000, page: 1 }),
    { next: { revalidate: 60, tags: ["products"] } }
  ).then((r) => (Array.isArray(r) ? r : (r as PaginatedResponse<Product>).data));
}

// ── Orders ────────────────────────────────────────────────────

export function getOrders(params: {
  page?: number;
  limit?: number;
  status?: string;
  customer_id?: number;
} = {}): Promise<PaginatedResponse<Order>> {
  const url = buildUrl("/orders", {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    status: params.status,
    customer_id: params.customer_id,
  });
  return apiFetch<PaginatedResponse<Order>>(url, {
    next: { revalidate: 30, tags: ["orders"] },
  });
}

export function getOrder(id: number): Promise<Order> {
  return apiFetch<Order>(`${API_URL}/orders/${id}`, {
    next: { revalidate: 30, tags: ["orders"] },
  });
}

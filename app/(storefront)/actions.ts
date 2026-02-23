"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const CUSTOMER_CITY_COOKIE = "prx_customer_city";

export type CustomerCity = "islamabad" | "other";

export async function setCustomerCity(city: CustomerCity) {
  (await cookies()).set(CUSTOMER_CITY_COOKIE, city, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/category/[slug]", "layout");
}

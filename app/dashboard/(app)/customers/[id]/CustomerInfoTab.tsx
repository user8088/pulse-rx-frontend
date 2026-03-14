"use client";

import { updateCustomerAction, deleteCustomerAction } from "../actions";
import { PendingSubmitButton } from "@/components/ui/PendingSubmitButton";
import { ConfirmingSubmitButton } from "@/components/ui/ConfirmingSubmitButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Customer } from "@/types/customer";

export function CustomerInfoTab({ customer }: { customer: Customer }) {
  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 shadow-sm rounded-2xl">
        <CardHeader className="p-5 border-b border-gray-100">
          <CardTitle className="text-sm font-extrabold text-[#374151]">
            Edit customer
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <form action={updateCustomerAction} className="space-y-4">
            <input type="hidden" name="id" value={customer.id} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="info-name"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1"
                >
                  Name *
                </label>
                <input
                  id="info-name"
                  type="text"
                  name="name"
                  defaultValue={customer.name}
                  required
                  className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="info-phone"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1"
                >
                  Phone
                </label>
                <input
                  id="info-phone"
                  type="text"
                  name="phone"
                  defaultValue={customer.phone ?? ""}
                  className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="info-email"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1"
                >
                  Email
                </label>
                <input
                  id="info-email"
                  type="email"
                  name="email"
                  defaultValue={customer.email ?? ""}
                  className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="info-external_id"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1"
                >
                  External ID (User ID)
                </label>
                <input
                  id="info-external_id"
                  type="text"
                  name="external_id"
                  defaultValue={customer.external_id ?? ""}
                  className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="info-gender"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1"
                >
                  Gender
                </label>
                <select
                  id="info-gender"
                  name="gender"
                  defaultValue={customer.gender ?? ""}
                  className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
                >
                  <option value="">—</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="info-address"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1"
                >
                  Address
                </label>
                <input
                  id="info-address"
                  type="text"
                  name="address"
                  defaultValue={customer.address ?? ""}
                  className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="info-city"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1"
                >
                  City
                </label>
                <input
                  id="info-city"
                  type="text"
                  name="city"
                  defaultValue={customer.city ?? ""}
                  className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="info-coords"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1"
                >
                  Coordinates (lat, lng)
                </label>
                <div className="flex gap-2">
                  <input
                    id="info-latitude"
                    type="text"
                    name="latitude"
                    placeholder="Latitude"
                    defaultValue={
                      customer.latitude != null ? String(customer.latitude) : ""
                    }
                    className="flex-1 h-10 rounded-xl border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
                  />
                  <input
                    id="info-longitude"
                    type="text"
                    name="longitude"
                    placeholder="Longitude"
                    defaultValue={
                      customer.longitude != null ? String(customer.longitude) : ""
                    }
                    className="flex-1 h-10 rounded-xl border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="info-discount"
                  className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1"
                >
                  Discount %
                </label>
                <input
                  id="info-discount"
                  type="number"
                  name="discount_percentage"
                  min={0}
                  max={100}
                  step={0.01}
                  defaultValue={customer.discount_percentage ?? 0}
                  className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <PendingSubmitButton pendingText="Saving…">Save changes</PendingSubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-red-100 shadow-sm rounded-2xl">
        <CardHeader className="p-5 border-b border-gray-100">
          <CardTitle className="text-sm font-extrabold text-red-700">
            Delete customer
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <p className="text-sm text-gray-600 mb-4">
            Permanently delete this customer. This cannot be undone.
          </p>
          <form action={deleteCustomerAction}>
            <input type="hidden" name="id" value={customer.id} />
            <ConfirmingSubmitButton
              confirmMessage="Are you sure you want to delete this customer? This cannot be undone."
              pendingText="Deleting…"
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-bold uppercase tracking-wider"
            >
              Delete customer
            </ConfirmingSubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

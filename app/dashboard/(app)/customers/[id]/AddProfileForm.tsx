"use client";

import { useState } from "react";
import { createProfileAction } from "../actions";
import { PendingSubmitButton } from "@/components/ui/PendingSubmitButton";
import { Plus } from "lucide-react";

export function AddProfileForm({ customerId }: { customerId: number | string }) {
  const [name, setName] = useState("");

  return (
    <form
      action={createProfileAction}
      className="flex flex-wrap items-center gap-2"
      onSubmit={() => setName("")}
    >
      <input type="hidden" name="customer_id" value={customerId} />
      <input
        type="text"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Profile name (e.g. Diabetes)"
        required
        className="h-10 rounded-xl border border-gray-200 px-3 text-sm w-48 focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
      />
      <PendingSubmitButton
        pendingText="Adding…"
        className="inline-flex items-center gap-2 h-10 rounded-xl bg-[#01AC28] hover:bg-[#044644] text-white px-4 text-sm font-bold tracking-wider"
      >
        Add profile
      </PendingSubmitButton>
    </form>
  );
}

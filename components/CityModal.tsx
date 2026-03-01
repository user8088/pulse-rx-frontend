"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useCity } from "@/lib/context/CityContext";
import { setCustomerCity } from "@/app/(storefront)/actions";

export function CityModal() {
  const router = useRouter();
  const { showCityModal, setCustomerCity: setCityInContext } = useCity();

  const handleSelect = async (city: "islamabad" | "other") => {
    await setCustomerCity(city);
    setCityInContext(city);
    router.refresh();
  };

  if (!showCityModal) return null;

  return (
    <Modal
      open={showCityModal}
      onClose={() => {}}
      title="Where are you located?"
      description="We'll show you products available for delivery in your area."
    >
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          className="w-full justify-center"
          onClick={() => handleSelect("islamabad")}
        >
          Islamabad
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full justify-center"
          onClick={() => handleSelect("other")}
        >
          Other cities
        </Button>
      </div>
    </Modal>
  );
}

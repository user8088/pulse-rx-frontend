"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const COOKIE_NAME = "prx_customer_city";

export type CustomerCity = "islamabad" | "other";

function getCustomerCityFromCookie(): CustomerCity | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const value = match.split("=")[1]?.trim();
  if (value === "islamabad" || value === "other") return value;
  return null;
}

interface CityContextType {
  customerCity: CustomerCity | null;
  setCustomerCity: (city: CustomerCity | null) => void;
  showCityModal: boolean;
  setShowCityModal: (show: boolean) => void;
  refreshCity: () => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [customerCity, setCustomerCityState] = useState<CustomerCity | null>(null);
  const [showCityModal, setShowCityModal] = useState(false);

  const refreshCity = useCallback(() => {
    setCustomerCityState(getCustomerCityFromCookie());
  }, []);

  useEffect(() => {
    setCustomerCityState(getCustomerCityFromCookie());
    setShowCityModal(!getCustomerCityFromCookie());
  }, []);

  const setCustomerCity = useCallback((city: CustomerCity | null) => {
    setCustomerCityState(city);
    setShowCityModal(city === null);
  }, []);

  const value: CityContextType = {
    customerCity,
    setCustomerCity,
    showCityModal,
    setShowCityModal,
    refreshCity,
  };

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (ctx === undefined) throw new Error("useCity must be used within CityProvider");
  return ctx;
}

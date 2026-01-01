"use client";

import { useState } from "react";
import { HiOutlineMapPin } from "react-icons/hi2";
import AddressForm from "@/components/checkout/AddressForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuthUnified } from "@/hooks/useAuthUnified";
import { Address } from "@/types/shared";

export default function UserAddresses() {
  const { t } = useLanguage();
  const { user } = useAuthUnified();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-sky-500/30 shadow-[0_0_24px_rgba(59,130,246,.12)] p-6">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center">
          <HiOutlineMapPin className="h-6 w-6 mr-3 text-cosmic-gold" />
          {t("account.addresses_title")}
        </h2>
        <p className="text-slate-300 mt-2">
          {t("account.addresses_subtitle")}
        </p>
      </div>

      <AddressForm
        onAddressSelect={setSelectedAddress}
        selectedAddress={selectedAddress}
        isAuthenticated={Boolean(user)}
        savePrompt={false}
      />
    </div>
  );
}

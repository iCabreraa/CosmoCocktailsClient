"use client";

import { useState } from "react";
import { MapPin, Plus, Edit2, Trash2, Check } from "lucide-react";
import { Address } from "@/types/shared";
import { useLanguage } from "@/contexts/LanguageContext";

interface AddressFormProps {
  onAddressSelect: (address: Address) => void;
  selectedAddress?: Address | null;
}

interface AddressFormData {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export default function AddressForm({
  onAddressSelect,
  selectedAddress,
}: AddressFormProps) {
  const { t } = useLanguage();
  const [addresses, setAddresses] = useState<Address[]>([
    // Dirección por defecto
    {
      id: "default-1",
      user_id: "current-user",
      name: t("checkout.home"),
      street: "Calle Principal 123",
      city: "Madrid",
      postal_code: "28001",
      country: t("checkout.spain"),
      phone: "+34 123 456 789",
      is_default: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    name: "",
    street: "",
    city: "",
    postalCode: "",
    country: t("checkout.spain"),
    phone: "",
    isDefault: false,
  });

  const handleInputChange = (
    field: keyof AddressFormData,
    value: string | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAddress: Address = {
      id: editingAddress?.id || `addr-${Date.now()}`,
      user_id: "current-user",
      name: formData.name,
      street: formData.street,
      city: formData.city,
      postal_code: formData.postalCode,
      country: formData.country,
      phone: formData.phone,
      is_default: formData.isDefault || addresses.length === 0,
      created_at: editingAddress?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (editingAddress) {
      setAddresses(prev =>
        prev.map(addr => (addr.id === editingAddress.id ? newAddress : addr))
      );
    } else {
      setAddresses(prev => [...prev, newAddress]);
    }

    // Si es la dirección por defecto o la primera, seleccionarla automáticamente
    if (formData.isDefault || addresses.length === 0) {
      onAddressSelect(newAddress);
    }

    // Reset form
    setFormData({
      name: "",
      street: "",
      city: "",
      postalCode: "",
      country: t("checkout.spain"),
      phone: "",
      isDefault: false,
    });
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name || "",
      street: address.street || "",
      city: address.city,
      postalCode: address.postal_code || "",
      country: address.country,
      phone: address.phone || "",
      isDefault: address.is_default || false,
    });
    setShowForm(true);
  };

  const handleDelete = (addressId: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    if (selectedAddress?.id === addressId) {
      onAddressSelect(addresses[0] || null);
    }
  };

  const handleSelect = (address: Address) => {
    onAddressSelect(address);
  };

  return (
    <div className="space-y-6">
      {/* Lista de direcciones existentes */}
      <div className="space-y-3">
        <h3 className="text-lg font-[--font-unica] text-cosmic-gold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {t("checkout.shipping_addresses")}
        </h3>

        {addresses.map(address => (
          <div
            key={address.id}
            className={`p-4 rounded-lg border cursor-pointer transition ${
              selectedAddress?.id === address.id
                ? "border-cosmic-gold bg-cosmic-gold/10"
                : "border-cosmic-fog/30 hover:border-cosmic-gold/50"
            }`}
            onClick={() => handleSelect(address)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-cosmic-text">
                    {address.name}
                  </h4>
                  {address.is_default && (
                    <span className="px-2 py-1 text-xs bg-cosmic-gold text-black rounded-full">
                      {t("checkout.default")}
                    </span>
                  )}
                  {selectedAddress?.id === address.id && (
                    <Check className="w-4 h-4 text-cosmic-gold" />
                  )}
                </div>
                <p className="text-sm text-cosmic-fog">{address.street}</p>
                <p className="text-sm text-cosmic-fog">
                  {address.city}, {address.postal_code}, {address.country}
                </p>
                <p className="text-sm text-cosmic-fog">{address.phone}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleEdit(address);
                  }}
                  className="p-2 text-cosmic-fog hover:text-cosmic-gold transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {!address.is_default && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(address.id);
                    }}
                    className="p-2 text-cosmic-fog hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botón para agregar nueva dirección */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-cosmic-fog/30 rounded-lg text-cosmic-fog hover:border-cosmic-gold hover:text-cosmic-gold transition"
        >
          <Plus className="w-5 h-5" />
          {t("checkout.add_new_address")}
        </button>
      )}

      {/* Formulario de dirección */}
      {showForm && (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-cosmic-gold/10">
          <h3 className="text-lg font-[--font-unica] text-cosmic-gold mb-4">
            {editingAddress
              ? t("checkout.edit_address")
              : t("checkout.new_address")}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-cosmic-fog mb-2">
                  {t("checkout.address_name")} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("checkout.address_name_placeholder")}
                  className="w-full bg-transparent border border-cosmic-fog/30 rounded-md p-3 focus:border-cosmic-gold focus:outline-none transition"
                  value={formData.name}
                  onChange={e => handleInputChange("name", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-cosmic-fog mb-2">
                  {t("checkout.phone")} *
                </label>
                <input
                  type="tel"
                  required
                  placeholder={t("checkout.phone_placeholder")}
                  className="w-full bg-transparent border border-cosmic-fog/30 rounded-md p-3 focus:border-cosmic-gold focus:outline-none transition"
                  value={formData.phone}
                  onChange={e => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-cosmic-fog mb-2">
                {t("checkout.address")} *
              </label>
              <input
                type="text"
                required
                placeholder={t("checkout.address_placeholder")}
                className="w-full bg-transparent border border-cosmic-fog/30 rounded-md p-3 focus:border-cosmic-gold focus:outline-none transition"
                value={formData.street}
                onChange={e => handleInputChange("street", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-cosmic-fog mb-2">
                  {t("checkout.city")} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("checkout.city_placeholder")}
                  className="w-full bg-transparent border border-cosmic-fog/30 rounded-md p-3 focus:border-cosmic-gold focus:outline-none transition"
                  value={formData.city}
                  onChange={e => handleInputChange("city", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-cosmic-fog mb-2">
                  {t("checkout.postal_code")} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("checkout.postal_code_placeholder")}
                  className="w-full bg-transparent border border-cosmic-fog/30 rounded-md p-3 focus:border-cosmic-gold focus:outline-none transition"
                  value={formData.postalCode}
                  onChange={e =>
                    handleInputChange("postalCode", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-cosmic-fog mb-2">
                  {t("checkout.country")} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("checkout.country_placeholder")}
                  className="w-full bg-transparent border border-cosmic-fog/30 rounded-md p-3 focus:border-cosmic-gold focus:outline-none transition"
                  value={formData.country}
                  onChange={e => handleInputChange("country", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={e => handleInputChange("isDefault", e.target.checked)}
                className="w-4 h-4 text-cosmic-gold bg-transparent border-cosmic-fog rounded focus:ring-cosmic-gold focus:ring-2"
              />
              <label htmlFor="isDefault" className="text-sm text-cosmic-fog">
                {t("checkout.set_as_default")}
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-cosmic-gold text-black hover:bg-cosmic-gold/80 transition font-medium"
              >
                {editingAddress ? t("checkout.update") : t("checkout.save")}{" "}
                {t("checkout.address")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAddress(null);
                  setFormData({
                    name: "",
                    street: "",
                    city: "",
                    postalCode: "",
                    country: t("checkout.spain"),
                    phone: "",
                    isDefault: false,
                  });
                }}
                className="px-6 py-3 rounded-full border border-cosmic-fog text-cosmic-fog hover:border-cosmic-gold hover:text-cosmic-gold transition"
              >
                {t("checkout.cancel")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

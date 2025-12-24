"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Edit2, Trash2, Check } from "lucide-react";
import { Address } from "@/types/shared";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/feedback/ToastProvider";

interface AddressFormProps {
  onAddressSelect: (address: Address | null) => void;
  selectedAddress?: Address | null;
  isAuthenticated?: boolean;
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
  isAuthenticated = false,
}: AddressFormProps) {
  const { t } = useLanguage();
  const { notify } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    name: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
    isDefault: false,
  });

  const normalizeAddress = (address: Address): Address => {
    const fallbackId = `addr-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    return {
      ...address,
      id: address.id || fallbackId,
      name: address.name || address.full_name || address.street || "",
      street: address.street || address.address_line_1 || "",
      postal_code: address.postal_code || address.postalCode || "",
      is_default:
        address.is_default ?? address.isDefault ?? false,
    };
  };

  const syncSelectedAddress = (list: Address[]) => {
    if (!list.length) return;
    if (selectedAddress && list.some(addr => addr.id === selectedAddress.id)) {
      return;
    }
    const preferred = list.find(addr => addr.is_default) || list[0];
    if (preferred) {
      onAddressSelect(preferred);
    }
  };

  const loadAddresses = async () => {
    if (!isAuthenticated) return;
    setLoadingAddresses(true);
    setAddressError("");
    try {
      const res = await fetch("/api/addresses");
      if (!res.ok) {
        throw new Error("Failed to load addresses");
      }
      const data = await res.json();
      const list = (data.addresses || []).map((addr: Address) =>
        normalizeAddress(addr)
      );
      setAddresses(list);
      syncSelectedAddress(list);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error loading addresses";
      setAddressError(message);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setAddresses([]);
      loadAddresses();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && addresses.length === 0) {
      setShowForm(true);
    }
  }, [isAuthenticated, addresses.length]);

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
      name: formData.name,
      street: formData.street,
      city: formData.city,
      postal_code: formData.postalCode,
      country: formData.country,
      phone: formData.phone,
      is_default: isAuthenticated
        ? formData.isDefault || addresses.length === 0
        : false,
      created_at: editingAddress?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isAuthenticated) {
      const saveAddress = async () => {
        try {
          setAddressError("");
          const payload = {
            ...newAddress,
            is_default: newAddress.is_default,
            type: "shipping",
          };
          const res = await fetch("/api/addresses", {
            method: editingAddress ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            throw new Error("Failed to save address");
          }
          const data = await res.json();
          const saved = normalizeAddress(data.address);
          setAddresses(prev => {
            const next = editingAddress
              ? prev.map(addr => (addr.id === saved.id ? saved : addr))
              : [...prev, saved];
            return saved.is_default
              ? next.map(addr => ({
                  ...addr,
                  is_default: addr.id === saved.id,
                }))
              : next;
          });
          onAddressSelect(saved);
          notify({
            type: "success",
            title: editingAddress
              ? t("feedback.address_updated_title")
              : t("feedback.address_added_title"),
            message: editingAddress
              ? t("feedback.address_updated_message", {
                  name: saved.name,
                })
              : t("feedback.address_added_message", {
                  name: saved.name,
                }),
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Error saving address";
          setAddressError(message);
        }
      };
      void saveAddress();
    } else {
      if (editingAddress) {
        setAddresses(prev =>
          prev.map(addr => {
            if (addr.id === editingAddress.id) {
              return newAddress;
            }
            if (newAddress.is_default) {
              return { ...addr, is_default: false };
            }
            return addr;
          })
        );
        notify({
          type: "success",
          title: t("feedback.address_updated_title"),
          message: t("feedback.address_updated_message", {
            name: newAddress.name,
          }),
        });
      } else {
        setAddresses(prev => {
          const next = newAddress.is_default
            ? prev.map(addr => ({ ...addr, is_default: false }))
            : prev;
          return [...next, newAddress];
        });
        notify({
          type: "success",
          title: t("feedback.address_added_title"),
          message: t("feedback.address_added_message", {
            name: newAddress.name,
          }),
        });
      }
      onAddressSelect(newAddress);
    }

    // Si es la dirección por defecto o la primera, seleccionarla automáticamente
    if (!isAuthenticated) {
      onAddressSelect(newAddress);
    }

    // Reset form
    setFormData({
      name: "",
      street: "",
      city: "",
      postalCode: "",
      country: "",
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
      isDefault: isAuthenticated ? address.is_default || false : false,
    });
    setShowForm(true);
  };

  const handleDelete = (addressId: string) => {
    const toDelete = addresses.find(addr => addr.id === addressId);
    const wasDefault = Boolean(toDelete?.is_default);
    if (isAuthenticated) {
      const removeAddress = async () => {
        try {
          setAddressError("");
          const res = await fetch(`/api/addresses?id=${addressId}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            throw new Error("Failed to delete address");
          }
          const remaining = addresses.filter(addr => addr.id !== addressId);
          if (wasDefault && remaining.length > 0) {
            const nextDefault = remaining[0];
            await fetch("/api/addresses", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...nextDefault, is_default: true }),
            });
            remaining[0] = { ...nextDefault, is_default: true };
          }
          setAddresses(remaining);
          if (selectedAddress?.id === addressId) {
            onAddressSelect(remaining.find(addr => addr.is_default) || remaining[0] || null);
          }
          if (toDelete) {
            notify({
              type: "warning",
              title: t("feedback.address_deleted_title"),
              message: t("feedback.address_deleted_message", {
                name: toDelete.name,
              }),
            });
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Error deleting address";
          setAddressError(message);
        }
      };
      void removeAddress();
    } else {
      const next = addresses.filter(addr => addr.id !== addressId);
      if (wasDefault && next.length > 0) {
        next[0] = { ...next[0], is_default: true };
      }
      setAddresses(next);
      if (selectedAddress?.id === addressId) {
        onAddressSelect(next.find(addr => addr.is_default) || next[0] || null);
      }
      if (toDelete) {
        notify({
          type: "warning",
          title: t("feedback.address_deleted_title"),
          message: t("feedback.address_deleted_message", { name: toDelete.name }),
        });
      }
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

        {loadingAddresses && (
          <div className="text-sm text-cosmic-fog">
            {t("checkout.loading")}
          </div>
        )}

        {addressError && (
          <div className="text-sm text-red-400">{addressError}</div>
        )}

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
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleDelete(address.id);
                  }}
                  className="p-2 text-cosmic-fog hover:text-red-500 transition"
                  title={t("feedback.address_deleted_title")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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

            {isAuthenticated && (
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
            )}

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

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface ClientData {
  id?: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: any;
  user_id?: string;
  is_guest: boolean;
}

export function useClientData() {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Obtener datos del cliente por email (solo servidor)
  const getClientByEmail = async (
    email: string
  ): Promise<ClientData | null> => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        return data;
      }

      return null;
    } catch (err) {
      console.error("Error fetching client data:", err);
      return null;
    }
  };

  // Guardar o actualizar datos del cliente
  const saveClientData = async (
    data: Omit<ClientData, "id">
  ): Promise<ClientData | null> => {
    try {
      // Intentar guardar en la base de datos primero
      const { data: existingClient } = await supabase
        .from("clients")
        .select("id")
        .eq("email", data.email)
        .single();

      let savedClient;

      if (existingClient) {
        // Actualizar cliente existente
        const { data: updatedClient, error } = await (supabase as any)
          .from("clients")
          .update({
            full_name: data.full_name,
            phone: data.phone,
            address: data.address,
            is_guest: data.is_guest,
            updated_at: new Date().toISOString(),
          })
          .eq("id", (existingClient as any).id)
          .select()
          .single();

        if (error) throw error;
        savedClient = updatedClient;
      } else {
        // Crear nuevo cliente
        const { data: newClient, error } = await (supabase as any)
          .from("clients")
          .insert([data as any])
          .select()
          .single();

        if (error) throw error;
        savedClient = newClient;
      }

      console.log("✅ Client data saved to database");
      return savedClient;
    } catch (err) {
      console.error("Error saving client data to database:", err);
      return null;
    }
  };

  // Auto-rellenar formulario con datos del cliente
  const getFormDataForEmail = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const client = await getClientByEmail(email);

      if (client) {
        setClientData(client);
        return {
          name: client.full_name || "",
          email: client.email,
          phone: client.phone || "",
          address: client.address || null,
        };
      }

      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    clientData,
    loading,
    error,
    getClientByEmail,
    saveClientData,
    getFormDataForEmail,
  };
}

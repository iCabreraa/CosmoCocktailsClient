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

  // Obtener datos del cliente por email
  const getClientByEmail = async (
    email: string
  ): Promise<ClientData | null> => {
    try {
      // Intentar obtener de la base de datos primero
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows found, intentar localStorage como fallback
        console.log(
          "📦 Tabla clients no disponible, usando localStorage fallback"
        );
        const storedData = localStorage.getItem(`client_${email}`);
        if (storedData) {
          return JSON.parse(storedData);
        }
        return null;
      }

      // Si encontramos datos en la base de datos, también guardar en localStorage para backup
      if (data) {
        localStorage.setItem(`client_${email}`, JSON.stringify(data));
        return data;
      }

      // Si no hay datos en BD, intentar localStorage
      const storedData = localStorage.getItem(`client_${email}`);
      if (storedData) {
        return JSON.parse(storedData);
      }

      return null;
    } catch (err) {
      console.error("Error fetching client data:", err);
      // Fallback a localStorage en caso de error
      const storedData = localStorage.getItem(`client_${email}`);
      if (storedData) {
        return JSON.parse(storedData);
      }
      return null;
    }
  };

  // Guardar o actualizar datos del cliente
  const saveClientData = async (
    data: Omit<ClientData, "id">
  ): Promise<ClientData | null> => {
    try {
      // Intentar guardar en la base de datos primero
      const { data: existingClient } = await (supabase as any)
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
          .eq("id", existingClient.id)
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

      // También guardar en localStorage como backup
      localStorage.setItem(`client_${data.email}`, JSON.stringify(savedClient));
      console.log(
        "✅ Client data saved to database and localStorage:",
        savedClient
      );
      return savedClient;
    } catch (err) {
      console.error("Error saving client data to database:", err);

      // Fallback: guardar solo en localStorage
      const clientData = {
        id: `local_${Date.now()}`,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem(`client_${data.email}`, JSON.stringify(clientData));
      console.log("📦 Client data saved to localStorage fallback:", clientData);
      return clientData;
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

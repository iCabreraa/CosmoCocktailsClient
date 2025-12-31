// Sistema de auditoría de seguridad
import { createClient } from "@/lib/supabase/client";

export interface SecurityEvent {
  id?: string;
  user_id?: string;
  event_type:
    | "login"
    | "logout"
    | "failed_login"
    | "permission_denied"
    | "suspicious_activity";
  description: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export class SecurityAuditor {
  private supabase = createClient();

  async logEvent(event: Omit<SecurityEvent, "id" | "created_at">) {
    try {
      const details = {
        description: event.description,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        ...(event.metadata ? { metadata: event.metadata } : {}),
      };

      const { data, error } = await (this.supabase as any)
        .from("security_events")
        .insert({
          event_type: event.event_type,
          user_id: event.user_id,
          details,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error logging security event:", error);
      }
    } catch (error) {
      console.error("Error logging security event:", error);
    }
  }

  async logLogin(userId: string, success: boolean) {
    await this.logEvent({
      user_id: userId,
      event_type: success ? "login" : "failed_login",
      description: success ? "Successful login" : "Failed login attempt",
    });
  }

  async logLogout(userId: string) {
    await this.logEvent({
      user_id: userId,
      event_type: "logout",
      description: "User logged out",
    });
  }

  async logPermissionDenied(userId: string, resource: string) {
    await this.logEvent({
      user_id: userId,
      event_type: "permission_denied",
      description: `Access denied to ${resource}`,
      metadata: { resource },
    });
  }

  async logSuspiciousActivity(
    description: string,
    metadata?: Record<string, any>
  ) {
    await this.logEvent({
      event_type: "suspicious_activity",
      description,
      metadata,
    });
  }

  private async getClientIP(): Promise<string> {
    return "unknown";
  }

  async getSecurityEvents(userId?: string, limit = 100) {
    try {
      let query = this.supabase
        .from("security_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching security events:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching security events:", error);
      return [];
    }
  }
}

export const securityAuditor = new SecurityAuditor();

// Phase 4: Licence Validation API types

export interface ValidateRequest {
  licence_key: string;
  device_fingerprint: string;
  device_name?: string;
  os?: string;
  app_version?: string;
}

export interface ValidateResponse {
  valid: true;
  licence_type: string;
  company_name: string | null;
  seats: number;
  devices_used: number;
  expires_at: string | null;
}

export interface ValidateErrorResponse {
  valid: false;
  error:
    | "invalid_key"
    | "licence_inactive"
    | "licence_expired"
    | "seat_limit"
    | "server_error";
  status?: string;
  expires_at?: string | null;
  seats?: number;
  devices_used?: number;
}

export interface StatusRequest {
  licence_key: string;
}

export interface StatusResponse {
  valid: boolean;
  status?: string;
  licence_type?: string;
  seats?: number;
  expires_at?: string | null;
  error?: "invalid_key" | "server_error";
}

import { API_CONFIG } from "@/lib/constants";

export type KioskCirculationMode = "take_out" | "on_premise";

export interface KioskReader {
  fullName: string;
  readerType: string;
  readerTypeOtherText?: string;
  branchId: string;
  branchName: string;
}

export interface KioskCheckoutResult {
  status: "pending" | "checked-out";
  circulationMode: KioskCirculationMode;
  request?: { id: string; status: "pending" };
  lending?: { id: string; status: string };
}

async function kioskRequest<T>(path: string, credential: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeout);
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${credential}`,
      },
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null) as { message?: string } | null;
    if (!response.ok) throw new Error(payload?.message || "Kiosk request failed. Check the connection and try again.");
    return payload as T;
  } finally {
    clearTimeout(timeout);
  }
}

export const kioskApi = {
  lookupReader: (credential: string, cardValue: string) =>
    kioskRequest<{ reader: KioskReader }>(`/kiosk/readers/by-card/${encodeURIComponent(cardValue)}`, credential),

  checkout: (credential: string, input: {
    readerCardValue: string;
    copyBarcode: string;
    circulationMode: KioskCirculationMode;
  }) => kioskRequest<KioskCheckoutResult>("/kiosk/checkout", credential, {
    method: "POST",
    body: JSON.stringify(input),
  }),
};

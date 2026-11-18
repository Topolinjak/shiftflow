import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

// client.ts prebere VITE_API_URL ob uvozu, zato ga za vsak test uvozimo na novo.
async function loadClient() {
  vi.resetModules();
  return import("./client");
}

beforeEach(() => {
  fetchMock.mockResolvedValue(new Response("{}"));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("apiFetch", () => {
  it("brez VITE_API_URL uporabi relativno pot (Vite proxy)", async () => {
    vi.stubEnv("VITE_API_URL", "");
    const { apiFetch } = await loadClient();

    await apiFetch("/api/shifts");

    expect(fetchMock).toHaveBeenCalledWith("/api/shifts", undefined);
  });

  it("z VITE_API_URL pred pot doda URL backenda", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.example.test");
    const { apiFetch } = await loadClient();

    await apiFetch("/api/shifts");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/api/shifts",
      undefined
    );
  });

  it("odstrani končno poševnico iz VITE_API_URL", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.example.test/");
    const { apiFetch } = await loadClient();

    await apiFetch("/api/auth/me");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/api/auth/me",
      undefined
    );
  });

  it("posreduje nastavitve zahteve (metoda, glave, telo)", async () => {
    vi.stubEnv("VITE_API_URL", "");
    const { apiFetch } = await loadClient();
    const init: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}"
    };

    await apiFetch("/api/shifts", init);

    expect(fetchMock).toHaveBeenCalledWith("/api/shifts", init);
  });
});

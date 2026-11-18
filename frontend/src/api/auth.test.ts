import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, getCurrentUser, login, readResponse } from "./auth";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("readResponse", () => {
  it("pri uspešnem odgovoru vrne telo JSON", async () => {
    await expect(readResponse(jsonResponse({ ok: true }))).resolves.toEqual({
      ok: true
    });
  });

  it("pri napaki vrže ApiError s statusom in sporočilom strežnika", async () => {
    const error = await readResponse(
      jsonResponse({ message: "Napačno geslo." }, 401)
    ).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401, message: "Napačno geslo." });
  });

  it("pri napaki brez JSON uporabi privzeto sporočilo", async () => {
    const error = await readResponse(
      new Response("Internal Server Error", { status: 500 })
    ).catch((e: unknown) => e);

    expect(error).toMatchObject({
      status: 500,
      message: "Zahteve ni bilo mogoče izvesti."
    });
  });
});

describe("login", () => {
  it("pošlje e-pošto in geslo s POST na /api/auth/login", async () => {
    const result = { token: "t", user: { id: "1" } };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(result));
    vi.stubGlobal("fetch", fetchMock);

    await expect(login("ana@example.com", "geslo123456")).resolves.toEqual(
      result
    );

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/login");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      email: "ana@example.com",
      password: "geslo123456"
    });
  });
});

describe("getCurrentUser", () => {
  it("pošlje žeton v glavi Authorization in vrne uporabnika", async () => {
    const user = { id: "1", email: "ana@example.com" };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ user }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCurrentUser("abc")).resolves.toEqual(user);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/me");
    expect(init.headers).toEqual({ Authorization: "Bearer abc" });
  });
});

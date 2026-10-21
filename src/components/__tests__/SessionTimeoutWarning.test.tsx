import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

const kc = vi.hoisted(() => ({
  refreshTokenParsed: { exp: 0 },
  timeSkew: 0,
  updateToken: vi.fn(),
  login: vi.fn(),
}));
const signOut = vi.hoisted(() => vi.fn());

vi.mock("@/auth/keycloak", () => ({ isKeycloakEnabled: true, keycloak: kc }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ profile: { role: "dfp" }, signOut }),
}));

import { SessionTimeoutWarning } from "@/components/SessionTimeoutWarning";

const expIn = (sec: number) => {
  kc.refreshTokenParsed.exp = Math.floor(Date.now() / 1000) + sec;
};

describe("SessionTimeoutWarning (WCAG 2.2.1)", () => {
  beforeEach(() => {
    kc.updateToken.mockReset();
    signOut.mockReset();
  });

  it("non mostra nulla se la scadenza è lontana", async () => {
    expIn(3600);
    render(<SessionTimeoutWarning />);
    await act(async () => {});
    expect(screen.queryByText("La sessione sta per scadere")).toBeNull();
  });

  it("avvisa prima della scadenza e permette di prolungare la sessione", async () => {
    expIn(60);
    // il rinnovo silenzioso (utente "attivo" al montaggio) fallisce -> compare l'avviso
    kc.updateToken.mockRejectedValueOnce(new Error("refresh non riuscito"));
    render(<SessionTimeoutWarning />);
    await screen.findByText("La sessione sta per scadere");
    kc.updateToken.mockResolvedValue(true);
    fireEvent.click(screen.getByText("Resta collegato"));
    await waitFor(() => expect(kc.updateToken).toHaveBeenLastCalledWith(-1));
    await waitFor(() => expect(screen.queryByText("La sessione sta per scadere")).toBeNull());
  });

  it("a sessione scaduta propone di accedere di nuovo", async () => {
    expIn(-5);
    render(<SessionTimeoutWarning />);
    await screen.findByText("Sessione scaduta");
    fireEvent.click(screen.getByText("Accedi di nuovo"));
    expect(kc.login).toHaveBeenCalled();
  });
});

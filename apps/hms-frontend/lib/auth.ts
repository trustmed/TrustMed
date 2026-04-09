import type { JwtPayload } from "jwt-decode";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

export interface DecodedUser extends JwtPayload {
  sub: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  personId?: string;
  isDemoDisabled?: boolean;
  active?: boolean;
}

export function getAuthUser(
  cookieName = "access_token"
): DecodedUser | null {
  if (typeof document === "undefined") return null;
  const value = Cookies.get(cookieName);
  if (!value) return null;
  try {
    return jwtDecode(value) as DecodedUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}

export function logout() {
  Cookies.remove("access_token", { path: "/" });
}

type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none" | boolean;
  path?: string;
  maxAge?: number;
  expires?: Date;
};

const isProduction = process.env.NODE_ENV === "production";

export const getSecureCookieOptions = (
  options: CookieOptions = {}
): CookieOptions => ({
  ...options,
  secure: isProduction ? true : options.secure ?? false,
  sameSite: options.sameSite ?? "lax",
  path: options.path ?? "/",
});

export const getAuthCookieOptions = (
  options: CookieOptions = {}
): CookieOptions => ({
  ...getSecureCookieOptions(options),
  httpOnly: options.httpOnly ?? true,
});

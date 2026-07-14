export function isSessionInvalidatingCode(code: string): boolean {
  return [
    "ACCOUNT_DELETED",
    "REFRESH_TOKEN_REUSE",
    "SESSION_REVOKED",
    "USER_SUSPENDED",
  ].includes(code);
}

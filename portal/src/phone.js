// One way to read a Bahraini phone number, used everywhere.
//
// Logging in and creating a client used to normalise differently: a client was stored
// as 8 digits, but the login compared the raw string. So "+973 3566 5422" — the same
// number the person had just been given — did not match, and five tries later the
// brake locked them out of their own portal.
//
// Accepts anything a person actually types: +973 3566 5422, 973-3566-5422, 3566 5422.
// Returns the 8 digits, or "" when there is nothing usable.
export function normPhone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  // A local number is 8 digits. Longer means a country code is on the front; 973 is
  // Bahrain's, and stripping it is only safe once we know the rest is a full number.
  const local = digits.length > 8 && digits.startsWith("973") ? digits.slice(3) : digits;
  return local.slice(0, 15);
}

// Placeholder seats are stored with a non-numeric handle rather than a number, so they
// can never collide with a real phone and can never be logged into.
export const isPlaceholderHandle = (v) => /^PLACEHOLDER-/.test(String(v ?? ""));

import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import { Currencies } from '../features/wallet/validation/walletSchema';

export type SupportedCurrency = (typeof Currencies)[number];

/** Countries whose native currency CrossPesa supports directly. */
const SUPPORTED_COUNTRY_CURRENCY: Partial<Record<CountryCode, SupportedCurrency>> = {
  KE: 'KES',
  GB: 'GBP',
  US: 'USD',
  CA: 'CAD',
  AU: 'AUD',
  CN: 'CNY',
  JP: 'JPY',
  PK: 'PKR',
  AE: 'AED',
  SA: 'SAR',
  SE: 'SEK',
  // Eurozone members share EUR
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR',
  AT: 'EUR', PT: 'EUR', IE: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR',
  SK: 'EUR', SI: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR', CY: 'EUR',
  MT: 'EUR', HR: 'EUR',
};

const FALLBACK_CURRENCY: SupportedCurrency = 'USD';

export interface PhoneDerivedInfo {
  /** ISO2 country code, uppercase — e.g. "KE", "GB" */
  countryCode: string;
  currency: SupportedCurrency;
}

/**
 * Maps an international phone number to its country + default supported currency.
 *
 *   "+254712345678" -> { countryCode: "KE", currency: "KES" }
 *   "+447911123456" -> { countryCode: "GB", currency: "GBP" }
 *   "+2567..."      -> { countryCode: "UG", currency: "USD" } (native UGX unsupported)
 *
 * Returns null while the number is incomplete/unparseable — callers simply
 * don't populate anything until the value becomes valid.
 */
export const deriveFromPhone = (
  rawPhone: string,
  options: { defaultCountry?: CountryCode } = {}
): PhoneDerivedInfo | null => {
  const trimmed = rawPhone.trim();
  if (!trimmed) return null;

  // Try as-typed first (handles "+254…" / "00254…"), then fall back to
  // national format under a default country ("07…" -> KE).
  const parsed =
    parsePhoneNumberFromString(trimmed) ??
    (options.defaultCountry
      ? parsePhoneNumberFromString(trimmed, options.defaultCountry)
      : undefined);

  if (!parsed || !parsed.isValid() || !parsed.country) return null;

  return {
    countryCode: parsed.country,
    currency: SUPPORTED_COUNTRY_CURRENCY[parsed.country] ?? FALLBACK_CURRENCY,
  };
};

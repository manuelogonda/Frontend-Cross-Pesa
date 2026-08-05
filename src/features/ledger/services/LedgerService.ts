import type { FormattedLedgerEntry, LedgerDirection, LedgerEntryResponse } from "../types";

export class LedgerService {
  /**
   * Transforms raw backend DTO into a formatted UI representation.
   */
  static formatEntry(entry: LedgerEntryResponse): FormattedLedgerEntry {
    let direction: LedgerDirection = 'NEUTRAL';
    let rawAmount = 0;
    let sign = '';

    // Determine direction and amount based on credit, debit, or net amount fallback
    if (entry.credit > 0) {
      direction = 'CREDIT';
      rawAmount = entry.credit;
      sign = '+';
    } else if (entry.debit > 0) {
      direction = 'DEBIT';
      rawAmount = entry.debit;
      sign = '-';
    } else if (entry.amount !== 0) {
      // Fallback using the net amount column if credit/debit fields are zero
      rawAmount = Math.abs(entry.amount);
      if (entry.amount > 0) {
        direction = 'CREDIT';
        sign = '+';
      } else {
        direction = 'DEBIT';
        sign = '-';
      }
    }

    const formattedAmount = `${sign}${rawAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${entry.currency}`;

    const formattedBalance = entry.balanceAfter != null
      ? `${entry.balanceAfter.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ${entry.currency}`
      : `0.00 ${entry.currency}`;

    const { badgeColor } = LedgerService.formatEntryClass(entry.entryClass);

    return {
      ...entry,
      direction,
      formattedAmount,
      formattedBalance,
      badgeColor,
    };
  }

  /**
   * Formats human-readable badges for backend entryClass strings.
   */
  static formatEntryClass(entryClass: string): { label: string; badgeColor: string } {
    switch (entryClass) {
      case 'PRINCIPAL_TRANSFER':
        return { label: 'Transfer', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'DEPOSIT':
        return { label: 'Top-Up', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'MARKUP_FEE':
        return { label: 'Platform Fee', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'ROUTING_FEE':
        return { label: 'Network Fee', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'FX_CLEARING':
        return { label: 'FX Exchange', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'WITHDRAWAL':
        return { label: 'Payout', badgeColor: 'bg-orange-50 text-orange-700 border-orange-200' };
      default:
        return { label: entryClass.replace(/_/g, ' '), badgeColor: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  }
}
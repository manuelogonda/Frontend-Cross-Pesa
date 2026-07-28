import { useLiveQuote } from "../hooks/useRatesHook";

interface RateDisplayCardProps {
  sourceCurrency: string;
  destinationCurrency: string;
  amountToConvert?: number;
}

export const RateDisplayCard: React.FC<RateDisplayCardProps> = ({
  sourceCurrency,
  destinationCurrency,
  amountToConvert = 1
}) => {
  const { quote, isLoading, error } = useLiveQuote(sourceCurrency, destinationCurrency);

  if (!sourceCurrency || !destinationCurrency || sourceCurrency === destinationCurrency) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 mt-4 animate-pulse">
        Fetching live market rate...
      </div>
    );
  }

  if (error) {
    const errorMessage = typeof error === 'string' 
      ? error 
      : (error as any)?.error || (error as any)?.message || "Market rates unavailable";

    return (
      <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm mt-4">
        {errorMessage}
      </div>
    );
  }

  if (!quote) return null;

  const convertedTotal = (amountToConvert * quote.exchangeRate).toFixed(2);
  const formattedRate = quote.exchangeRate.toFixed(4);

  return (
    <div className="bg-indigo-50 p-4 rounded-lg shadow-md mt-4">
      {/* Rate Header */}
      <div className="text-sm font-medium text-indigo-900">
        1 {quote.sourceCurrency} = {formattedRate} {quote.destinationCurrency}
      </div>

      {/* Recipient Calculation */}
      {amountToConvert > 0 && (
        <div className="flex justify-between items-center pt-3 border-t border-indigo-200 mt-3">
          <span className="font-semibold text-indigo-900">Recipient Gets</span>
          <span className="text-xl font-bold text-indigo-700">
            {convertedTotal} {quote.destinationCurrency}
          </span>
        </div>
      )}

      {/* Expiry Timestamp */}
      <div className="text-[10px] text-indigo-400 text-right mt-1">
        Rate locked until {new Date(quote.expiresAt).toLocaleTimeString()}
      </div>
    </div>
  );
};
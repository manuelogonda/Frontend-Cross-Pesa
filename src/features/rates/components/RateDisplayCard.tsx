import { useLiveQuote } from "../hooks/useRatesHook";
import { Skeleton } from "../../../components/ui/Skeleton";


export interface RateDisplayCardProps {
  rate?: number;
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
      <div role="status" aria-label="Loading live market rate" className="p-4 bg-gray-50 border border-gray-200 rounded-lg mt-4 space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-7 w-36" />
        <span className="sr-only">Fetching live market rate...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm mt-4">
        {error || "Market rates unavailable"}
      </div>
    );
  }

  if (!quote) return null;

  // Safely coerce exchangeRate to a number to prevent runtime .toFixed() crashes
  const rateValue = Number(quote.exchangeRate);
  const convertedTotal = (amountToConvert * rateValue).toFixed(2);
  const formattedRate = rateValue.toFixed(4);

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

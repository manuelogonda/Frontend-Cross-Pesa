import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WalletCard } from './WalletCard';
import { makeWallet } from '../../../test/msw/handlers';

describe('<WalletCard />', () => {
  it('formats a KES balance with thousands separators and 2 decimals', () => {
    render(
      <WalletCard wallet={makeWallet({ currency: 'KES', availableBalance: 1234567.891 })} />
    );
    expect(screen.getByText('Primary Balance')).toBeInTheDocument();
    expect(screen.getByText('KES 1,234,567.89')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('renders USD balances and shows locked funds when present', () => {
    render(
      <WalletCard
        wallet={makeWallet({
          currency: 'USD',
          availableBalance: 4200.5,
          lockedBalance: 300.25,
          status: 'FROZEN',
        })}
      />
    );
    expect(screen.getByText('USD 4,200.50')).toBeInTheDocument();
    expect(screen.getByText(/Locked \/ Processing Funds/i)).toBeInTheDocument();
    expect(screen.getByText('USD 300.25')).toBeInTheDocument();
    expect(screen.getByText('FROZEN')).toBeInTheDocument();
  });

  it('hides the locked-funds row when nothing is locked', () => {
    render(<WalletCard wallet={makeWallet({ lockedBalance: 0 })} />);
    expect(screen.queryByText(/Locked \/ Processing Funds/i)).not.toBeInTheDocument();
  });
});
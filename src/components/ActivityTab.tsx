import React from 'react';
import { useCurrentAccount, useSuiClientQuery } from '@onelabs/dapp-kit';

const ActivityTab: React.FC = () => {
  const currentAccount = useCurrentAccount();

  // Query for transaction blocks
  const { data: transactions, isLoading } = useSuiClientQuery(
    'queryTransactionBlocks',
    {
      filter: {
        FromAddress: currentAccount?.address ?? ''
      },
      options: {
        showEffects: true,
        showInput: true,
        showEvents: true,
        showObjectChanges: true,
        showBalanceChanges: true
      },
      limit: 20,
      order: 'descending'
    },
    {
      enabled: !!currentAccount?.address
    }
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTransactionType = (tx: any) => {
    // Analyze transaction to determine type
    if (tx.transaction?.data?.transaction?.kind === 'ProgrammableTransaction') {
      const commands = tx.transaction.data.transaction.commands || [];
      if (commands.some((cmd: any) => cmd.MoveCall?.function === 'issue')) {
        return 'Coupon Issued';
      }
      if (commands.some((cmd: any) => cmd.MoveCall?.function === 'redeem')) {
        return 'Coupon Redeemed';
      }
      if (commands.some((cmd: any) => cmd.TransferObjects)) {
        return 'Transfer';
      }
    }
    return 'Transaction';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="badge badge-success">Success</span>;
      case 'failure':
        return <span className="badge badge-error">Failed</span>;
      default:
        return <span className="badge">Unknown</span>;
    }
  };

  if (!currentAccount) {
    return (
      <div className="card">
        <h2>Transaction Activity</h2>
        <p>Please connect your wallet to view transaction history.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card">
        <h2>Transaction Activity</h2>
        <p>Loading transaction history...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Transaction Activity</h2>
      <p>Your recent OneChain transactions</p>
      
      {!transactions?.data || transactions.data.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#6b7280' 
        }}>
          <p>No transactions found</p>
          <p style={{ fontSize: '0.875rem' }}>
            Start by issuing or redeeming coupons to see activity here
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {transactions.data.map((tx: any) => (
            <div 
              key={tx.digest}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1rem',
                background: tx.effects?.status?.status === 'success' ? '#fefefe' : '#fef2f2'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '0.5rem'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0' }}>
                    {getTransactionType(tx)}
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    color: '#6b7280', 
                    fontSize: '0.875rem',
                    fontFamily: 'monospace'
                  }}>
                    {formatAddress(tx.digest)}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                  {getStatusBadge(tx.effects?.status?.status)}
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {tx.timestampMs ? formatDate(parseInt(tx.timestampMs)) : 'Unknown time'}
                  </span>
                </div>
              </div>

              {/* Gas used */}
              {tx.effects?.gasUsed && (
                <p style={{ 
                  margin: '0.5rem 0 0 0', 
                  fontSize: '0.875rem', 
                  color: '#6b7280' 
                }}>
                  Gas used: {Math.round(parseInt(tx.effects.gasUsed.computationCost) / 1_000_000)} MIST
                </p>
              )}

              {/* Balance changes */}
              {tx.balanceChanges && tx.balanceChanges.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ 
                    margin: '0 0 0.25rem 0', 
                    fontSize: '0.875rem', 
                    fontWeight: '500' 
                  }}>
                    Balance Changes:
                  </p>
                  {tx.balanceChanges.map((change: any, index: number) => (
                    <p key={index} style={{ 
                      margin: '0.25rem 0', 
                      fontSize: '0.75rem', 
                      color: parseInt(change.amount) > 0 ? '#059669' : '#dc2626',
                      fontFamily: 'monospace'
                    }}>
                      {parseInt(change.amount) > 0 ? '+' : ''}{(parseInt(change.amount) / 1_000_000_000).toFixed(6)} OCT
                    </p>
                  ))}
                </div>
              )}

              {/* View on explorer button */}
              <button
                onClick={() => window.open(`https://onescan.cc/txblock/${tx.digest}`, '_blank')}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                View on Explorer ↗
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        marginTop: '1.5rem', 
        textAlign: 'center', 
        fontSize: '0.875rem', 
        color: '#6b7280' 
      }}>
        <p>
          Showing recent transactions • 
          <a 
            href={`https://onescan.cc/address/${currentAccount.address}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: '0.5rem', color: '#3b82f6' }}
          >
            View all on Explorer ↗
          </a>
        </p>
      </div>
    </div>
  );
};

export default ActivityTab;

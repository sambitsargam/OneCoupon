import React, { useState } from 'react';
import { useCurrentAccount } from '@onelabs/dapp-kit';

interface Coupon {
  id: string;
  code: string;
  valueBps: number;
  maxUses: number;
  used: number;
  expiresAt: number;
  merchant: string;
}

interface MyCouponsTabProps {
  network: 'onechain-testnet' | 'onechain-mainnet';
}

const MyCouponsTab: React.FC<MyCouponsTabProps> = () => {
  const currentAccount = useCurrentAccount();
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [orderTotal, setOrderTotal] = useState('');

  // Query for owned coupon objects (currently unused, replace mock data when ready)
  /*
  const { data: ownedObjects } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: currentAccount?.address ?? '',
      filter: {
        StructType: '0x1::coupon::Coupon'
      },
      options: {
        showContent: true,
        showType: true
      }
    },
    {
      enabled: !!currentAccount?.address
    }
  );
  */

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getCouponStatus = (coupon: Coupon) => {
    const now = Date.now();
    if (now > coupon.expiresAt) return 'expired';
    if (coupon.used >= coupon.maxUses) return 'used';
    return 'active';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>;
      case 'expired':
        return <span className="badge badge-warning">Expired</span>;
      case 'used':
        return <span className="badge badge-error">Used Up</span>;
      default:
        return <span className="badge">Unknown</span>;
    }
  };

  const handleRedeem = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
  };

  const executeRedeem = async () => {
    if (!selectedCoupon || !orderTotal) return;

    // This would execute the redeem transaction
    console.log('Redeeming coupon:', selectedCoupon.id, 'for order total:', orderTotal);
    
    // Reset form
    setSelectedCoupon(null);
    setOrderTotal('');
  };

  if (!currentAccount) {
    return (
      <div className="card">
        <h2>My Coupons</h2>
        <p>Please connect your wallet to view your coupons.</p>
      </div>
    );
  }

  // Mock data for demonstration (replace with actual data from ownedObjects)
  const mockCoupons: Coupon[] = [
    {
      id: '0x123...',
      code: 'SAVE20',
      valueBps: 2000,
      maxUses: 1,
      used: 0,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
      merchant: '0xabc...'
    },
    {
      id: '0x456...',
      code: 'WELCOME10',
      valueBps: 1000,
      maxUses: 3,
      used: 1,
      expiresAt: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago (expired)
      merchant: '0xdef...'
    }
  ];

  return (
    <div>
      <div className="card">
        <h2>My Coupons</h2>
        <p>Manage and redeem your tokenized coupons</p>
        
        {mockCoupons.length === 0 ? (
          <p>No coupons found. Get some coupons from merchants!</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {mockCoupons.map((coupon) => {
              const status = getCouponStatus(coupon);
              return (
                <div 
                  key={coupon.id}
                  className={`coupon-card ${status === 'expired' ? 'coupon-expired' : status === 'active' ? 'coupon-active' : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>{coupon.code}</h3>
                      <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
                        {(coupon.valueBps / 100).toFixed(2)}% discount
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                        Uses: {coupon.used}/{coupon.maxUses}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                        Expires: {formatDate(coupon.expiresAt)}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                        Merchant: {formatAddress(coupon.merchant)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      {getStatusBadge(status)}
                      {status === 'active' && (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleRedeem(coupon)}
                          style={{ fontSize: '0.875rem' }}
                        >
                          Redeem
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Redeem Dialog */}
      {selectedCoupon && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ minWidth: '400px' }}>
            <h3>Redeem Coupon: {selectedCoupon.code}</h3>
            <p>Discount: {(selectedCoupon.valueBps / 100).toFixed(2)}%</p>
            
            <div className="form-group">
              <label className="form-label">Order Total (OCT)</label>
              <input
                type="number"
                className="form-input"
                value={orderTotal}
                onChange={(e) => setOrderTotal(e.target.value)}
                placeholder="Enter order total"
                step="0.001"
              />
            </div>

            {orderTotal && (
              <div style={{ 
                padding: '1rem', 
                background: '#f0fdf4', 
                borderRadius: '0.375rem',
                marginBottom: '1rem'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#dc2626', marginBottom: '0.5rem' }}>
                  Discount: {((parseFloat(orderTotal) * selectedCoupon.valueBps) / 10000).toFixed(3)} OCT
                </p>
                <p style={{ fontSize: '0.875rem', color: '#059669', marginBottom: '0.5rem' }}>
                  Final Total: {(parseFloat(orderTotal) - (parseFloat(orderTotal) * selectedCoupon.valueBps) / 10000).toFixed(3)} OCT
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedCoupon(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={executeRedeem}
                disabled={!orderTotal}
              >
                Confirm Redeem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCouponsTab;

import React, { useState } from 'react';
import { useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction } from '@onelabs/dapp-kit';
import { Transaction } from '@onelabs/sui/transactions';

interface Coupon {
  id: string;
  code: string;
  valueBps: number;
  maxUses: number;
  used: number;
  expiresAt: number;
  merchant: string;
  owner: string;
}

interface MyCouponsTabProps {
  network: 'onechain-testnet' | 'onechain-mainnet';
}

const MyCouponsTab: React.FC<MyCouponsTabProps> = () => {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [orderTotal, setOrderTotal] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Package ID from environment
  const packageId = import.meta.env.VITE_PACKAGE_ID;

  // Query for owned coupon objects
  const { data: ownedObjects, refetch: refetchCoupons } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: currentAccount?.address ?? '',
      filter: {
        StructType: `${packageId}::coupon::Coupon`
      },
      options: {
        showContent: true,
        showType: true
      }
    },
    {
      enabled: !!currentAccount?.address && !!packageId
    }
  );

  // Parse coupon data from blockchain objects
  const coupons: Coupon[] = (ownedObjects?.data || [])
    .map((obj: any) => {
      const fields = obj.data?.content?.fields;
      if (!fields) return null;
      
      return {
        id: obj.data.objectId,
        code: new TextDecoder().decode(new Uint8Array(fields.code)),
        valueBps: parseInt(fields.value_bps),
        maxUses: parseInt(fields.max_uses),
        used: parseInt(fields.used),
        expiresAt: parseInt(fields.expires_at_ms),
        merchant: fields.merchant,
        owner: fields.owner
      };
    })
    .filter((coupon): coupon is Coupon => coupon !== null);

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
    setResult(null); // Clear previous results
  };

  if (!currentAccount) {
    return (
      <div className="card">
        <h2>My Coupons</h2>
        <p>Please connect your wallet to view your coupons.</p>
      </div>
    );
  }

  const redeemCoupon = async () => {
    if (!selectedCoupon || !currentAccount || !packageId || !orderTotal) {
      setResult('Missing required information for redemption');
      return;
    }

    setRedeeming(true);
    try {
      const tx = new Transaction();
      
      // We need a clock object for timestamp validation
      // For now, we'll use shared clock at 0x6
      const clockObjectId = '0x6';
      
      tx.moveCall({
        target: `${packageId}::coupon::redeem`,
        arguments: [
          tx.object(selectedCoupon.id), // coupon object
          tx.pure.u64(Math.floor(parseFloat(orderTotal) * 1_000_000_000)), // order total in MIST
          tx.object(clockObjectId) // clock
        ]
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            const discount = (parseFloat(orderTotal) * selectedCoupon.valueBps) / 10000;
            setResult(`Coupon redeemed successfully! Discount: ${discount.toFixed(3)} OCT. Transaction: ${result.digest}`);
            setSelectedCoupon(null);
            setOrderTotal('');
            refetchCoupons(); // Refresh coupon list
          },
          onError: (error) => {
            console.error('Redemption failed:', error);
            setResult(`Redemption failed: ${error.message}`);
          }
        }
      );
    } catch (error) {
      console.error('Error redeeming coupon:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRedeeming(false);
    }
  };  return (
    <div>
      <div className="card">
        <h2>My Coupons</h2>
        <p>Manage and redeem your tokenized coupons</p>
        
        {coupons.length === 0 ? (
          <p>No coupons found. Get some coupons from merchants!</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {coupons.map((coupon) => {
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

        {/* Result Display */}
        {result && (
          <div style={{
            padding: '1rem',
            marginTop: '1rem',
            borderRadius: '0.375rem',
            background: result.includes('failed') || result.includes('Error') ? '#fee2e2' : '#dcfce7',
            color: result.includes('failed') || result.includes('Error') ? '#dc2626' : '#059669'
          }}>
            {result}
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
                onClick={redeemCoupon}
                disabled={redeeming || !orderTotal || parseFloat(orderTotal) <= 0}
              >
                {redeeming ? 'Redeeming...' : 'Confirm Redeem'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCouponsTab;

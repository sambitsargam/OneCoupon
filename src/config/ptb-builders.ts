// PTB builders for OneCoupon smart contract interactions
// These will be used when the Move package is deployed

import { Transaction } from '@mysten/sui/transactions';

// Configuration
export interface CouponConfig {
  packageId: string;
  moduleName: string;
}

// PTB for issuing a new coupon
export function buildIssueCouponPTB(
  config: CouponConfig,
  params: {
    recipient: string;
    code: string;
    valueBps: number;
    maxUses: number;
    expiresAtMs: number;
  }
): Transaction {
  const tx = new Transaction();
  
  // Call the issue function from the coupon module
  tx.moveCall({
    target: `${config.packageId}::${config.moduleName}::issue`,
    arguments: [
      tx.pure.address(params.recipient),
      tx.pure.vector('u8', Array.from(new TextEncoder().encode(params.code))),
      tx.pure.u16(params.valueBps),
      tx.pure.u8(params.maxUses),
      tx.pure.u64(params.expiresAtMs)
    ]
  });

  return tx;
}

// PTB for redeeming a coupon
export function buildRedeemCouponPTB(
  config: CouponConfig,
  params: {
    couponId: string;
    orderTotalOct: string;
  }
): Transaction {
  const tx = new Transaction();
  
  // Call the redeem function
  tx.moveCall({
    target: `${config.packageId}::${config.moduleName}::redeem`,
    arguments: [
      tx.object(params.couponId),
      tx.pure.u64(params.orderTotalOct)
    ]
  });

  return tx;
}

// PTB for transferring a coupon
export function buildTransferCouponPTB(
  config: CouponConfig,
  params: {
    couponId: string;
    newOwner: string;
  }
): Transaction {
  const tx = new Transaction();
  
  // Call the transfer_to function
  tx.moveCall({
    target: `${config.packageId}::${config.moduleName}::transfer_to`,
    arguments: [
      tx.object(params.couponId),
      tx.pure.address(params.newOwner)
    ]
  });

  return tx;
}

// Utility function to create merchant registry entry (if using merchant system)
export function buildRegisterMerchantPTB(
  config: CouponConfig,
  merchantAddress: string
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${config.packageId}::${config.moduleName}::register_merchant`,
    arguments: [
      tx.pure.address(merchantAddress)
    ]
  });

  return tx;
}

// Example usage functions for the frontend

export async function issueCoupon(
  signAndExecute: any,
  config: CouponConfig,
  params: {
    recipient: string;
    code: string;
    valueBps: number;
    maxUses: number;
    expiresAtMs: number;
  }
) {
  const tx = buildIssueCouponPTB(config, params);
  
  return new Promise((resolve, reject) => {
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result: any) => {
          console.log('Coupon issued successfully:', result.digest);
          resolve(result);
        },
        onError: (error: any) => {
          console.error('Failed to issue coupon:', error);
          reject(error);
        }
      }
    );
  });
}

export async function redeemCoupon(
  signAndExecute: any,
  config: CouponConfig,
  params: {
    couponId: string;
    orderTotalOct: string;
  }
) {
  const tx = buildRedeemCouponPTB(config, params);
  
  return new Promise((resolve, reject) => {
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result: any) => {
          console.log('Coupon redeemed successfully:', result.digest);
          resolve(result);
        },
        onError: (error: any) => {
          console.error('Failed to redeem coupon:', error);
          reject(error);
        }
      }
    );
  });
}

// CLI command generators for testing

export function generateIssueCLI(
  packageId: string,
  params: {
    recipient: string;
    code: string;
    valueBps: number;
    maxUses: number;
    expiresAtMs: number;
  }
): string {
  return `one client ptb \\
  --move-call ${packageId}::coupon::issue \\
    ${params.recipient} \\
    '[${Array.from(new TextEncoder().encode(params.code)).join(',')}]' \\
    ${params.valueBps} \\
    ${params.maxUses} \\
    ${params.expiresAtMs} \\
  --gas-budget 5000000`;
}

export function generateRedeemCLI(
  packageId: string,
  params: {
    couponId: string;
    orderTotalOct: string;
  }
): string {
  return `one client ptb \\
  --move-call ${packageId}::coupon::redeem \\
    ${params.couponId} \\
    ${params.orderTotalOct} \\
  --gas-budget 5000000`;
}

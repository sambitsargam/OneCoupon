/// OneCoupon - Tokenized retail coupons on OneChain
/// E-commerce partners can issue on-chain coupons; users hold them in wallets and redeem at checkout
module onecoupon::coupon {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::clock::{Self, Clock};
    use sui::event;
    use std::option::{Self, Option};
    
    // ======== Constants ========
    
    /// Maximum basis points (100%)
    const MAX_BPS: u16 = 10_000;
    
    // ======== Error codes ========
    
    /// Invalid basis points value (must be 1-10000)
    const EInvalidBasisPoints: u64 = 1;
    /// Coupon has expired
    const ECouponExpired: u64 = 2;
    /// Coupon has no remaining uses
    const ECouponExhausted: u64 = 3;
    /// Not the owner of the coupon
    const ENotOwner: u64 = 4;
    /// Not authorized merchant admin
    const ENotMerchantAdmin: u64 = 5;
    
    // ======== Structs ========
    
    /// Represents a merchant that can issue coupons
    struct Merchant has key {
        id: UID,
        admin: address,
    }
    
    /// Represents a tokenized coupon
    struct Coupon has key, store {
        id: UID,
        merchant: address,
        owner: address,
        code: vector<u8>,
        value_bps: u16,
        max_uses: u8,
        used: u8,
        expires_at_ms: u64,
    }
    
    // ======== Events ========
    
    struct CouponIssued has copy, drop {
        coupon_id: address,
        merchant: address,
        owner: address,
        code: vector<u8>,
        value_bps: u16,
        max_uses: u8,
        expires_at_ms: u64,
    }
    
    struct CouponRedeemed has copy, drop {
        coupon_id: address,
        merchant: address,
        owner: address,
        order_total_oct: u64,
        discount_oct: u64,
        uses_remaining: u8,
    }
    
    struct CouponExpired has copy, drop {
        coupon_id: address,
        merchant: address,
        owner: address,
    }
    
    struct MerchantCreated has copy, drop {
        merchant_id: address,
        admin: address,
    }
    
    // ======== Public entry functions ========
    
    /// Create a new merchant registry
    public entry fun create_merchant(ctx: &mut TxContext) {
        let admin = tx_context::sender(ctx);
        let merchant = Merchant {
            id: object::new(ctx),
            admin,
        };
        
        event::emit(MerchantCreated {
            merchant_id: object::uid_to_address(&merchant.id),
            admin,
        });
        
        transfer::share_object(merchant);
    }
    
    /// Issue a new coupon (merchant admin only)
    public entry fun issue(
        merchant: &Merchant,
        to: address,
        code: vector<u8>,
        value_bps: u16,
        max_uses: u8,
        expires_at_ms: u64,
        ctx: &mut TxContext
    ) {
        // Verify sender is merchant admin
        assert!(tx_context::sender(ctx) == merchant.admin, ENotMerchantAdmin);
        
        // Validate basis points
        assert!(value_bps > 0 && value_bps <= MAX_BPS, EInvalidBasisPoints);
        
        let coupon = Coupon {
            id: object::new(ctx),
            merchant: merchant.admin,
            owner: to,
            code,
            value_bps,
            max_uses,
            used: 0,
            expires_at_ms,
        };
        
        event::emit(CouponIssued {
            coupon_id: object::uid_to_address(&coupon.id),
            merchant: merchant.admin,
            owner: to,
            code,
            value_bps,
            max_uses,
            expires_at_ms,
        });
        
        transfer::public_transfer(coupon, to);
    }
    
    /// Transfer coupon to a new owner
    public entry fun transfer_to(coupon: Coupon, new_owner: address) {
        coupon.owner = new_owner;
        transfer::public_transfer(coupon, new_owner);
    }
    
    /// Redeem a coupon for discount
    public entry fun redeem(
        mut coupon: Coupon,
        order_total_oct: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ): (u64, Option<Coupon>) {
        // Verify ownership
        assert!(tx_context::sender(ctx) == coupon.owner, ENotOwner);
        
        // Check expiry
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time < coupon.expires_at_ms, ECouponExpired);
        
        // Check remaining uses
        assert!(coupon.used < coupon.max_uses, ECouponExhausted);
        
        // Calculate discount
        let discount_oct = (order_total_oct * (coupon.value_bps as u64)) / (MAX_BPS as u64);
        
        // Increment usage
        coupon.used = coupon.used + 1;
        
        event::emit(CouponRedeemed {
            coupon_id: object::uid_to_address(&coupon.id),
            merchant: coupon.merchant,
            owner: coupon.owner,
            order_total_oct,
            discount_oct,
            uses_remaining: coupon.max_uses - coupon.used,
        });
        
        // Return coupon if still has uses, otherwise burn it
        if (coupon.used == coupon.max_uses) {
            let Coupon { id, merchant: _, owner: _, code: _, value_bps: _, max_uses: _, used: _, expires_at_ms: _ } = coupon;
            object::delete(id);
            (discount_oct, option::none())
        } else {
            (discount_oct, option::some(coupon))
        }
    }
    
    // ======== View functions ========
    
    /// Get coupon details
    public fun get_coupon_info(coupon: &Coupon): (address, address, vector<u8>, u16, u8, u8, u64) {
        (
            coupon.merchant,
            coupon.owner,
            coupon.code,
            coupon.value_bps,
            coupon.max_uses,
            coupon.used,
            coupon.expires_at_ms
        )
    }
    
    /// Check if coupon is expired
    public fun is_expired(coupon: &Coupon, clock: &Clock): bool {
        clock::timestamp_ms(clock) >= coupon.expires_at_ms
    }
    
    /// Check if coupon is exhausted
    public fun is_exhausted(coupon: &Coupon): bool {
        coupon.used >= coupon.max_uses
    }
    
    /// Get merchant admin
    public fun get_merchant_admin(merchant: &Merchant): address {
        merchant.admin
    }
}

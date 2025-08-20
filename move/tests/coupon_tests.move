#[test_only]
module onecoupon::coupon_tests {
    use onecoupon::coupon::{Self, Merchant, Coupon};
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock::{Self, Clock};
    use std::option;
    use std::vector;
    
    const MERCHANT_ADMIN: address = @0x123;
    const COUPON_OWNER: address = @0x456;
    const RANDOM_USER: address = @0x789;
    
    fun setup_test(): (Scenario, Clock) {
        let scenario = ts::begin(MERCHANT_ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        clock::set_for_testing(&mut clock, 1000000); // Set initial time
        (scenario, clock)
    }
    
    #[test]
    fun test_create_merchant() {
        let (mut scenario, clock) = setup_test();
        
        // Create merchant
        ts::next_tx(&mut scenario, MERCHANT_ADMIN);
        coupon::create_merchant(ts::ctx(&mut scenario));
        
        // Verify merchant was created
        ts::next_tx(&mut scenario, MERCHANT_ADMIN);
        let merchant = ts::take_shared<Merchant>(&scenario);
        assert!(coupon::get_merchant_admin(&merchant) == MERCHANT_ADMIN, 0);
        
        ts::return_shared(merchant);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
    
    #[test]
    fun test_issue_coupon() {
        let (mut scenario, clock) = setup_test();
        
        // Create merchant
        ts::next_tx(&mut scenario, MERCHANT_ADMIN);
        coupon::create_merchant(ts::ctx(&mut scenario));
        
        // Issue coupon
        ts::next_tx(&mut scenario, MERCHANT_ADMIN);
        let merchant = ts::take_shared<Merchant>(&scenario);
        coupon::issue(
            &merchant,
            COUPON_OWNER,
            b"SAVE20",
            2000, // 20%
            3, // max 3 uses
            2000000, // expires at 2000000ms
            ts::ctx(&mut scenario)
        );
        ts::return_shared(merchant);
        
        // Verify coupon was issued to owner
        ts::next_tx(&mut scenario, COUPON_OWNER);
        let coupon = ts::take_from_sender<Coupon>(&scenario);
        let (merchant_addr, owner, code, value_bps, max_uses, used, expires_at) = 
            coupon::get_coupon_info(&coupon);
        
        assert!(merchant_addr == MERCHANT_ADMIN, 1);
        assert!(owner == COUPON_OWNER, 2);
        assert!(code == b"SAVE20", 3);
        assert!(value_bps == 2000, 4);
        assert!(max_uses == 3, 5);
        assert!(used == 0, 6);
        assert!(expires_at == 2000000, 7);
        
        ts::return_to_sender(&scenario, coupon);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
    
    #[test]
    fun test_redeem_coupon_success() {
        let (mut scenario, mut clock) = setup_test();
        
        // Create merchant and issue coupon
        ts::next_tx(&mut scenario, MERCHANT_ADMIN);
        coupon::create_merchant(ts::ctx(&mut scenario));
        
        ts::next_tx(&mut scenario, MERCHANT_ADMIN);
        let merchant = ts::take_shared<Merchant>(&scenario);
        coupon::issue(
            &merchant,
            COUPON_OWNER,
            b"SAVE20",
            2000, // 20%
            2, // max 2 uses
            2000000, // expires at 2000000ms
            ts::ctx(&mut scenario)
        );
        ts::return_shared(merchant);
        
        // Redeem coupon
        ts::next_tx(&mut scenario, COUPON_OWNER);
        let coupon = ts::take_from_sender<Coupon>(&scenario);
        let order_total = 10000; // 10000 OCT
        
        let (discount, coupon_opt) = coupon::redeem(
            coupon,
            order_total,
            &clock,
            ts::ctx(&mut scenario)
        );
        
        // Verify discount calculation (20% of 10000 = 2000)
        assert!(discount == 2000, 8);
        
        // Verify coupon is returned since it has remaining uses
        assert!(option::is_some(&coupon_opt), 9);
        let returned_coupon = option::extract(&mut coupon_opt);
        let (_, _, _, _, _, used, _) = coupon::get_coupon_info(&returned_coupon);
        assert!(used == 1, 10);
        
        ts::return_to_sender(&scenario, returned_coupon);
        option::destroy_none(coupon_opt);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
    
    #[test]
    fun test_redeem_coupon_exhausted() {
        let (mut scenario, mut clock) = setup_test();
        
        // Create merchant and issue coupon with 1 use
        ts::next_tx(&mut scenario, MERCHANT_ADMIN);
        coupon::create_merchant(ts::ctx(&mut scenario));
        
        ts::next_tx(&mut scenario, MERCHANT_ADMIN);
        let merchant = ts::take_shared<Merchant>(&scenario);
        coupon::issue(
            &merchant,
            COUPON_OWNER,
            b"SAVE20",
            2000, // 20%
            1, // max 1 use only
            2000000, // expires at 2000000ms
            ts::ctx(&mut scenario)
        );
        ts::return_shared(merchant);
        
        // Redeem coupon (should be burned after this)
        ts::next_tx(&mut scenario, COUPON_OWNER);
        let coupon = ts::take_from_sender<Coupon>(&scenario);
        let order_total = 10000;
        
        let (discount, coupon_opt) = coupon::redeem(
            coupon,
            order_total,
            &clock,
            ts::ctx(&mut scenario)
        );
        
        // Verify discount calculation
        assert!(discount == 2000, 11);
        
        // Verify coupon is burned (not returned)
        assert!(option::is_none(&coupon_opt), 12);
        
        option::destroy_none(coupon_opt);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = coupon::ECouponExpired)]
    fun test_redeem_expired_coupon() {
        let (mut scenario, mut clock) = setup_test();
        
        // Create merchant and issue coupon
        ts::next_tx(&mut scenario, MERCHANT_ADMIN);
        coupon::create_merchant(ts::ctx(&mut scenario));
        
        ts::next_tx(&mut scenario, MERCHANT_ADMIN);
        let merchant = ts::take_shared<Merchant>(&scenario);
        coupon::issue(
            &merchant,
            COUPON_OWNER,
            b"SAVE20",
            2000,
            3,
            1500000, // expires at 1500000ms (before current time)
            ts::ctx(&mut scenario)
        );
        ts::return_shared(merchant);
        
        // Set clock to after expiry
        clock::set_for_testing(&mut clock, 2000000);
        
        // Try to redeem expired coupon (should fail)
        ts::next_tx(&mut scenario, COUPON_OWNER);
        let coupon = ts::take_from_sender<Coupon>(&scenario);
        let (_, coupon_opt) = coupon::redeem(
            coupon,
            10000,
            &clock,
            ts::ctx(&mut scenario)
        );
        
        option::destroy_none(coupon_opt);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = coupon::ENotOwner)]
    fun test_redeem_not_owner() {
        let (mut scenario, clock) = setup_test();
        
        // Create merchant and issue coupon
        ts::next_tx(&mut scenario, MERCHANT_ADMIN);
        coupon::create_merchant(ts::ctx(&mut scenario));
        
        ts::next_tx(&mut scenario, MERCHANT_ADMIN);
        let merchant = ts::take_shared<Merchant>(&scenario);
        coupon::issue(
            &merchant,
            COUPON_OWNER,
            b"SAVE20",
            2000,
            3,
            2000000,
            ts::ctx(&mut scenario)
        );
        ts::return_shared(merchant);
        
        // Transfer coupon to random user and try to redeem as different user
        ts::next_tx(&mut scenario, COUPON_OWNER);
        let coupon = ts::take_from_sender<Coupon>(&scenario);
        
        // Random user tries to redeem (should fail)
        ts::next_tx(&mut scenario, RANDOM_USER);
        let (_, coupon_opt) = coupon::redeem(
            coupon,
            10000,
            &clock,
            ts::ctx(&mut scenario)
        );
        
        option::destroy_none(coupon_opt);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = coupon::EInvalidBasisPoints)]
    fun test_invalid_basis_points() {
        let (mut scenario, clock) = setup_test();
        
        // Create merchant
        ts::next_tx(&mut scenario, MERCHANT_ADMIN);
        coupon::create_merchant(ts::ctx(&mut scenario));
        
        // Try to issue coupon with invalid basis points (should fail)
        ts::next_tx(&mut scenario, MERCHANT_ADMIN);
        let merchant = ts::take_shared<Merchant>(&scenario);
        coupon::issue(
            &merchant,
            COUPON_OWNER,
            b"INVALID",
            15000, // 150% - invalid!
            3,
            2000000,
            ts::ctx(&mut scenario)
        );
        ts::return_shared(merchant);
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
    
    #[test]
    fun test_transfer_coupon() {
        let (mut scenario, clock) = setup_test();
        
        // Create merchant and issue coupon
        ts::next_tx(&mut scenario, MERCHANT_ADMIN);
        coupon::create_merchant(ts::ctx(&mut scenario));
        
        ts::next_tx(&mut scenario, MERCHANT_ADMIN);
        let merchant = ts::take_shared<Merchant>(&scenario);
        coupon::issue(
            &merchant,
            COUPON_OWNER,
            b"SAVE20",
            2000,
            3,
            2000000,
            ts::ctx(&mut scenario)
        );
        ts::return_shared(merchant);
        
        // Transfer coupon to random user
        ts::next_tx(&mut scenario, COUPON_OWNER);
        let coupon = ts::take_from_sender<Coupon>(&scenario);
        coupon::transfer_to(coupon, RANDOM_USER);
        
        // Verify coupon is now owned by random user
        ts::next_tx(&mut scenario, RANDOM_USER);
        let transferred_coupon = ts::take_from_sender<Coupon>(&scenario);
        let (_, owner, _, _, _, _, _) = coupon::get_coupon_info(&transferred_coupon);
        assert!(owner == RANDOM_USER, 13);
        
        ts::return_to_sender(&scenario, transferred_coupon);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}

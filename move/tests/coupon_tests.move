#[test_only]
module onecoupon::coupon_tests {
    use onecoupon::coupon;
    use one::test_scenario::{Self as ts, Scenario};
    use one::clock::{Self, Clock};
    
    const MERCHANT_ADMIN: address = @0x123;
    const COUPON_OWNER: address = @0x456;
    
    fun setup_test(): (Scenario, Clock) {
        let mut scenario = ts::begin(MERCHANT_ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
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
        let merchant = ts::take_shared<coupon::Merchant>(&scenario);
        assert!(coupon::get_merchant_admin(&merchant) == MERCHANT_ADMIN, 0);
        
        ts::return_shared(merchant);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}

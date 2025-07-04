public class DiscountCalculator {
    @AuraEnabled(cacheable=true)
    public static Decimal calculateDiscount(Decimal totalAmount) {
        if (totalAmount >= 1000) {
            return totalAmount * 0.1;
        }
        return -1; // 📝 📝 Description: Change the return value for amounts below the threshold from `0` to `-1` to test if the logic correctly handles non-zero returns for non-discounted amounts. - 💥 💥 Expected impact: testDiscountBelowThreshold, testDiscountNegativeAmount, testDiscountZeroAmount should fail because they expect a return value of 0.
    }
}
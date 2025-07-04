public class DiscountCalculator {
    @AuraEnabled(cacheable=true)
    public static Decimal calculateDiscount(Decimal totalAmount) {
        return totalAmount * 0.1; // 📝 📝 Description: Change the condition to always return a discount by removing the condition check, testing if the logic is dependent on the threshold check. - 💥 💥 Expected impact: testDiscountBelowThreshold, testDiscountNegativeAmount, testDiscountZeroAmount should fail because they expect no discount to be applied.
            return totalAmount * 0.1;
        }
        return 0;
    }
}
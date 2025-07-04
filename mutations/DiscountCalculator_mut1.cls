public class DiscountCalculator {
    @AuraEnabled(cacheable=true)
    public static Decimal calculateDiscount(Decimal totalAmount) {
        if (totalAmount >= 1000) {
            return totalAmount * 0.05; // 📝 📝 Description: Change the discount percentage from 10% to 5% to test if the discount calculation logic is sensitive to percentage changes. - 💥 💥 Expected impact: testDiscountOverThreshold, testDiscountExactlyThreshold, testDiscountLargeAmount, testDiscountWithDecimalAmount should fail because the expected discount value will be different due to the percentage change.
        }
        return 0;
    }
}
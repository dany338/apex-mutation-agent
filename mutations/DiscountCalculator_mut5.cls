public class DiscountCalculator {
    @AuraEnabled(cacheable=true)
    public static Decimal calculateDiscount(Decimal totalAmount) {
        if (totalAmount >= 500) { // 📝 📝 Description: Change the threshold value from `1000` to `500` to test if the logic is sensitive to changes in the threshold value. - 💥 💥 Expected impact: testDiscountBelowThreshold should fail because the threshold for applying a discount has been lowered.
            return totalAmount * 0.1;
        }
        return 0;
    }
}
public class DiscountCalculator {
    @AuraEnabled(cacheable=true)
    public static Decimal calculateDiscount(Decimal totalAmount) {
        if (totalAmount > 1000) { // 📝 📝 Description: Change the threshold condition from `>=` to `>` to test if the boundary condition is correctly handled. - 💥 💥 Expected impact: testDiscountExactlyThreshold should fail because the discount will not be applied at the threshold value of 1000.
            return totalAmount * 0.1;
        }
        return 0;
    }
}
public class DiscountCalculator {
    @AuraEnabled(cacheable=true)
    public static Decimal calculateDiscount(Decimal totalAmount) {
        if (totalAmount >= 1000) {
            return totalAmount * 0.1;
        }
        return -1; // 📝 Cambiar el valor de retorno por defecto de `0` a `-1` para verificar el manejo de retornos no esperados. - 💥 `testDiscountBelowThreshold`, `testDiscountNegativeAmount`, y `testDiscountZeroAmount` deberían fallar porque el retorno esperado es 0, no -1.
    }
}
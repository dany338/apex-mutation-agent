public class DiscountCalculator {
    @AuraEnabled(cacheable=true)
    public static Decimal calculateDiscount(Decimal totalAmount) {
        if (totalAmount >= 1000) {
            return totalAmount * 0.2; // 📝 Cambiar el valor de retorno del descuento de `0.1` a `0.2` para verificar el cálculo del descuento. - 💥 `testDiscountOverThreshold`, `testDiscountExactlyThreshold`, `testDiscountLargeAmount`, y `testDiscountWithDecimalAmount` deberían fallar porque el descuento calculado será incorrecto.
        }
        return 0;
    }
}
public class DiscountCalculator {
    @AuraEnabled(cacheable=true)
    public static Decimal calculateDiscount(Decimal totalAmount) {
        if (totalAmount < 0) { // 📝 Cambiar la lógica para aplicar el descuento solo si el monto es negativo. - 💥 `testDiscountOverThreshold`, `testDiscountExactlyThreshold`, `testDiscountLargeAmount`, y `testDiscountWithDecimalAmount` deberían fallar porque el descuento solo se aplicará a montos negativos.
            return totalAmount * 0.1;
        }
        return 0;
    }
}
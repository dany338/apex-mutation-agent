public class DiscountCalculator {
    @AuraEnabled(cacheable=true)
    public static Decimal calculateDiscount(Decimal totalAmount) {
        return totalAmount * 0.1; // 📝 Eliminar la condición de descuento para aplicar siempre el descuento del 10%. - 💥 `testDiscountBelowThreshold`, `testDiscountNegativeAmount`, y `testDiscountZeroAmount` deberían fallar porque se aplicará un descuento cuando no debería.
            return totalAmount * 0.1;
        }
        return 0;
    }
}
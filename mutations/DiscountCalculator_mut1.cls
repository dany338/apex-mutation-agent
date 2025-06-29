public class DiscountCalculator {
    @AuraEnabled(cacheable=true)
    public static Decimal calculateDiscount(Decimal totalAmount) {
        if (totalAmount > 1000) { // 📝 Cambiar el operador de comparación de `>=` a `>` para modificar la condición del umbral de descuento. - 💥 `testDiscountExactlyThreshold` debería fallar porque el descuento no se aplicará cuando el monto sea exactamente 1000.
            return totalAmount * 0.1;
        }
        return 0;
    }
}
@isTest
private class DiscountCalculatorTest {
    // Test para verificar que se aplique descuento correctamente por encima del umbral
    @isTest static void testDiscountOverThreshold() {
        Decimal discount = DiscountCalculator.calculateDiscount(1500);
        System.assertEquals(150, discount, 'Debe aplicar 10% de descuento');
    }

    // Test para verificar que no se aplique descuento por debajo del umbral
    @isTest static void testDiscountBelowThreshold() {
        Decimal discount = DiscountCalculator.calculateDiscount(500);
        System.assertEquals(0, discount, 'No debe aplicar descuento');
    }

    // Test para verificar que se aplique descuento exactamente en el umbral
    @isTest static void testDiscountExactlyThreshold() {
        Decimal discount = DiscountCalculator.calculateDiscount(1000);
        System.assertEquals(100, discount, 'Debe aplicar 10% de descuento en el umbral');
    }

    // Test para verificar que no se aplique descuento para monto negativo
    @isTest static void testDiscountNegativeAmount() {
        Decimal discount = DiscountCalculator.calculateDiscount(-500);
        System.assertEquals(0, discount, 'No debe aplicar descuento para montos negativos');
    }

    // Test para verificar que no se aplique descuento para monto cero
    @isTest static void testDiscountZeroAmount() {
        Decimal discount = DiscountCalculator.calculateDiscount(0);
        System.assertEquals(0, discount, 'No debe aplicar descuento para monto cero');
    }

    // Test para verificar el manejo de montos grandes
    @isTest static void testDiscountLargeAmount() {
        Decimal discount = DiscountCalculator.calculateDiscount(1000000);
        System.assertEquals(100000, discount, 'Debe aplicar 10% de descuento para montos grandes');
    }

    // Test para verificar el manejo de montos con decimales
    @isTest static void testDiscountWithDecimalAmount() {
        Decimal discount = DiscountCalculator.calculateDiscount(1234.56);
        System.assertEquals(123.456, discount, 'Debe aplicar 10% de descuento para montos con decimales');
    }
}
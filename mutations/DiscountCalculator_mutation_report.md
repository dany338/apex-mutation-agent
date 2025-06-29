# 🧬 Reporte de Mutaciones - DiscountCalculator

Fecha: 6/29/2025, 1:30:34 AM

| # | Archivo Mutado | Descripción | Resultado del Test | Recomendación |
|---|----------------|-------------|---------------------|---------------|
| 1 | DiscountCalculator_mut1.cls | Cambiar el operador de comparación de `>=` a `>` para modificar la condición del umbral de descuento. | ❌ Falló | 🟢 Test válido |
| 2 | DiscountCalculator_mut2.cls | Cambiar el valor de retorno del descuento de `0.1` a `0.2` para verificar el cálculo del descuento. | ❌ Falló | 🟢 Test válido |
| 3 | DiscountCalculator_mut3.cls | Cambiar el valor de retorno por defecto de `0` a `-1` para verificar el manejo de retornos no esperados. | ❌ Falló | 🟢 Test válido |
| 4 | DiscountCalculator_mut4.cls | Eliminar la condición de descuento para aplicar siempre el descuento del 10%. | ❌ Falló | 🟢 Test válido |
| 5 | DiscountCalculator_mut5.cls | Cambiar la lógica para aplicar el descuento solo si el monto es negativo. | ❌ Falló | 🟢 Test válido |
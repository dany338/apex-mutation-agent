# 🧬 Reporte de Mutaciones - DiscountCalculator

Fecha: 7/1/2025, 10:32:52 AM

| # | Archivo Mutado | Descripción | Resultado del Test | Recomendación |
|---|----------------|-------------|---------------------|---------------|
| 1 | DiscountCalculator_mut1.cls | 📝 Description: Change the discount percentage from 10% to 5% to test if the discount calculation logic is sensitive to percentage changes. | ❌ Falló | 🟢 Test válido |
| 2 | DiscountCalculator_mut2.cls | 📝 Description: Change the threshold condition from `>=` to `>` to test if the boundary condition is correctly handled. | ❌ Falló | 🟢 Test válido |
| 3 | DiscountCalculator_mut3.cls | 📝 Description: Change the return value for amounts below the threshold from `0` to `-1` to test if the logic correctly handles non-zero returns for non-discounted amounts. | ❌ Falló | 🟢 Test válido |
| 4 | DiscountCalculator_mut4.cls | 📝 Description: Change the condition to always return a discount by removing the condition check, testing if the logic is dependent on the threshold check. | ❌ Falló | 🟢 Test válido |
| 5 | DiscountCalculator_mut5.cls | 📝 Description: Change the threshold value from `1000` to `500` to test if the logic is sensitive to changes in the threshold value. | ❌ Falló | 🟢 Test válido |
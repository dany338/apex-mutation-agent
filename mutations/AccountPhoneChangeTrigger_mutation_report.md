# 🧬 Reporte de Mutaciones - AccountPhoneChangeTrigger

Fecha: 7/4/2025, 12:27:23 AM

| # | Archivo Mutado | Descripción | Resultado del Test | Recomendación |
|---|----------------|-------------|---------------------|---------------|
| 1 | AccountPhoneChangeTrigger_mut1.cls | Cambiar el operador de desigualdad `!=` a igualdad `==` en la condición de comparación de teléfonos para evitar que se detecten cambios. | ❌ Falló | 🟢 Test válido |
| 2 | AccountPhoneChangeTrigger_mut2.cls | Cambiar el valor asignado a `change.OldPhone__c` para que siempre sea `null`, lo que afecta la lógica de comparación de teléfonos antiguos. | ❌ Falló | 🟢 Test válido |
| 3 | AccountPhoneChangeTrigger_mut3.cls | Eliminar la inserción del objeto `PhoneChange__c`, lo que impide que se registre cualquier cambio de teléfono. | ❌ Falló | 🟢 Test válido |
| 4 | AccountPhoneChangeTrigger_mut4.cls | Cambiar la asignación de `change.NewPhone__c` para que siempre sea un valor fijo, afectando la lógica de comparación de nuevos teléfonos. | ❌ Falló | 🟢 Test válido |
| 5 | AccountPhoneChangeTrigger_mut5.cls | Cambiar la referencia de `Trigger.oldMap` a `Trigger.newMap`, lo que afecta la lógica de comparación de teléfonos antiguos. | ❌ Falló | 🟢 Test válido |
# 🧬 Reporte de Mutaciones - triggers/AccountPhoneChangeTrigger.trigger

Fecha: 7/3/2025, 9:51:59 PM

| # | Archivo Mutado | Descripción | Resultado del Test | Recomendación |
|---|----------------|-------------|---------------------|---------------|
| 1 | AccountPhoneChangeTrigger.trigger_mut1.cls | Cambiar el operador de desigualdad `!=` a igualdad `==` en la condición de comparación de números de teléfono. Esto hará que el trigger actúe solo si los números de teléfono son iguales, lo cual es incorrecto. | ❌ Falló | 🟢 Test válido |
| 2 | AccountPhoneChangeTrigger.trigger_mut2.cls | Eliminar la línea de inserción del objeto `PhoneChange__c`. Esto evitará que se registre cualquier cambio de teléfono. | ❌ Falló | 🟢 Test válido |
| 3 | AccountPhoneChangeTrigger.trigger_mut3.cls | Cambiar el campo `OldPhone__c` a `NewPhone__c` en la asignación del objeto `PhoneChange__c`. Esto hará que ambos campos tengan el mismo valor. | ❌ Falló | 🟢 Test válido |
| 4 | AccountPhoneChangeTrigger.trigger_mut4.cls | Cambiar el campo `NewPhone__c` a `OldPhone__c` en la asignación del objeto `PhoneChange__c`. Esto hará que ambos campos tengan el mismo valor. | ❌ Falló | 🟢 Test válido |
| 5 | AccountPhoneChangeTrigger.trigger_mut5.cls | Cambiar la asignación del campo `Account__c` a un valor nulo. Esto hará que el registro de cambio no esté asociado a ninguna cuenta. | ❌ Falló | 🟢 Test válido |
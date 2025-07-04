# 🧬 Reporte de Mutaciones - AccountPhoneChangeTrigger.trigger

Fecha: 7/4/2025, 1:17:12 AM

| # | Archivo Mutado | Descripción | Resultado del Test | Recomendación |
|---|----------------|-------------|---------------------|---------------|
| 1 | AccountPhoneChangeTrigger.trigger_mut1.cls | Cambiar el operador de desigualdad `!=` a igualdad `==` en la condición de comparación de números de teléfono, lo que hará que el trigger no registre cambios cuando los números de teléfono sean diferentes. | ❌ Falló | 🟢 Test válido |
| 2 | AccountPhoneChangeTrigger.trigger_mut2.cls | Cambiar el campo `NewPhone__c` para que almacene el valor del campo `OldPhone__c` en lugar de `acc.Phone`, lo que hará que el registro de cambio de teléfono sea incorrecto. | ❌ Falló | 🟢 Test válido |
| 3 | AccountPhoneChangeTrigger.trigger_mut3.cls | Eliminar la línea de inserción del registro `PhoneChange__c`, lo que hará que no se registre ningún cambio de teléfono. | ❌ Falló | 🟢 Test válido |
| 4 | AccountPhoneChangeTrigger.trigger_mut4.cls | Cambiar el acceso al mapa `Trigger.oldMap` para usar `Trigger.newMap`, lo que hará que el trigger compare el nuevo valor con el nuevo valor, siempre resultando en falso. | ❌ Falló | 🟢 Test válido |
| 5 | AccountPhoneChangeTrigger.trigger_mut5.cls | Cambiar la asignación del campo `OldPhone__c` para que almacene el valor del campo `acc.Phone` en lugar de `oldAcc.Phone`, lo que hará que el registro de cambio de teléfono sea incorrecto. | ❌ Falló | 🟢 Test válido |
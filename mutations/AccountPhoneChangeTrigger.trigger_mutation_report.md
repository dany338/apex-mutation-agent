# 🧬 Reporte de Mutaciones - AccountPhoneChangeTrigger.trigger

Fecha: 7/4/2025, 4:15:37 PM

| # | Archivo Mutado | Descripción | Resultado del Test | Recomendación |
|---|----------------|-------------|---------------------|---------------|
| 1 | AccountPhoneChangeTrigger.trigger_mut1.cls | 📝 Description: Change the condition to always evaluate to false, preventing any phone change from being logged. | ❌ Falló | 🟢 Test válido |
| 2 | AccountPhoneChangeTrigger.trigger_mut2.cls | 📝 Description: Remove the insertion of the `PhoneChange__c` record, which will prevent logging of phone changes. | ❌ Falló | 🟢 Test válido |
| 3 | AccountPhoneChangeTrigger.trigger_mut3.cls | 📝 Description: Change the assignment of `NewPhone__c` to use `OldPhone__c`, causing incorrect logging of the new phone number. | ❌ Falló | 🟢 Test válido |
| 4 | AccountPhoneChangeTrigger.trigger_mut4.cls | 📝 Description: Change the loop to iterate over `Trigger.old` instead of `Trigger.new`, which will prevent the detection of changes. | ❌ Falló | 🟢 Test válido |
| 5 | AccountPhoneChangeTrigger.trigger_mut5.cls | 📝 Description: Change the assignment of `OldPhone__c` to use `NewPhone__c`, causing incorrect logging of the old phone number. | ❌ Falló | 🟢 Test válido |
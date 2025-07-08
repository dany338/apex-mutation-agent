# 🧬 Reporte de Mutaciones - AccountPhoneChangeTrigger.trigger

Fecha: 7/8/2025, 9:51:55 AM

| # | Archivo Mutado | Descripción | Resultado del Test | Recomendación |
|---|----------------|-------------|---------------------|---------------|
| 1 | AccountPhoneChangeTrigger.trigger_mut1.cls | 📝 Description: Change the condition to check for equality instead of inequality, which will prevent the trigger from executing its logic when the phone number changes. | ❌ Falló | 🟢 Test válido |
| 2 | AccountPhoneChangeTrigger.trigger_mut2.cls | 📝 Description: Remove the insertion of the `PhoneChange__c` record, which will prevent the logging of phone changes. | ❌ Falló | 🟢 Test válido |
| 3 | AccountPhoneChangeTrigger.trigger_mut3.cls | 📝 Description: Change the assignment of `acc.Description` to a different string, which will cause the test to fail when checking for the expected description. | ❌ Falló | 🟢 Test válido |
| 4 | AccountPhoneChangeTrigger.trigger_mut4.cls | 📝 Description: Remove the retrieval of the old account from `Trigger.oldMap`, which will cause a null reference error when trying to access `oldAcc.Phone`. | ❌ Falló | 🟢 Test válido |
| 5 | AccountPhoneChangeTrigger.trigger_mut5.cls | 📝 Description: Move the insertion of the `PhoneChange__c` record outside the loop, which will cause only the last change to be logged if multiple accounts are updated. | ❌ Falló | 🟢 Test válido |
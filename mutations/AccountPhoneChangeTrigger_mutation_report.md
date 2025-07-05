# 🧬 Reporte de Mutaciones - AccountPhoneChangeTrigger

Fecha: 7/4/2025, 9:18:23 AM

| # | Archivo Mutado | Descripción | Resultado del Test | Recomendación |
|---|----------------|-------------|---------------------|---------------|
| 1 | AccountPhoneChangeTrigger_mut1.cls | 📝 Description: Change the condition from `!=` to `==` in the `if` statement to incorrectly check for unchanged phone numbers. | ❌ Falló | 🟢 Test válido |
| 2 | AccountPhoneChangeTrigger_mut2.cls | 📝 Description: Remove the `insert` statement to prevent the creation of the `PhoneChange__c` record. | ❌ Falló | 🟢 Test válido |
| 3 | AccountPhoneChangeTrigger_mut3.cls | 📝 Description: Change the assignment of `OldPhone__c` to use `acc.Phone` instead of `oldAcc.Phone`, leading to incorrect data in the `PhoneChange__c` record. | ❌ Falló | 🟢 Test válido |
| 4 | AccountPhoneChangeTrigger_mut4.cls | 📝 Description: Change the loop to iterate over `Trigger.old` instead of `Trigger.new`, which will prevent the trigger from using updated account data. | ❌ Falló | 🟢 Test válido |
| 5 | AccountPhoneChangeTrigger_mut5.cls | 📝 Description: Assign a hardcoded value to `NewPhone__c` instead of using `acc.Phone`, leading to incorrect data in the `PhoneChange__c` record. | ❌ Falló | 🟢 Test válido |
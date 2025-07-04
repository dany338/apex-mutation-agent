@isTest
private class AccountPhoneChangeTriggerTest {
    @isTest static void testPhoneChangeInsert() {
        // Crear cuenta inicial. to ingles: Testing initial account creation
        Account acc = new Account(Name = 'Test Account', Phone = '123456');
        insert acc;

        // Cambiar número de teléfono. to ingles: Testing change of phone number
        Test.startTest(); // Start test context
        acc.Phone = '7891011'; // New phone number
        update acc; // Update the account to trigger the phone change

        // Validar que se haya creado el registro en PhoneChange__c object. to ingles: Testing validation of PhoneChange__c record creation
        List<PhoneChange__c> changes = [
            SELECT Id, OldPhone__c, NewPhone__c, Account__c
            FROM PhoneChange__c
            WHERE Account__c = :acc.Id
        ];
        System.assertEquals(1, changes.size(), 'Debe haberse creado un registro');
        System.assertEquals('123456', changes[0].OldPhone__c);
        System.assertEquals('7891011', changes[0].NewPhone__c);
    }
}
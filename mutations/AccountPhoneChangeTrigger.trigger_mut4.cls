trigger AccountPhoneChangeTrigger on Account (before update) {
    for (Account acc : Trigger.new) {
        Account oldAcc = null; // 📝 📝 Description: Remove the retrieval of the old account from `Trigger.oldMap`, which will cause a null reference error when trying to access `oldAcc.Phone`. - 💥 💥 Expected impact: `testPhoneChangeInsert` should fail due to a runtime error when trying to access `oldAcc.Phone`, as `oldAcc` will be null.
        if (acc.Phone != oldAcc.Phone) {
            PhoneChange__c change = new PhoneChange__c();
            change.Account__c = acc.Id;
            change.OldPhone__c = oldAcc.Phone;
            change.NewPhone__c = acc.Phone;
            acc.Description = '📞 Phone was changed!';
            insert change; // Insert the PhoneChange__c record to log the phone change
        }
    }
}
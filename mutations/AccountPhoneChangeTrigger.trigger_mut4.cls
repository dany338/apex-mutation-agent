trigger AccountPhoneChangeTrigger on Account (before update) {
    for (Account acc : Trigger.new) {
        Account oldAcc = Trigger.oldMap.get(acc.Id);
        if (acc.Phone != oldAcc.Phone) {
            PhoneChange__c change = new PhoneChange__c();
            change.Account__c = acc.Id;
            change.OldPhone__c = oldAcc.Phone;
            change.NewPhone__c = null; // 📝 📝 Description: Assign `null` to `change.NewPhone__c` to simulate a failure in capturing the new phone number. - 💥 💥 Expected impact: `testPhoneChangeInsert` should fail because the test expects the `NewPhone__c` field to have the updated phone number.
            acc.Description = '📞 Phone was changed!';
            insert change; // Insert the PhoneChange__c record to log the phone change
        }
    }
}
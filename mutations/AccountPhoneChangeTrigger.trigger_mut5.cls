trigger AccountPhoneChangeTrigger on Account (before update) {
    for (Account acc : Trigger.new) {
        Account oldAcc = Trigger.oldMap.get(acc.Id);
        if (acc.Phone != oldAcc.Phone) {
            PhoneChange__c change = new PhoneChange__c();
            change.Account__c = acc.Id;
            change.OldPhone__c = acc.Phone; // 📝 📝 Description: Change the assignment of `OldPhone__c` to use `NewPhone__c`, causing incorrect logging of the old phone number. - 💥 💥 Expected impact: `testPhoneChangeInsert` should fail because the `OldPhone__c` will not reflect the original phone number.
            change.NewPhone__c = acc.Phone;
            insert change; // Insert the PhoneChange__c record to log the phone change
        }
    }
}
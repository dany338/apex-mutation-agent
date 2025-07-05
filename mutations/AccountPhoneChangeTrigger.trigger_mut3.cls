trigger AccountPhoneChangeTrigger on Account (before update) {
    for (Account acc : Trigger.new) {
        Account oldAcc = Trigger.oldMap.get(acc.Id);
        if (acc.Phone != oldAcc.Phone) {
            PhoneChange__c change = new PhoneChange__c();
            change.Account__c = acc.Id;
            change.OldPhone__c = oldAcc.Phone;
            change.NewPhone__c = oldAcc.Phone; // 📝 📝 Description: Change the assignment of `NewPhone__c` to use `OldPhone__c`, causing incorrect logging of the new phone number. - 💥 💥 Expected impact: `testPhoneChangeInsert` should fail because the `NewPhone__c` will not reflect the updated phone number.
            insert change; // Insert the PhoneChange__c record to log the phone change
        }
    }
}
trigger AccountPhoneChangeTrigger on Account (before update) {
    for (Account acc : Trigger.new) {
        Account oldAcc = Trigger.oldMap.get(acc.Id);
        if (acc.Phone != oldAcc.Phone) {
            PhoneChange__c change = new PhoneChange__c();
            change.Account__c = acc.Id;
            change.OldPhone__c = oldAcc.Phone;
            change.NewPhone__c = acc.Phone;
            acc.Description = '📞 Phone was changed!';
            // insert change; // Insert the PhoneChange__c record to log the phone change // 📝 📝 Description: Remove the insertion of the `PhoneChange__c` record, which will prevent the logging of phone changes. - 💥 💥 Expected impact: `testPhoneChangeInsert` should fail because the `PhoneChange__c` record will not be inserted, leading to an assertion failure when checking for its existence.
        }
    }
}
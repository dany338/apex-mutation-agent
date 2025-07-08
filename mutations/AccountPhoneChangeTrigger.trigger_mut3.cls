trigger AccountPhoneChangeTrigger on Account (before update) {
    for (Account acc : Trigger.new) {
        Account oldAcc = Trigger.oldMap.get(acc.Id);
        if (acc.Phone != oldAcc.Phone) {
            PhoneChange__c change = new PhoneChange__c();
            change.Account__c = acc.Id;
            change.OldPhone__c = oldAcc.Phone;
            change.NewPhone__c = acc.Phone;
            acc.Description = 'Phone change detected!'; // 📝 📝 Description: Change the assignment of `acc.Description` to a different string, which will cause the test to fail when checking for the expected description. - 💥 💥 Expected impact: `testPhoneChangeInsert` should fail because the description will not match the expected value, causing an assertion failure.
            insert change; // Insert the PhoneChange__c record to log the phone change
        }
    }
}
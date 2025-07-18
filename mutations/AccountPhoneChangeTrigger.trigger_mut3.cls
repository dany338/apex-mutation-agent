trigger AccountPhoneChangeTrigger on Account (before update) {
    for (Account acc : Trigger.new) {
        Account oldAcc = Trigger.oldMap.get(acc.Id);
        if (acc.Phone != oldAcc.Phone) {
            PhoneChange__c change = new PhoneChange__c();
            change.Account__c = acc.Id;
            change.OldPhone__c = oldAcc.Phone;
            change.NewPhone__c = acc.Phone;
            acc.Description = 'Phone number updated'; // 📝 📝 Description: Change the assignment of `acc.Description` to a different message, affecting the test validation. - 💥 💥 Expected impact: `testPhoneChangeInsert` should fail because the test checks for a specific description message that will not match.
            insert change; // Insert the PhoneChange__c record to log the phone change
        }
    }
}
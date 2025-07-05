trigger AccountPhoneChangeTrigger on Account (before update) {
    for (Account acc : Trigger.old) { // 📝 📝 Description: Change the loop to iterate over `Trigger.old` instead of `Trigger.new`, which will prevent the detection of changes. - 💥 💥 Expected impact: `testPhoneChangeInsert` should fail because the trigger will not detect any changes in the phone numbers.
        Account oldAcc = Trigger.oldMap.get(acc.Id);
        if (acc.Phone != oldAcc.Phone) {
            PhoneChange__c change = new PhoneChange__c();
            change.Account__c = acc.Id;
            change.OldPhone__c = oldAcc.Phone;
            change.NewPhone__c = acc.Phone;
            insert change; // Insert the PhoneChange__c record to log the phone change
        }
    }
}
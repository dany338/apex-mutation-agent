trigger AccountPhoneChangeTrigger on Account (before update) {
    for (Account acc : Trigger.new) {
        Account oldAcc = Trigger.oldMap.get(acc.Id);
        if (acc.Phone == oldAcc.Phone) { // 📝 📝 Description: Change the condition from `!=` to `==` in the `if` statement to incorrectly trigger the logic when the phone numbers are the same. - 💥 💥 Expected impact: `testPhoneChangeInsert` should fail because the test expects a `PhoneChange__c` record to be created only when the phone number changes, not when it remains the same.
            PhoneChange__c change = new PhoneChange__c();
            change.Account__c = acc.Id;
            change.OldPhone__c = oldAcc.Phone;
            change.NewPhone__c = acc.Phone;
            acc.Description = '📞 Phone was changed!';
            insert change; // Insert the PhoneChange__c record to log the phone change
        }
    }
}
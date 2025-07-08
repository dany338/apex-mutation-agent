trigger AccountPhoneChangeTrigger on Account (before update) {
    for (Account acc : Trigger.new) {
        Account oldAcc = Trigger.oldMap.get(acc.Id);
        if (acc.Phone != oldAcc.Phone) {
            PhoneChange__c change = new PhoneChange__c();
            change.Account__c = acc.Id;
            change.OldPhone__c = oldAcc.Phone;
            change.NewPhone__c = acc.Phone;
            acc.Description = '📞 Phone was changed!';
            insert change; // Move this line outside the loop // 📝 📝 Description: Move the insertion of the `PhoneChange__c` record outside the loop, which will cause only the last change to be logged if multiple accounts are updated. - 💥 💥 Expected impact: `testPhoneChangeInsert` should fail if multiple accounts are updated in a single transaction, as only the last change will be recorded.
        }
    }
}
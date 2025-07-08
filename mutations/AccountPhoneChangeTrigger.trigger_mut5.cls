trigger AccountPhoneChangeTrigger on Account (before update) {
    for (Account acc : Trigger.new) {
        Account oldAcc = Trigger.oldMap.get(acc.Id);
        if (acc.Phone != oldAcc.Phone) {
            PhoneChange__c change = new PhoneChange__c();
            change.Account__c = acc.Id;
            change.OldPhone__c = oldAcc.Phone;
            change.NewPhone__c = acc.Phone;
            acc.Description = '📞 Phone was changed!';
            } // 📝 📝 Description: Move the `insert change;` statement outside the loop to prevent logging multiple phone changes in a bulk update scenario. - 💥 💥 Expected impact: `testPhoneChangeInsert` should fail because the test expects a `PhoneChange__c` record for each phone change, but only one record will be inserted for multiple changes.
        }
    }
}
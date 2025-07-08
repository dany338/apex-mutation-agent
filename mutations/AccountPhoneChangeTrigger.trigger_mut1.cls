trigger AccountPhoneChangeTrigger on Account (before update) {
    for (Account acc : Trigger.new) {
        Account oldAcc = Trigger.oldMap.get(acc.Id);
        if (acc.Phone == oldAcc.Phone) { // 📝 📝 Description: Change the condition to check for equality instead of inequality, which will prevent the trigger from executing its logic when the phone number changes. - 💥 💥 Expected impact: `testPhoneChangeInsert` should fail because the trigger logic will not execute when the phone number is changed, so no `PhoneChange__c` record will be created.
            PhoneChange__c change = new PhoneChange__c();
            change.Account__c = acc.Id;
            change.OldPhone__c = oldAcc.Phone;
            change.NewPhone__c = acc.Phone;
            acc.Description = '📞 Phone was changed!';
            insert change; // Insert the PhoneChange__c record to log the phone change
        }
    }
}
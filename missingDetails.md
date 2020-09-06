# Updates to existing instances
### MetaData 
The spec doesnt mention what to do with the existing meta data when updating an instance. I have assumed this is to be discarded.

### Instance expiry
The spec requests instances should expire and be removed after a period of time and that the period is configurable. It doesnt say what mechanism this should be. 

You could add a new timer driven function that scans the table for expired items and deletes them, but that would cost more cloud resources and basically duplicates the functionality of the dynamodb ttl functionality. 

Or you could do it when triggered by certain operations,

e.g. it would be a good time to do it when a getGroups is triggered as that has to do a full table scan. But it felt wrong to me to 
tie this functionality to some other functionality that was unrelated. What if noone ever calls 'getGroups'?

Therefore I went with a combination of dynamodb ttl which is free and filtering to ensure expired but not yet deleted entries were ignored.

This has some side effects which I'd have to clear with the product owner first. 
- DynamoTTL settings are saved per entry. Therefore changes to this setting wouldnt affect the actual deletion of existing items.
- Changes to this setting affect the filtering immediately. This could cause a discrepancy between the in-code filtering and the dynamo deletions. Depending on how severe the PO decided this is we could add code to update all records on config changes.

### Security
There is no mention of security of if the endpoints should be secured. I have assumed the security will be provided at another layer, e.g. the nextwork layer.
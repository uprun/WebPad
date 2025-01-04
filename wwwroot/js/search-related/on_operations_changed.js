lookup.on_operations_changed = function (changes)
{
    if (changes && changes.length > 0) {
        var addedChanges = ko.utils.arrayFilter
            (
                changes, 
                function (item) 
                {
                    return item.status == "added"
                }
            );

        if (addedChanges && addedChanges.length > 0) {
            var toStoreOperations = ko.utils.arrayMap
            (
                lookup.Operations(), 
                function (item) {
                return item.ConvertToJs()
                }
            );

            toStoreOperations = toStoreOperations
                .sort(
                    function (left, right) {
                        if (left.time === right.time) {
                            return 0;
                        }

                        else {
                            if (left.time < right.time) {
                                return -1;
                            }

                            else {
                                return 1;
                            }
                        }
                    }
                );
            lookup.backendWorker.reply('saveOperationsToStorage.event', toStoreOperations);
        }
    }
};

lookup.Operation_was_added = function(data) {
    // backend-worker context
    var toAdd = new lookup.model_Operation(data);
    lookup.Operations.push(toAdd);
    lookup.reply_from_backend_worker('saveAliasesToStorage.event', lookup.Aliases);
};
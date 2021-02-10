
lookup.Operation_was_added = function(data) {
    var toAdd = new lookup.model_Operation(data);
    lookup.Operations.push(toAdd);
};
lookup.RemoveConnection = function(toRemove) {
    var deleted = toRemove.ConvertToJs();
    lookup.pushToHistory({
        action: lookup.actions.ConnectionDeleted,
        data: deleted
    });
};
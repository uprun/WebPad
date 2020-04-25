lookup.pushToHistory = function(item) {
    
    item = lookup.ConvertToLocalId(item);
    
    lookup.processMessageFromOuterSpace(item);
    
    item.historyIndex = lookup.freeLocalIndex++;
    lookup.history.push(item);
};
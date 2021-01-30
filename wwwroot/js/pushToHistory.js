lookup.pushToHistory = function(item) {
    
    
    lookup.processMessageFromOuterSpace(item);
    
    item.historyIndex = lookup.freeLocalIndex++;
    lookup.history.push(item);
};
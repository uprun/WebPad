lookup.stackSearchNotesQuery = ko.observableArray([]);
lookup.rollbackSearchNotesQuery = function()
{
        lookup.SearchNotesQuery("");
        
        lookup.resetGlobalOffsetY();
    
};
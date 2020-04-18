lookup.SearchNotesQuery = ko.observable("");
lookup.SearchNotesQuery
    .extend({ rateLimit: 200 });
lookup.SearchNotesQuery.subscribe(function(value){
    console.log('clear');
    // do not remove stack if card is just created
    if(lookup.stackOfCards().length > 1 || value.trim().length > 0)
    {
        lookup.clearStackOfCards();
        
    }
    
});
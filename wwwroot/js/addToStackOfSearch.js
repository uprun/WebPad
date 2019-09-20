lookup.addToStackOfSearch = function() 
{
    lookup.stackOfSearch().push(lookup.SearchNotesQuery().trim().toLowerCase());
    lookup.SearchNotesQuery("");
};
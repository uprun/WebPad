

lookup.listRenderedCompletely = function()
{
    console.log("list rendered completely, but cards still can be moved");
        if(typeof(lookup.ReversedListOfCards_scroll_to_first) === 'undefined' 
            || lookup.ReversedListOfCards_scroll_to_first === true)
        {
            lookup.onListChanged_set_scrollToLatestCard();
            lookup.ReversedListOfCards_scroll_to_first = false;
        }
        
        lookup.onListChanged_ScrollToDestination();
};

lookup.cardAfterRender = function()
{
    var cards = lookup.ReversedListOfCards();
    var renderedItems = ko.utils.arrayFilter(cards, 
        function(item)
        { 
            var searchResult = $('#'+item.Note.id);
            return searchResult.length > 0;
        } );
    var isCompletelyRendered = renderedItems.length === cards.length;
    if(isCompletelyRendered)
    {
        lookup.listRenderedCompletely();
    }
    
};
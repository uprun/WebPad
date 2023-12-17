

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
    lookup.onListChanged_set_scrollToLatestCard();
    lookup.onListChanged_ScrollToDestination();
    return;
    var cards = lookup.LimitedFilteredOperations();
    // var renderedItems = ko.utils.arrayFilter(cards, 
    //     function(item)
    //     { 
    //         try
    //         {
    //             var searchResult = $('#'+item.Note.id);
    //             return searchResult.length > 0;

    //         }
    //         catch(error)
    //         {
    //             console.log("failed search query was : " + '#'+item.Note.id)
    //         }
    //         return true;
    //     } );
    // var isCompletelyRendered = renderedItems.length === cards.length;
    var numberOfRenderedCards = $(".webpad-card").length;
    var isCompletelyRendered = cards.length === numberOfRenderedCards;
    if(isCompletelyRendered)
    {
        lookup.listRenderedCompletely();
    }
    
};
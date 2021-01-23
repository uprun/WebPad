lookup.cardAfterRender = function()
{
    if(lookup.ReversedListOfCards().length === $("#cards-list-reversed").children().length)
    {
        console.log("list rendered completely");
        if(typeof(lookup.ReversedListOfCards_scroll_to_first) === 'undefined' 
            || lookup.ReversedListOfCards_scroll_to_first === true)
        {
            lookup.scrollToLatestCard();
            lookup.ReversedListOfCards_scroll_to_first = false;
        }
        
        lookup.onListChanged_ScrollToDestination();

    }
    
};
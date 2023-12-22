lookup.cardAfterRender = function()
{
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
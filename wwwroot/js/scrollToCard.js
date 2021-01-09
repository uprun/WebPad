lookup.scrollToCard_queue = [];
lookup.scrollToCard = function(id, number_of_retries_left) {
    var cards = $('#' + id).parent();

    if(typeof(cards) !== "undefined" && cards.length > 0)
    {
        var target = cards[0];
        //target.scrollIntoView();

        var scrollAreas = $('.webpad-search-result-area');
        $("body,html").stop().animate({
                scrollTop: target.offsetTop
            }, 300);
        
    }
    else
    {
        if(typeof(number_of_retries_left) === "undefined")
        {
            lookup.scrollToCard_queue.push({id: id, number_of_retries_left: 5});
        }
        else
        {
            if(number_of_retries_left > 0)
            {
                lookup.scrollToCard_queue.push({id: id, number_of_retries_left: number_of_retries_left - 1 });
            }
        }
    }
    
};

lookup.scrollToCard_processQueue = function()
{
    if(lookup.scrollToCard_queue.length > 0)
    {
        var toScrollTo = lookup.scrollToCard_queue.shift();
        lookup.scrollToCard(toScrollTo.id, toScrollTo.number_of_retries_left );
    }
    setTimeout(lookup.scrollToCard_processQueue, 300);
}



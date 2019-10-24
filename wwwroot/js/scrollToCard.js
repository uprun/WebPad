lookup.scrollToCard = function(id) {
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
    
};
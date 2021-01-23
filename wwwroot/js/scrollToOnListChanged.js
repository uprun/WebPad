lookup.scrollToDestinationCommand = ko.observable(undefined);
lookup.getViewPortScrollPosition = function() {
    lookup.viewportScrollPosition(document.body.scrollTop || document.documentElement.scrollTop);
    console.log('scroll: '+ lookup.viewportScrollPosition())
};

lookup.onListChanged_setScrollTopOffset = function(offsetTop)
{
    var commandValue = lookup.scrollToDestinationCommand();
    if(typeof(commandValue) === 'undefined')
    {
        commandValue = {};
    }
    commandValue["offsetTop"] = offsetTop;
    lookup.scrollToDestinationCommand(commandValue);
};

lookup.onListChanged_set_scrollToLatestCard = function()
{
    var commandValue = lookup.scrollToDestinationCommand();
    if(typeof(commandValue) === 'undefined')
    {
        commandValue = {};
    }
    commandValue["scrollToLatestCard"] = true;
    lookup.scrollToDestinationCommand(commandValue);
};

lookup.onListChanged_set_scrollToCard = function(card)
{
    var commandValue = lookup.scrollToDestinationCommand();
    if(typeof(commandValue) === 'undefined')
    {
        commandValue = {};
    }
    commandValue["scrollToCard"] = card;
    lookup.scrollToDestinationCommand(commandValue);
};

lookup.onListChanged_set_scrollToCardAfter = function(card)
{
    var commandValue = lookup.scrollToDestinationCommand();
    if(typeof(commandValue) === 'undefined')
    {
        commandValue = {};
    }
    commandValue["scrollToCardAfter"] = card;
    lookup.scrollToDestinationCommand(commandValue);
};

lookup.onListChanged_ScrollToDestination = function()
{
    var commandValue = lookup.scrollToDestinationCommand();
    if(typeof(commandValue)!== 'undefined')
    {
        if(typeof(commandValue.offsetTop) !== 'undefined')
        {
            $("body,html").stop().animate({
                scrollTop: lookup.scrollToDestinationCommand().offsetTop
            }, 300);
        }
        else
        {
            if(typeof(commandValue.scrollToCard) !== 'undefined')
            {
                lookup.scrollToCard(commandValue.scrollToCard.Note.id);
            }
            else
            {
                if(typeof(commandValue.scrollToCardAfter) !== 'undefined')
                {
                    var cards = lookup.LimitedFilteredCards();
                    var index = cards.indexOf(commandValue.scrollToCardAfter);
                    index = Math.max(0, index - 1);
                    var toScrollTo = cards[index];

                    lookup.scrollToCard(toScrollTo.Note.id);
                }
                else
                {
                    if(typeof(commandValue.scrollToLatestCard) !== 'undefined')
                    {
                        lookup.scrollToLatestCard();
                    }
                }
            }
            
            
        }
        
        lookup.scrollToDestinationCommand(undefined);
    }
};
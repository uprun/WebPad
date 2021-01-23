lookup.scrollToDestinationCommand = ko.observable(undefined);
lookup.getViewPortScrollPosition = function() {
    lookup.viewportScrollPosition(document.body.scrollTop || document.documentElement.scrollTop);
    console.log('scroll: '+ lookup.viewportScrollPosition())
};

lookup.onListChanged_setScrollTopOffset = function(offsetTop)
{
    lookup.scrollToDestinationCommand(
        {
            offsetTop: offsetTop
        });
};
lookup.onListChanged_set_scrollToLatestCard = function()
{
    lookup.scrollToDestinationCommand(
        {
            scrollToLatestCard: true
        }
    );
};
lookup.onListChanged_ScrollToDestination = function()
{
    if(typeof(lookup.scrollToDestinationCommand())!== 'undefined')
    {
        if(typeof(lookup.scrollToDestinationCommand().offsetTop) !== 'undefined')
        {
            $("body,html").stop().animate({
                scrollTop: lookup.scrollToDestinationCommand().offsetTop
            }, 300);

        }
        if(typeof(lookup.scrollToDestinationCommand().scrollToLatestCard) !== 'undefined')
        {
            lookup.scrollToLatestCard();
        }
        lookup.scrollToDestinationCommand(undefined);
    }
};
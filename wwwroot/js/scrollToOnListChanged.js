lookup.scrollToDestination = ko.observable(undefined);
lookup.getViewPortScrollPosition = function() {
    lookup.viewportScrollPosition(document.body.scrollTop || document.documentElement.scrollTop);
    console.log('scroll: '+ lookup.viewportScrollPosition())
};

lookup.onListChanged_setScrollTopOffset = function(offsetTop)
{
    this.scrollToDestination(
        {
            offsetTop: offsetTop
        });
};
lookup.onListChanged_ScrollToDestination = function()
{
    if(typeof(lookup.scrollToDestination())!== 'undefined')
    {
        if(typeof(lookup.scrollToDestination().offsetTop) !== 'undefined')
        {
            $("body,html").stop().animate({
                scrollTop: lookup.scrollToDestination().offsetTop
            }, 300);

        }
        lookup.scrollToDestination(undefined);
    }
};
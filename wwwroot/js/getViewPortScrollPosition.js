lookup.viewportScrollPosition = ko.observable(undefined);
lookup.getViewPortScrollPosition = function() {
    lookup.viewportScrollPosition(document.body.scrollTop || document.documentElement.scrollTop);
};
lookup.viewportHeight = ko.observable(undefined);
lookup.getViewPortSize = function() {
    lookup.viewportHeight(window.innerHeight || document.documentElement.clientHeight);
    // https://gomakethings.com/how-to-test-if-an-element-is-in-the-viewport-with-vanilla-javascript/
};
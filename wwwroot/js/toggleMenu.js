lookup.menuIsOpen = ko.observable(false);
lookup.toggleMenu = function() 
{
    lookup.menuIsOpen(!lookup.menuIsOpen());
};
lookup.globalOffsetY = ko.observable(0);
lookup.globalOffsetX = ko.observable(0);
lookup.globalMaxY = ko.observable(800);
lookup.globalMinY = ko.observable(800);

lookup.resetGlobalOffsetY = function()
{
    lookup.globalOffsetY(0);
};
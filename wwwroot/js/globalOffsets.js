lookup.globalOffsetY = ko.observable(0);
lookup.globalOffsetX = ko.observable(0);
lookup.globalMaxY = ko.observable(800);
lookup.globalMinY = ko.observable(800);
lookup.globalScreenHeight = ko.observable(800);

lookup.first_to_render_note_data_stringified = undefined;
lookup.first_to_render_note_globalBottom = 0;

lookup.resetGlobalOffsetY = function()
{
    lookup.globalOffsetY(0);
};

lookup.update_global_scroll_limits = function()
{
    var length = lookup.LimitedFilteredOperations().length;
    var total_scrollable_height = 0;
    if(length > 0)
    {
        var obj_last = lookup.LimitedFilteredOperations()[length - 1];
        total_scrollable_height = obj_last.bottom();
        
        total_scrollable_height += obj_last.offsetHeight();
        
    }
    lookup.globalScreenHeight(window.innerHeight);

    lookup.globalMaxY(-total_scrollable_height + window.innerHeight * 0.05);
    lookup.globalMinY(window.innerHeight * 0.6);
    
    //console.log("height scroll limits:", lookup.globalMinY(), lookup.globalMaxY());
};
lookup.jump_to_search_from_symbol = function(data, event)
{
    var context = ko.contextFor(event.target);
    
    var index = context.$index();
    const offset = 10;
    var start = Math.max(index - offset, 0);
    var search_keyword = context.$parent.text.substr(start, offset * 2 + 1);

    var to_preserve_clicked_index = index - start;

    lookup.pushToSearchNotesQueryText(search_keyword, to_preserve_clicked_index);
    lookup.resetGlobalOffsetY();
    
    //event.stopPropagation();
    return true;
    
};
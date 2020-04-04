lookup.searchBarKeyPress = function(data, event) 
{
    if(event.shiftKey)
    {
        // if(event.keyCode == 13)
        // {
        //     lookup.addToStackOfSearch();
        // }

    }
    else
    {
        if(event.keyCode == 13)
        {
            lookup.CreateNoteFromSearchQuery();
        }
    }
    return true;
};
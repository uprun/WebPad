lookup.searchBarKeyPress = function(data, event) 
{
    if(event.shiftKey)
    {
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
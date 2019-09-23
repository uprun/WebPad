lookup.additionalInfoKeyPress = function(data, event) 
{
    if(event.shiftKey)
    {

    }
    else
    {
        if(event.keyCode == 13)
        {
            lookup.AddNoteToExistingOne(data);
        }
    }
    return true;
};
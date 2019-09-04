lookup.findCardByMainNodeId = function(mainId)
{
    var found = lookup.hashCards[mainId];
    if(found)
    {
        return found;
    }
    else
    {
        return null;
    }
};
lookup.jumpToCardOnCreate = function(data)
{
    lookup.onListChanged_set_scrollToCard(lookup.findCardByMainNodeId(data.id));
};
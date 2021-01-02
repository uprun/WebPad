lookup.taggedOrQuotedCard = ko.observable(undefined);
lookup.beginToTagOrQuote = function(card)
{
    if(typeof(lookup.taggedOrQuotedCard()) !== 'undefined')
    {
        lookup.switchAdditionalInformationText(lookup.taggedOrQuotedCard());
    }
    lookup.taggedOrQuotedCard(card);
};
lookup.cancelAddingTagOrQuote = function()
{
    if(typeof(lookup.taggedOrQuotedCard()) !== 'undefined')
    {
        lookup.switchAdditionalInformationText(lookup.taggedOrQuotedCard());
    }
    lookup.taggedOrQuotedCard(undefined);
};
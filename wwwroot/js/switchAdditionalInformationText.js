lookup.switchAdditionalInformationText = function(card)
{
    card.AdditionalInformationTextVisible(!card.AdditionalInformationTextVisible());
    if(card.AdditionalInformationTextVisible())
    {
        lookup.beginToTagOrQuote(card);
    }
};
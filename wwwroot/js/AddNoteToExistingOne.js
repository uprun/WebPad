lookup.AddNoteToExistingOne = function() {
    var existing = lookup.taggedOrQuotedCard();
    
    lookup.cancelAddingTagOrQuote();
    var extraText = existing.AdditionalInformationText();
    if(typeof(extraText) !== "undefined")
    {
        extraText = extraText.trim();
    }
    else
    {
        extraText = "";
    }
    // block adding of extra information if it is empty
    if(extraText.length !== 0)
    {
        var obj = {
            text: extraText,
            textColor: existing.AdditionalInformationTextColor(),
            hasIncomingConnection: true
        };
        lookup.CreateNote(obj, function(destination) { 
            lookup.ConnectNotes(existing.Note, destination);  
            existing.AdditionalInformationText("");
            existing.AdditionalInformationTextColor(lookup.GetRandomColor().Color());
            if(destination.text().length >= 20)
            {
                lookup.jumpToCardOnCreate(destination);
            }
            
        });
    }
    
};
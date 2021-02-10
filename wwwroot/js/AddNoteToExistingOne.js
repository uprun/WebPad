lookup.AddNoteToExistingOne = function() {
    var existing = lookup.operationToBeQuoted();
    var isQuoteEdit = lookup.isQuoteEdit();
    var textOfQuote = lookup.actualTextOfQuote();
    var colorOfQuote = lookup.colorOfNextQuote();

    if(typeof(textOfQuote) !== "undefined")
    {
        textOfQuote = textOfQuote.trim();
    }
    else
    {
        textOfQuote = "";
    }
    lookup.cancelAddingQuote();

    // block adding of extra information if it is empty
    if(textOfQuote.length !== 0)
    {
        var data =
        {
            quoted: 
            {
                text: existing.text,
                color: existing.color
            },
            current:
            {
                text: textOfQuote,
                color: colorOfQuote
            }

        };
        var operation =
        {
            id: 
            {
                is_local: true,
                prefix: "to-be-defined"
            },
            name: isQuoteEdit ? 'quote-edit' : 'quote',
            data: data,
            time: new Date().toISOString()
        };

        lookup.backendWorker.sendQuery('Operation_was_added', operation);
    }
};
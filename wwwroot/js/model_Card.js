function model_Card(data)
{
    var self = this;
    self.Note = data.Note;
    self.Tags = ko.observableArray([]);
    self.AdditionalInformationText = ko.observable("");
    self.AdditionalInformationTextVisible = ko.observable(false);
    self
        .AdditionalInformationTextVisible
        .subscribe(function(data) 
        {
            if(data)
            {
                self.AdditionalInformationTextFocus(true);
            }
        });
    self.AdditionalInformationTextFocus = ko.observable(false);
    self.AnalyzeText = function(text, query)
    {
        return text.toLowerCase().indexOf(query) >= 0
    };
    self.IsForSearchResult = function(query)
    {
        var result = self.AnalyzeText(self.Note.text(), query);
        if(result)
        {
            return result;
        }
        var filtered =  ko.utils.arrayFilter(self.Tags(), function(item){ return self.AnalyzeText(item.label(), query) || self.AnalyzeText(item.Destination.text(), query) ; } );
        var tagsAnyPassed = filtered.length > 0 ;
        return tagsAnyPassed;
    };
    self.underEdit = ko.observable(false);
    self.blurHandler = function()
    {
        self.AdditionalInformationTextFocus(false);
    };
    self.AdditionalInformationTextColor = ko.observable(lookup.GetRandomColor().Color());
    self.toolBoxVisible = ko.observable(false);
    self.switchToolBoxVisibility = function()
    {
        self.toolBoxVisible(!self.toolBoxVisible());
    };

    self.switchDone = function()
    {
        self.Note.switchDone();
    }

    self.toBeRemoved = ko.observable(false);
    self.prepareToBeRemoved = function()
    {
        self.toBeRemoved(true);
    }
    self.rollbackRemoval = function()
    {
        self.toBeRemoved(false);
    }
    self.completlyRemoved = ko.observable(false);
    self.reallyRemove = function()
    {
        self.completlyRemoved(true);
        lookup.RemoveNote(self);
    }

    self.isInStack = ko.pureComputed(function()
    {
        var foundIndex = lookup.stackOfCards.indexOf(self);
        return foundIndex >= 0;
    });

    self.isTopOfStack = ko.pureComputed(function()
    {
        var foundIndex = lookup.stackOfCards.indexOf(self);
        var lastIndex = lookup.stackOfCards().length -1;
        return lastIndex >= 0 && foundIndex === lastIndex;
    });

}
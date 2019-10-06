function model_Card(data)
{
    var self = this;
    self.Note = data.Note;
    self.Tags = ko.observableArray([]);
    self.ReversedTags = ko.pureComputed(
        function()
        {
            return self.Tags().reverse();
        }
    );
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
        self.Note.isDone(!self.Note.isDone());
    }

}
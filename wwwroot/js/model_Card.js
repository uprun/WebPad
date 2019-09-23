function model_Card(data)
{
    var self = this;
    self.isCardExpanded = ko.observable(false);
    self.Note = data.Note;
    self.Tags = ko.observableArray([]);
    self.InitialTagsCount = ko.observable(0);
    self.AdditionalInformationText = ko.observable("");
    self.AdditionalInformationTextVisible = ko.observable(false);
    self.InitialTags = ko.pureComputed(function()
    {
        return self.Tags().slice(0, self.InitialTagsCount());
    });
    self.RecentTags = ko.pureComputed(
        function()
        {
            return self.Tags().slice(self.InitialTagsCount(), self.Tags().length);
        }
    );
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

}
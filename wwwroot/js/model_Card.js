function model_Card(data)
{
    var self = this;
    self.isCardExpanded = ko.observable(false);
    self.Note = data.Note;
    self.Tags = ko.observableArray([]);
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
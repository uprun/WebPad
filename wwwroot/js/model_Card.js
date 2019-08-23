function model_Card(data)
{
    var self = this;
    self.Note = data.Note;
    self.Tags = ko.observableArray([]);

}
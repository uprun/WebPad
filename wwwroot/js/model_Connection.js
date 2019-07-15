function model_Connection(id, sourceId, destinationId, label, generated, findNodeByIdFunc)
{

    var self = this;
    self.id = id;
    self.SourceId = sourceId;
    self.DestinationId = destinationId;
    self.Source = findNodeByIdFunc(self.SourceId);
    self.Destination = findNodeByIdFunc(self.DestinationId);
    self.label = ko.observable(label);
    self.labelUpdateCallback;
    self.generated = generated ? generated : false;
    self.ConvertToJs = function() {
        return {
            id: self.id,
            SourceId: self.SourceId,
            DestinationId:  self.DestinationId,
            label: self.label(),
            generated: generated
        };
    };
};
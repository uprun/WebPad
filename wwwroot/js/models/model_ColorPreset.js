lookup.model_ColorPreset = function(data)
{
    var self = this;
    self.Color = ko.observable(data.color);
    self.ConvertToJs = function() {
        return {
            Color: self.Color(),
        };
    };
};
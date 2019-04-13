function model_ColorPreset(data)
{

    var self = this;
    self.Background = ko.observable(data.background);
    self.Color = ko.observable(data.color);
    self.ConvertToJs = function() {
        return {
            Color: self.Color(),
            Background: self.Background()
        };
    };
};
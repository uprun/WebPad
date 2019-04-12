function model_ColorPreset(color)
{

    var self = this;
    self.Color = color;
    self.ConvertToJs = function() {
        return {
            Color: self.color
        };
    };
};
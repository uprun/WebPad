function model_Node(data)
{
    var self = this;
    self.id = data.id;
    self.text = ko.observable(data.text);
    self.x = data.x;
    self.y = data.y;
    self.color = data.color;
    self.background = data.background;
    self.ConvertToJs = function() {
        return {
            id: self.id,
            text: self.text(),
            x: self.x,
            y: self.y,
            color: self.color,
            background: self.background
        };
    };
};
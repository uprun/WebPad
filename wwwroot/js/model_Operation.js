lookup.model_Operation = function(data)
{
    var self = this;
    self.id = data.id;
    self.name = data.name;
    self.data = data.data;
    self.time = data.time;

    self.ConvertToJs = function()
    {
        var toReturn =
        {
            id: self.id,
            name: self.name,
            data: self.data,
            time: self.time
        };
        return toReturn;
    };
};
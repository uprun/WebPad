function model_Node(data)
{
    var self = this;
    self.id = data.id;
    self.text = ko.observable(data.text);
    if(typeof(data.textChangedHandler) != "undefined")
    {
        self.text.subscribe(function(changes)
        {
            data.textChangedHandler(changes, self);
        });
    }
    
    self.textAlmost = ko.computed(function()
    {
        var valueToCheck = self.text();
        if( 
            typeof(valueToCheck) == "undefined" ||
             valueToCheck == null || 
             valueToCheck == "")
             {
                 return "...";
             }
        else
        {
            return valueToCheck;
        }
    });
    self.color = data.color;
    self.background = data.background;
    self.underEdit = ko.observable(false);

    if(typeof(self.color) == "undefined" || self.color == null)
    {
        self.color = '#d190ff';
    }
    self.ConvertToJs = function() {
        return {
            id: self.id,
            text: self.text(),
            color: self.color,
            background: self.background
        };
    };
};
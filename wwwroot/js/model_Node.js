function model_Node(data)
{
    var self = this;
    self.id = data.id;
    self.text = ko.observable(data.text);
    self.text.subscribe(data.textChangedHandler);
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
    
    if(typeof(self.background) == "undefined" || self.background == null)
    {
        self.background = '#97c2fc';
    }
    if(typeof(self.color) == "undefined" || self.color == null)
    {
        self.color = '#333333';
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
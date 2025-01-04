lookup.model_Operation = function(data)
{
    var self = this;
    self.name = data.name;
    self.data = data.data;
    self.time = data.time;


    self.createDate = new Date(self.time);

    var date = "" + self.createDate.getFullYear() +
        "-" + ((self.createDate.getMonth() + 1) + "").padStart(2, "0") +
        "-" + (self.createDate.getDate() + "").padStart(2, "0");
    
    var time = (self.createDate.getHours() + "").padStart(2, "0") +
    ":" + (self.createDate.getMinutes() + "").padStart(2, "0") + 
    ":" + (self.createDate.getSeconds() + "").padStart(2, "0");

    self.createDateToOrder = date + "  " +  time;

    if(self.name === 'create')
    {
        lookup.prefill_Operation(self, self.data);
    }
    if(self.name === 'quote' || self.name === 'quote-edit')
    {
        lookup.prefill_Operation(self, self.data.current);
        self.quoted = {};
        lookup.prefill_Operation(self.quoted, self.data.quoted);
    }

    self.ConvertToJs = function()
    {
        var toReturn =
        {
            name: self.name,
            data: self.data,
            time: self.time
        };
        return toReturn;
    };

    self.toTupleKey = function()
    {
        var key = {name: self.name, data: self.data};
        var toReturn = JSON.stringify(key);
        return toReturn;
    };
};
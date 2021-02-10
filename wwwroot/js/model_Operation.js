lookup.model_Operation = function(data)
{
    var self = this;
    self.id = data.id;
    self.name = data.name;
    self.data = data.data;
    self.time = data.time;

    self.createDate = new Date(self.time);

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
            id: self.id,
            name: self.name,
            data: self.data,
            time: self.time
        };
        return toReturn;
    };

    self.toolBoxVisible = ko.observable(false);
    self.switchToolBoxVisibility = function()
    {
        self.toolBoxVisible(!self.toolBoxVisible());

    };
};

lookup.prefill_Operation = function(self, abc) {

    self.color = abc.color;
    self.text = abc.text;
    var test = abc.text.split(" ");
    self.textSplitted = ko.utils.arrayMap(test, function (item) {
        var toSearch = item
            .replace("\r", " ")
            .replace("\n", " ")
            .replace("\t", " ")
            .toLowerCase()
            .trim();
        
        // if url then do nothing
        if(!toSearch.startsWith("https://"))
        {
            if (
                toSearch.endsWith(",")
                || toSearch.endsWith(".")
                || toSearch.endsWith("?")
                || toSearch.endsWith("!")) 
            {
                toSearch = toSearch.substring(0, toSearch.length - 1);
            }

        }
        
        return {
            word: item,
            wordQuery: toSearch
        };
    }
    );
}

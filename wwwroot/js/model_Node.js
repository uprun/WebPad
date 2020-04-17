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
        var valueToCheck = self.text().trim();
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
    self.createDate = data.createDate;
    if(typeof(data.isDone) != "undefined")
    {
        self.isDone = ko.observable(data.isDone);
    }
    else
    {
        self.isDone = ko.observable(false);
    }
    self.switchDone = function()
    {
        self.isDone(!self.isDone());
        var info = self.ConvertToJs();
        lookup.pushToHistory({
            action: lookup.actions.NoteUpdated,
            data: info
        });

    }

    self.isReferenced = ko.observable(false);
    self.ReferencedBy = ko.observableArray([]);
    


    if(typeof(self.color) == "undefined" || self.color == null)
    {
        self.color = '#d190ff';
    }
    


    self.ConvertToJs = function() {
        return {
            id: self.id,
            text: self.text(),
            color: self.color,
            background: self.background,
            createDate: self.createDate,
            isDone: self.isDone()
        };
    };

    if(typeof(self.createDate) == "undefined" || self.createDate == null)
    {
        self.createDate = new Date();
        if(self.id !== -1 )
        {
            var info = self.ConvertToJs();
            lookup.pushToHistory({
                action: lookup.actions.NoteUpdated,
                data: info
            });
        }
        
    }
    else
    {
        self.createDate = new Date(self.createDate);
    }

    self.textSplitted = ko.pureComputed(function(){
        var test = self.text().split(" ");
        var result = ko.utils.arrayMap(test, function(item)
            {
                var toSearch = 
                    item
                    .replace("\r", " ")
                    .replace("\n", " ")
                    .replace("\t", " ")
                    .toLowerCase()
                    .trim();
                
                if(
                    toSearch.endsWith(",") 
                    || toSearch.endsWith(".") 
                    || toSearch.endsWith("?")
                    || toSearch.endsWith("!")
                )
                {
                    toSearch = toSearch.substring(0, toSearch.length - 1);
                }

                var found = lookup.dictionary_of_notes()[toSearch];
                return {
                    word: item,
                    wordNode: found,
                    exists: typeof(found) !== 'undefined' && self !== found
                };
            }
        );
        return result;
    });
};
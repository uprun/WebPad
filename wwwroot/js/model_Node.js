lookup.model_Node = function(data)
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

    self.color = data.color;
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

    self.IsForSearchResult = function(query)
    {
        
        var entry = lookup.dictionary_of_notes[query];
        if(typeof(entry) !== 'undefined')
        {
            var own_id_entry = entry[self.id];
            if(typeof(own_id_entry) !== 'undefined' )
            {
                return own_id_entry;
            }
            else
            {
                return false;
            }
        }
        else
        {
            return false;
        }
        
    };

    self.hasIncomingConnection = data.hasIncomingConnection;

    self.isReferenced = ko.observable(false);
    self.ReferencedBy = ko.observableArray([]);
    self.ReferencedByWrapped = ko.pureComputed(function()
    {
        return ko.utils.arrayMap(self.ReferencedBy(), function(elem)
        {
            var item = elem.Source;
            var result = {
                color: item.color,
                id: item.id,
                parentNodeId: self.id,
                textSplitted: ko.pureComputed(function()
                {
                    return ko.utils.arrayMap(item.textSplitted(), function(elemWord)
                    {
                        return {
                            word: elemWord.word,
                            wordNode: elemWord.wordNode,
                            wordQuery: elemWord.wordQuery,
                            exists: elemWord.exists,
                            isUrl: elemWord.isUrl,
                            parentNodeId: self.id
                        };

                    });
                })
            };
            return result;
        })
    });
    self.AddExternalReferencedBy = function(data)
    {
        var filtered =  
            ko.utils.arrayFilter
            (
                self.ReferencedBy(),
                function(item)
                { 
                    return  item.Source.id === data.Source.id;
                } 
            );
        if(filtered.length === 0)
        {
            self.ReferencedBy.push(data);
        }
    };
    
    


    if(typeof(self.color) == "undefined" || self.color == null)
    {
        self.color = '#d190ff';
    }
    


    self.ConvertToJs = function() {
        return {
            id: self.id,
            text: self.text(),
            color: self.color,
            createDate: self.createDate,
            isDone: self.isDone(),
            hasIncomingConnection: self.hasIncomingConnection
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
        var anotherDummyTriggerCall = lookup.dictionary_of_notes_updated();
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

                var found = lookup.dictionary_of_notes[toSearch];
                return {
                    word: item,
                    wordQuery: toSearch,
                    wordNode: found,
                    exists: typeof(found) !== 'undefined',
                    isUrl: item.startsWith("https://"),
                    parentNodeId: self.id
                };
            }
        );
        return result;
    });
};
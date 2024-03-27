importScripts("../lib/knockout/knockout-latest.debug.js" + "?v=" + new Date().toString())
var lookup = {
};
lookup.Notes = ko.observableArray([]);
lookup.ColorPresets = ko.observableArray([]);
lookup.Connections = ko.observableArray([]);
lookup.history = ko.observableArray([]); 
lookup.data_color_presets = [ 
    { 
        background: "inherit",
        color: "#ffa26b" 
    },
    { 
        background: "inherit",
        color: "#84bfff" 
    },
    { 
        background: "inherit",
        color: "#ff94eb" 
    },
    { 
        background: "inherit",
        color: "#64e05e" 
    },
    { 
        background: "inherit",
        color: "#f8e755" 
    },
    { 
        background: "inherit",
        color: "#ffbbdc" 
    },
    { 
        background: "inherit",
        color: "#d190ff" 
    },
    { 
        background: "inherit",
        color: "#ff8f95" 
    }
];;

lookup.populateColorPresets = function()
{
    var toAddColors = ko.utils.arrayMap(lookup.data_color_presets, function(elem) 
    {
        var toReturn = new lookup.model_ColorPreset(elem);
        return toReturn;
    });

    ko.utils.arrayPushAll(lookup.ColorPresets, toAddColors);

};

lookup.model_Card = function(data)
{   
    // DEPRECATED: use model_Operation.js instead
    var self = this;
    self.Note = data.Note;
    self.isRoot = typeof(data.connections_incoming) === 'undefined';
    self.hasTags = typeof(data.connections_outgoing) !== 'undefined';
    self.Tags = ko.observableArray([]);

    self.ConvertToJs = function()
    {
        var data = {};
        data.Note_serialized = self.Note.ConvertToJs();
        data.connections_incoming = self.isRoot ? undefined : [];
        data.connections_outgoing = self.hasTags ? [] : undefined;
        return data;
    }

    self.AdditionalInformationText = ko.observable("");
    self.AdditionalInformationTextVisible = ko.observable(false);
    self
        .AdditionalInformationTextVisible
        .subscribe(function(data) 
        {
            if(data)
            {
                self.AdditionalInformationTextFocus(true);
            }
        });
    self.AdditionalInformationTextFocus = ko.observable(false);
    self.AnalyzeText = function(text, query)
    {
        return text.toLowerCase().indexOf(query) >= 0
    };
    self.IsForSearchResult = function(query)
    {
        var result = self.Note.IsForSearchResult(query);
        if(result)
        {
            return result;
        }
        var filtered =  
            ko.utils.arrayFilter
            (
                self.SmallTags(),
                function(item)
                { 
                    var result = 
                        item.Destination.IsForSearchResult(query)
                    return result; 
                } 
            );
        var tagsAnyPassed = filtered.length > 0 ;
        if(tagsAnyPassed)
        {
            return true;
        }
        var filteredReferencedBy =  
            ko.utils.arrayFilter
            (
                self.Note.ReferencedBy(),
                function(item)
                { 
                    var result = 
                        item.Source.IsForSearchResult(query);
                    return result; 
                } 
            );

        var referencedByPassed = filteredReferencedBy.length > 0;
        return referencedByPassed;
    };
    self.underEdit = ko.observable(false);
    
    self.AdditionalInformationTextColor = ko.observable(lookup.GetRandomColor().Color());
    self.toolBoxVisible = ko.observable(false);
    self.switchToolBoxVisibility = function()
    {
        self.toolBoxVisible(!self.toolBoxVisible());
        return true;
    };

    self.markAsDone = function()
    {
        event.stopPropagation();
        self.convertTo("done");
        self.convertFrom("not-done");
    };
    self.removeDone = function()
    {
        event.stopPropagation();
        self.convertFrom("done");
        self.convertTo("not-done");
    }

    self.toBeRemoved = ko.observable(false);
    self.prepareToBeRemoved = function()
    {
        self.toBeRemoved(true);
    }
    self.rollbackRemoval = function()
    {
        self.toBeRemoved(false);
    }
    self.completlyRemoved = ko.observable(false);
    self.reallyRemove = function()
    {
        self.completlyRemoved(true);
        // remove incoming references
        ko.utils.arrayForEach
        (
            self.Note.ReferencedBy(), 
            function(item) 
            {
                lookup.RemoveConnection(item);
            }
        );
        
        //remove tags
        ko.utils.arrayForEach
        (
            self.SmallTags(), 
            function(item) 
            {
                lookup.RemoveConnection(item);
                lookup.RemoveNote({Note: item.Destination });
            }
        );
        lookup.RemoveNote(self);
    }

    self.isTask = ko.pureComputed(function()
    {
        return self.hasSmallTag("task");
    });

    self.isDone = ko.pureComputed(function()
    {
        return self.hasSmallTag("done");
    });

    self.hasSmallTag = function(tag)
    {
        tag = tag.toLowerCase().trim();
        var foundTaskTag = ko.utils.arrayFirst(self.SmallTags(), function(item){
            return item.Destination.text().toLowerCase().trim() === tag;
        });
        return  typeof(foundTaskTag) !== 'undefined';
    };


    self.convertFromTask = function()
    {
        self.convertFrom("task");
    };

    self.convertFrom = function(tag)
    {
        tag = tag.toLowerCase().trim();
        var foundTaskTags = 
        ko.utils.arrayFilter(self.SmallTags(),
            function(item)
            {
                return item.Destination.text().toLowerCase().trim() === tag;
            });
        ko.utils.arrayForEach
        (
            foundTaskTags, 
            function(item) 
            {
                lookup.RemoveConnection(item);
                lookup.RemoveNote({Note: item.Destination });
            }
        );
        
    };

    self.removeTag = function(item)
    {
        lookup.RemoveConnection(item.originalTag);
        lookup.RemoveNote({Note: item.originalTag.Destination });
    };

    self.convertToTask = function()
    {
        self.convertTo("task");
    };

    self.convertTo = function(tag)
    {
        tag = tag.toLowerCase().trim();
        if(self.hasSmallTag(tag) === false)
        {
            lookup.AddInformationToExistingOne(self, tag);
        }
    };

    self.isSmallTagChecker = function(item)
    {
        if(typeof(item.DestinationCard) !== 'undefined' 
            && item.DestinationCard.Tags().length > 0)
        {
            return false;
        }
        else
        {
            return item.Destination.text().length < 20;
        }
    };

    self.SmallTags = ko.pureComputed(function()
    {
        return ko.utils.arrayFilter(self.Tags(), function(item)
        {
            return self.isSmallTagChecker(item);
        })
    });

    self.SmallTagsWrapped = ko.pureComputed(function()
    {
        return ko.utils.arrayMap(self.SmallTags(), function(elem)
        {
            var item = elem.Destination;
            var result = {
                originalTag: elem,
                color: item.color,
                id: item.id,
                parentNodeId: self.Note.id,
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
                            parentNodeId: self.Note.id
                        };

                    });
                })
            };
            return result;
        })
    });

    self.BigTags = ko.pureComputed(function()
    {
        return ko.utils.arrayFilter(self.Tags(), function(item)
        {
            return self.isSmallTagChecker(item) === false;
        })
    });
};
lookup.model_ColorPreset = function(data)
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
lookup.model_Connection = function(data)
{
    var id = data.id;
    var sourceId = data.sourceId;
    var destinationId = data.destinationId;
    var label = data.label;
    var generated = data.generated;
    var findNodeByIdFunc = data.findNodeByIdFunc;

    var self = this;
    self.id = id;
    self.SourceId = sourceId;
    self.DestinationId = destinationId;
    self.Source = findNodeByIdFunc(self.SourceId);
    self.Destination = findNodeByIdFunc(self.DestinationId);
    self.DestinationCard = lookup.hashCards[self.DestinationId];
    self.Destination.isReferenced(true);
    self.Destination.AddExternalReferencedBy(self);
    self.label = ko.observable(label);
    if(typeof(data.textChangedHandler) != "undefined")
    {
        self.label.subscribe(function(changes)
        {
            data.textChangedHandler(changes, self);
        });
    }
    self.labelAlmost = ko.computed(function()
    {
        var valueToCheck = self.label();
        if( 
            typeof(valueToCheck) == "undefined" ||
             valueToCheck == null || 
             valueToCheck == "")
             {
                 return "";
             }
        else
        {
            return valueToCheck;
        }
    });
    self.labelUpdateCallback;
    self.generated = generated ? generated : false;
    self.underEdit = ko.observable(false);
    self.ConvertToJs = function() {
        return {
            id: self.id,
            SourceId: self.SourceId,
            DestinationId:  self.DestinationId,
            label: self.label(),
            generated: generated
        };
    };
    self.switchDone = function()
    {
        self.Destination.switchDone();
    }

    self.toolBoxVisible = ko.observable(false);
    self.switchToolBoxVisibility = function()
    {
        self.toolBoxVisible(!self.toolBoxVisible());
    };
    self.DisplayNextLevel = ko.observable(true);
    self.SwitchDisplayNextLevel = function()
    {
        self.DisplayNextLevel(!self.DisplayNextLevel());
    };
    self.toUnlink = ko.observable(false);
    self.prepareToUnlink = function()
    {
        self.toUnlink(true);
    };
    self.cancelUnlink = function()
    {
        self.toUnlink(false);
    };
    self.confirmUnlink = function()
    {
        lookup.RemoveConnection(self);
    };

};
// DEPRECATED: use model_Operation.js instead


lookup.model_Node = function(data)
{
    // DEPRECATED: use model_Operation.js instead
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

    // DEPRECATED: use model_Operation.js instead

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
    
    
    // DEPRECATED: use model_Operation.js instead

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
        // DEPRECATED: use model_Operation.js instead
    }
    else
    {
        self.createDate = new Date(self.createDate);
    }

    self.textSplitted = ko.pureComputed(function(){
        var anotherDummyTriggerCall = lookup.dictionary_of_notes_updated();
        var all_words = self.text().split(" ");

        // DEPRECATED: use model_Operation.js instead
        var result = ko.utils.arrayMap(all_words, function(item)
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
        // DEPRECATED: use model_Operation.js instead
        return result;
    });
};
lookup.model_Operation = function(data)
{
    var self = this;
    self.id = data.id;
    self.name = data.name;
    self.data = data.data;
    self.time = data.time;

    self.bottom = ko.observable(0);
    self.offsetHeight = ko.observable(0);

    self.globalBottom = ko.computed(() => self.bottom() + lookup.globalOffsetY());
    self.visible = ko.computed(() => {
         var top = self.globalBottom() + self.offsetHeight();
         var bottom = self.globalBottom();
         var height = lookup.globalScreenHeight();
         // this is basically an inverse of invisibility rules
         var visible = top >= 0 && bottom <= height;
         return visible;
        });

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
        return true;
    };

    self.toTupleKey = function()
    {
        var key = {name: self.name, data: self.data};
        var toReturn = JSON.stringify(key);
        return toReturn;
    };
};

lookup.split_color_from_6_hex = function(color_in_6_hex)
{
    var hex_red = '0x' + color_in_6_hex.substring(1, 3);
    var hex_green = '0x' + color_in_6_hex.substring(3, 5);
    var hex_blue = '0x' + color_in_6_hex.substring(5, 7);
    var int_red = parseInt(hex_red, 16);
    var int_green = parseInt(hex_green, 16);
    var int_blue = parseInt(hex_blue, 16);
    var colorWithIntComponents = 
    {
        red: int_red,
        green: int_green,
        blue: int_blue
    };
    return colorWithIntComponents;
};

lookup.form_rgba_string_constant = function(color_with_components, alpha)
{
    var toReturn = 'rgba(' + color_with_components.red + ', ' + color_with_components.green + ', ' + color_with_components.blue + ', ' + alpha +')' ;
    return toReturn;
};

lookup.prefill_Operation = function(self, abc) {

    self.color = abc.color;
    self.text = abc.text;
    if(typeof(abc.color) === 'undefined')
    {
        self.color_border = "#ff12ff";
    }
    else
    {
        var color_with_components = lookup.split_color_from_6_hex(abc.color);

        self.color_border = lookup.form_rgba_string_constant(color_with_components, '0.6')
    }
    var all_words = abc.text.split(" ");

    //added by  https://github.com/uprun/WebPad/commit/94fd9c41916641fbafc4fb8d62f639e384f31349?diff=split&w=1
    // by suggestion from https://github.com/minaph
    if (globalThis?.TinySegmenter && lookup.option_use_Japanese_tokeniser()) 
    {
        console.log("TinySegmenter for Japanese language is working")
        var segmenter = new TinySegmenter();
        var segmented_words = [];
        for (const word of all_words) 
        {
            if (word.toLowerCase().startsWith("https://")) 
            {
                segmented_words.push(word);
            } 
            else 
            {
                segmented_words.push(...segmenter.segment(word));
            }
        }
        all_words = segmented_words;
    }
    // end of https://github.com/uprun/WebPad/commit/94fd9c41916641fbafc4fb8d62f639e384f31349?diff=split&w=1

    self.textSplitted = ko.utils.arrayMap(all_words, function (item) {
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
lookup.get_Operation_Index = function() {
    var toReturn = 
    {
        is_local: true,
        prefix: "to-be-defined"
    }
    return toReturn;
};

lookup.migrate_to_Operations = function()
{
    var toProcess = lookup.Notes();
    var buffer = [];
    
    ko.utils.arrayForEach(
        toProcess, 
        function(elem)
        {
            if(elem.ReferencedBy().length === 0)
            {
                var toPush = operation_create(elem);
                buffer.push
                (
                    toPush  
                );
            }
            else
            {
                var externalReferences = elem.ReferencedBy();
                ko.utils.arrayForEach
                (
                    externalReferences,
                    function(sub)
                    {
                        var toPush = operation_quote(sub.Source, elem);
                        buffer.push
                        (
                            toPush  
                        );
                    }
                );
            }
        }
    );

    buffer = buffer.sort(
        function (left, right) {
            if (left.time === right.time) {
                return 0;
            }

            else {
                if (left.time < right.time) {
                    return -1;
                }

                else {
                    return 1;
                }
            }
        }
    );

    ko.utils.arrayPushAll(lookup.Operations, buffer);
};

function operation_quote(sub, elem) {
    return new lookup.model_Operation(
        {
            id: lookup.get_Operation_Index(),
            name: "quote",
            data: {
                quoted: {
                    text: sub.text(),
                    color: sub.color
                },
                current: {
                    text: elem.text(),
                    color: elem.color
                }
            },
            time: elem.createDate
        }
    );
}

function operation_create(elem) {
    return new lookup.model_Operation(
        {
            id: lookup.get_Operation_Index(),
            name: "create",
            data: {
                text: elem.text(),
                color: elem.color
            },
            time: elem.createDate
        }
    );
}
lookup.Instanciate_model_node = function(data)
    {
        data.textChangedHandler = function(changes, model) 
        {
            if(changes 
                //&& changes != model.text()
                )
            {
                var toSend = model.ConvertToJs();
                toSend.text = changes;
                
                lookup.pushToHistory({
                        action: lookup.actions.NoteUpdated,
                        data: toSend
                    }
                );
            }
        };
        var result = new lookup.model_Node(data);
        return result;
    };
lookup.GetRandomColor = function() {
    var selectedColorIndex = Math.floor(Math.random() * lookup.ColorPresets().length);
    var selectedColor = lookup.ColorPresets()[selectedColorIndex];
    return selectedColor;
};
lookup.Instanciate_model_connection = function(data)
    {
        data.textChangedHandler = function(changes, model) 
        {
            if(changes  
                //&& changes != model.label()
                )
            {
                var toSend = model.ConvertToJs();
                toSend.label = changes;
                lookup.pushToHistory({
                    action: lookup.actions.ConnectionUpdated,
                    data: toSend
                });
            }
        };
        var result = new lookup.model_Connection(data);
        return result;
    };
lookup.findNodeById_buffer = undefined;
lookup.findNodeById_notFound = new lookup.model_Node({id: -1, text: 'not found'});
lookup.findNodeById = function(id)
{
    if(typeof(lookup.findNodeById_buffer) == "undefined")
    {
        lookup.findNodeById_buffer = {};
        ko.utils.arrayForEach
        (
            lookup.Notes(), 
            function(item) 
                {
                    lookup.findNodeById_buffer[item.id] = item;
                }
        );
    }

    var result = lookup.findNodeById_buffer[id];
    if(typeof(result) == "undefined")
    {
        var filtered = ko.utils.arrayFilter(lookup.Notes(), function(item){ return item.id == id;} );
        result = filtered.length > 0 ? filtered[0] : undefined;
    }
    if(typeof(result) === 'undefined')
    {
        result = lookup.findNodeById_notFound;
    }

    return result;

};
lookup.SearchNotesQuery = ko.observable("");
// lookup.SearchNotesQuery
//     .extend({ rateLimit: 150 });

lookup.SearchNotesQuery
    .subscribe(function()
    {
        if(typeof(lookup.backendWorker) !== 'undefined')
        {
            lookup.backendWorker.sendQuery('SearchNotesQuery', lookup.SearchNotesQuery());

        }
        
    });
lookup.findCardByMainNodeId = function(mainId)
{
    var found = lookup.hashCards[mainId];
    if(found)
    {
        return found;
    }
    else
    {
        return null;
    }
};
lookup.populate_Operations = function(data) {

    var buffer = [];
    
    buffer = ko.utils.arrayMap(
        data.Operations, 
        function(elem)
        {
            return new lookup.model_Operation(elem);
        }
    );

    ko.utils.arrayPushAll(lookup.Operations, buffer);

    var distinctBuffer = {};

    ko.utils.arrayForEach
    (
        lookup.Operations(), 
        function(item) 
        {
            var key = item.toTupleKey();
            if(typeof(distinctBuffer[key]) !== 'undefined')
            {
                distinctBuffer[key].push(item);
            }
            else
            {
                distinctBuffer[key] = [item];
            }
        }
    );

    const distinctKeys = Object.keys(distinctBuffer);
    var toUseArray = [];

    distinctKeys.forEach((key, index) => {
        var localGroup = distinctBuffer[key];
        var sortedLocalGroup = localGroup.sort
        (
            (first, second) => first.time - second.time
        );
        toUseArray.push(sortedLocalGroup[0]);
    });

    var sortedDistinctObjects = toUseArray.sort((first, second) => first.time - second.time);

    lookup.Operations(sortedDistinctObjects);

};

lookup.Operation_was_added = function(data) {
    // backend-worker context
    var toAdd = new lookup.model_Operation(data);
    lookup.Operations.push(toAdd);
};
lookup.demo_notes_en = [
    {
        "id": {
            "is_local": true,
            "prefix": "to-be-defined"
        },
        "name": "create",
        "data": {
            "text": "WebPad is a wiki, personal-wiki",
            "color": "#ffa26b"
        },
        "time": "2020-04-18T13:16:53.119Z"
    },
    {
        "id": {
            "is_local": true,
            "prefix": "to-be-defined"
        },
        "name": "create",
        "data": {
            "text": "actually WebPad is a non-hierarchical notes app",
            "color": "#ffbbdc"
        },
        "time": "2020-04-18T14:59:51.957Z"
    },
    {
        "id": {
            "is_local": true,
            "prefix": "to-be-defined"
        },
        "name": "create",
        "data": {
            "text": "every word is a hashtag by default, try it - click any word",
            "color": "#84bfff"
        },
        "time": "2020-04-18T14:59:54.957Z"
    },
    {
        "id": {
            "is_local": true,
            "prefix": "to-be-defined"
        },
        "name": "quote",
        "data": {
            "quoted": {
                "text": "you can quote",
                "color": "#ff94eb"
            },
            "current": {
                "text": "try to click on empty space",
                "color": "#64e05e"
            }
        },
        "time": "2020-04-18T15:04:12.836Z"
    },
    {
        "id": {
            "is_local": true,
            "prefix": "to-be-defined"
        },
        "name": "create",
        "data": {
            "text": "app for Android is here https://play.google.com/store/apps/details?id=ua.com.webpad",
            "color": "#ffbbdc"
        },
        "time": "2020-04-18T15:15:29.295Z"
    },
    {
        "id": {
            "is_local": true,
            "prefix": "to-be-defined"
        },
        "name": "create",
        "data": {
            "text": "try out a search bar at the bottom",
            "color": "#ff8f95"
        },
        "time": "2020-04-18T15:19:04.446Z"
    }
];
lookup.empty_note = 
{
    "id": {
        "is_local": true,
        "prefix": "to-be-defined"
    },
    "name": "create",
    "data": {
        "text": "",
        "color": "#ffa26b"
    },
    "time": "2023-12-15T13:16:53.119Z"
};
lookup.CheckIfEveryNodeHasMigratedColor = function()
    {
            ko.utils.arrayForEach(lookup.Notes(), function(item) {
                lookup.MigrationOfColorOfNode(item);
            });
    };

    lookup.composedCards = ko.observableArray([]);
    lookup.dictionary_of_notes = {};

    lookup.dictionary_of_notes_updated = ko.observable(0);

    lookup.split_search_key_and_add_to_dictionary = function(key, note_id, flag)
    {
        var index = 0;
        
        while(key.length > 0)
        {
            for(index = 0; index < key.length; index++)
            {
                var to_work_with = key.substring(index);
                var entry = lookup.dictionary_of_notes[to_work_with];
                if(typeof(entry) === 'undefined')
                {
                    lookup.dictionary_of_notes[to_work_with] = {};
                    entry = lookup.dictionary_of_notes[to_work_with];
                }
                entry[note_id] = flag;
                
            }
            key = key.substring(0, key.length - 1);
        }
    };

    lookup.generateDictionary = function()
    {
        
        ko.utils.arrayForEach(lookup.composedCards(), function(item) 
        {    
            var key = 
                item
                .Note
                .text()
                .replace("\r", " ")
                .replace("\n", " ")
                .replace("\t", " ")
                .toLowerCase()
                .trim();
            
            lookup.split_search_key_and_add_to_dictionary(key, item.Note.id, true);

        });
        var val = lookup.dictionary_of_notes_updated();
        lookup.dictionary_of_notes_updated(val + 1);
    };

    lookup.generateDictionary_NoteAdded = function(note)
    {
        
        var key = 
                note
                .text()
                .replace("\r", " ")
                .replace("\n", " ")
                .replace("\t", " ")
                .toLowerCase()
                .trim();
        lookup.split_search_key_and_add_to_dictionary(key, note.id, true);
        var val = lookup.dictionary_of_notes_updated();
        lookup.dictionary_of_notes_updated(val + 1);

    };


    lookup.populateConnections = function()
    {
        
        lookup.populateConnections_startIndex = lookup.data.connections.length -1;
        while(lookup.populateConnections_startIndex >= 0)
        {
            console.log('populateConnections: ' + lookup.populateConnections_startIndex);
            var batchArray = [];
            for(var batchKey = 0; batchKey < 100 && lookup.populateConnections_startIndex >= 0; batchKey++, lookup.populateConnections_startIndex--)
            {
                var elem = lookup.data.connections[lookup.populateConnections_startIndex];
                var connectionToAdd = lookup.Instanciate_model_connection(
                    {
                        id: elem.id,
                        sourceId: elem.SourceId,
                        destinationId: elem.DestinationId,
                        label: elem.label,
                        generated: elem.generated,
                        findNodeByIdFunc: lookup.findNodeById
                    });
                var found = lookup.hashCards[connectionToAdd.SourceId];
                if(found)
                {
                    found.Tags.unshift(connectionToAdd);
                }
                batchArray.push(connectionToAdd);

            }
            ko.utils.arrayPushAll(lookup.Connections, batchArray);

        }
        setTimeout(lookup.generateDictionary, 1);

    };


    lookup.populateNotes = function()
    {
        lookup.populateNotes_startIndex = lookup.data.notes.length -1;
        while(lookup.populateNotes_startIndex >= 0)
        {
            console.log('populateNotes: ' + lookup.populateNotes_startIndex);
            var batchArray = [];
            var cardsBatch = [];
            for(var batchKey = 0; batchKey < 100 && lookup.populateNotes_startIndex >= 0; batchKey++, lookup.populateNotes_startIndex--)
            {
                var elem = lookup.data.notes[lookup.populateNotes_startIndex];
                var noteToAdd = lookup.Instanciate_model_node(elem);
                var outgoing = lookup.outgoing_connections[noteToAdd.id];
                var incoming = lookup.incoming_connections[noteToAdd.id];
                var composedCard = new lookup.model_Card({ Note: noteToAdd, connections_incoming: incoming, connections_outgoing: outgoing });
                lookup.hashCards[noteToAdd.id] = composedCard;
                cardsBatch.push(composedCard);
                batchArray.push(noteToAdd);
            }
            ko.utils.arrayPushAll(lookup.Notes, batchArray);
            ko.utils.arrayPushAll(lookup.composedCards, cardsBatch);

        }
        lookup.populateConnections();


        

    };

    lookup.outgoing_connections = {};
    lookup.incoming_connections = {};


    lookup.populate_incoming_outgoing_connections = function()
    {
        lookup.populate_incoming_outgoing_connections_index = lookup.data.connections.length -1;
        console.log('populate_incoming_outgoing_connections: ' + lookup.populate_incoming_outgoing_connections_index);

        for(;  lookup.populate_incoming_outgoing_connections_index >= 0; lookup.populate_incoming_outgoing_connections_index--)
        {
            var elem = lookup.data.connections[lookup.populate_incoming_outgoing_connections_index];
            var stored_outgoing = lookup.outgoing_connections[elem.SourceId];
            if(typeof(stored_outgoing) === 'undefined')
            {
                lookup.outgoing_connections[elem.SourceId] = [];
                stored_outgoing = lookup.outgoing_connections[elem.SourceId];
            }
            stored_outgoing.push(elem);

            var stored_incoming = lookup.incoming_connections[elem.DestinationId];
            if(typeof(stored_incoming) === 'undefined')
            {
                lookup.incoming_connections[elem.DestinationId] = [];
                stored_incoming = lookup.incoming_connections[elem.DestinationId];
            }
            stored_incoming.push(elem);
            
        }

        lookup.populateNotes();       

    };

    lookup.populate = function(data) {
        lookup.for_code_access_hash_of_color_presets = {};
        lookup.data_color_presets.forEach(element => {
            lookup.for_code_access_hash_of_color_presets[element.color] = true;
        });
        lookup.data = data;

        lookup.populate_incoming_outgoing_connections();    
    };

lookup.populate_reset_helpers = function()
{
    lookup.populate_incoming_outgoing_connections_index = undefined;
    lookup.populateNotes_startIndex = undefined;
    lookup.populateConnections_startIndex = undefined;
};

lookup.option_show_help_demo_notes = ko.observable(false);
lookup.set_option_show_help_demo_notes_to_true = function() 
{
    lookup.option_show_help_demo_notes(true);
    lookup.localStorage["option_show_help_demo_notes"] = true;
    lookup.send_to_worker_update_for_option_show_help_demo_notes();
};

lookup.set_option_show_help_demo_notes_to_false = function() 
{
    lookup.option_show_help_demo_notes(false);
    lookup.localStorage["option_show_help_demo_notes"] = false;
    lookup.send_to_worker_update_for_option_show_help_demo_notes();
};

lookup.apply_saved_option_show_help_demo_notes = function() 
{
    var stored = lookup.localStorage["option_show_help_demo_notes"] === "true";
    lookup.option_show_help_demo_notes(stored);
    lookup.send_to_worker_update_for_option_show_help_demo_notes();
};

lookup.for_worker_apply_changes_in_option_show_help_demo_notes = function(newValue)
{
    lookup.option_show_help_demo_notes(newValue);
};

lookup.send_to_worker_update_for_option_show_help_demo_notes = function()
{
    if(typeof(lookup.backendWorker) !== 'undefined')
    {
        const valueToSend = lookup.option_show_help_demo_notes();
        lookup.backendWorker.sendQuery('for_worker_apply_changes_in_option_show_help_demo_notes', valueToSend);
    }
    
};
lookup.option_use_Japanese_tokeniser = ko.observable(false);
lookup.set_option_use_Japanese_tokeniser_to_true = function() 
{
    lookup.option_use_Japanese_tokeniser(true);
    lookup.localStorage["option_use_Japanese_tokeniser"] = true;
    lookup.send_to_worker_update_for_option_use_Japanese_tokeniser();
};

lookup.set_option_use_Japanese_tokeniser_to_false = function() 
{
    lookup.option_use_Japanese_tokeniser(false);
    lookup.localStorage["option_use_Japanese_tokeniser"] = false;
    lookup.send_to_worker_update_for_option_use_Japanese_tokeniser();
};

lookup.apply_saved_option_use_Japanese_tokeniser = function() 
{
    var stored = lookup.localStorage["option_use_Japanese_tokeniser"] === "true";
    lookup.option_use_Japanese_tokeniser(stored);
    lookup.send_to_worker_update_for_option_use_Japanese_tokeniser();
};

lookup.for_worker_apply_changes_in_option_use_Japanese_tokeniser = function(newValue)
{
    lookup.option_use_Japanese_tokeniser(newValue);
};

lookup.send_to_worker_update_for_option_use_Japanese_tokeniser = function()
{
    if(typeof(lookup.backendWorker) !== 'undefined')
    {
        const valueToSend = lookup.option_use_Japanese_tokeniser();
        lookup.backendWorker.sendQuery('for_worker_apply_changes_in_option_use_Japanese_tokeniser', valueToSend);
    }
    
};
lookup.find_aliases = function(query)
    {
        // backend-worker context
        query = query.trim().toLowerCase();
        const found_aliases = lookup.Aliases[query];
        if(typeof(found_aliases) === 'undefined')
        {
            return [];
        }
        else
        {
            return Object.getOwnPropertyNames(found_aliases).filter(element => found_aliases[element]);
        }
    };
lookup.import_Operations = function(data) {
    // needed in order to know when to call 'regenerate_Aliases'

    lookup.populate_Operations(data);

};
lookup.populate_Aliases = function(data)
    {
        var _aliases = JSON.parse(data.Aliases);
        // backend-worker context
        lookup.define_Aliases_if_needed();
        lookup.Aliases = _aliases;
        // var aliases_keys = Object.getOwnPropertyNames(data.Aliases);
        // for(var k = 0; k < aliases_keys.length; k++)
        // {
        //     var actual_key = aliases_keys[k];
        //     var connected_aliases = data.Aliases[actual_key];
        //     if( typeof(lookup.Aliases[actual_key]) === 'undefined')
        //     {
        //         lookup.Aliases[actual_key] = {};
        //     }
        //     // just in case if there are some aliases already
        //     Object.getOwnPropertyNames(connected_aliases).forEach(element => {
        //         lookup.Aliases[actual_key][element] = true;
        //     });
        // }
    };
lookup.regenerate_Aliases = function()
    {
        // backend-worker context
        lookup.define_Aliases_if_needed();
        lookup.reply_from_backend_worker('saveAliasesToStorage.event', lookup.Aliases);
    };
lookup.define_Aliases_if_needed = function() {
    // backend-worker context
    if (typeof (lookup.Aliases) === 'undefined') {
        // [2022-01-08] in future here can be added some spelling mistakes and some pronunciation mistakes
        // for example: monthes <-> months // this mistake occured with me some times
        lookup.Aliases = {
            'example': {
                'examples': true
            },
            'month': {
                'months': true
            },
            'monthes': {
                'months': true
            }
        };
    }
};
lookup.add_Alias = function(left, right)
{
    // backend-worker context
    if( typeof(lookup.Aliases[left]) === 'undefined')
    {
        lookup.Aliases[left] = {};
    }
    lookup.Aliases[left][right] = true;
};
lookup.remove_Alias = function(left, right)
{
    // backend-worker context
    if( typeof(lookup.Aliases[left]) === 'undefined')
    {
        lookup.Aliases[left] = {};
    }
    lookup.Aliases[left][right] = false;
};
lookup.globalOffsetY = ko.observable(0);
lookup.globalOffsetX = ko.observable(0);
lookup.globalMaxY = ko.observable(800);
lookup.globalMinY = ko.observable(800);
lookup.globalScreenHeight = ko.observable(800);

lookup.first_to_render_note_data_stringified = undefined;
lookup.first_to_render_note_globalBottom = 0;

lookup.resetGlobalOffsetY = function()
{
    lookup.globalOffsetY(0);
};

lookup.update_global_scroll_limits = function()
{
    var length = lookup.LimitedFilteredOperations().length;
    var total_scrollable_height = 0;
    if(length > 0)
    {
        var obj_last = lookup.LimitedFilteredOperations()[length - 1];
        total_scrollable_height = obj_last.bottom();
        
        total_scrollable_height += obj_last.offsetHeight();
        
    }
    lookup.globalScreenHeight(window.innerHeight);

    lookup.globalMaxY(-total_scrollable_height + window.innerHeight * 0.05);
    lookup.globalMinY(window.innerHeight * 0.6);
    
    //console.log("height scroll limits:", lookup.globalMinY(), lookup.globalMaxY());
};





lookup.actions = 
{
    NoteUpdated: 'NoteUpdated',
    ConnectionUpdated: 'ConnectionUpdated',
    NoteAdded: 'NoteAdded',
    NoteDeleted: 'NoteDeleted',
    ConnectionAdded: 'ConnectionAdded',
    ConnectionDeleted: 'ConnectionDeleted',
    PositionsUpdated: 'PositionsUpdated',
    HealthCheckRequest: 'HealthCheckRequest',
    HealthCheckIdsProposal: 'HealthCheckIdsProposal'

};

lookup.hashCards = {};

lookup.populateColorPresets();

lookup.CurrentResultLimit = ko.observable(45);


// in Operations fisrt ones are the oldest one, or at least they will be after first save
lookup.Operations = ko.observableArray([]);

lookup
    .Operations
    .extend(
        { 
            rateLimit: 500 
        }
    )
    .subscribe(
        on_operations_changed,
        null, 
        "arrayChange"
    );

    lookup.Operations_And_Options = ko.pureComputed(
        function()
        {
            const show_demo_notes = lookup.option_show_help_demo_notes();
            const use_Japanese_tokeniser = lookup.option_use_Japanese_tokeniser(); // fictional use of option to refresh observable on change of the option
            if(lookup.Operations().length == 0 || show_demo_notes)
            {
                var demo_operations = ko.utils.arrayMap(
                    lookup.demo_notes_en,
                    function(item)
                    {
                        return new lookup.model_Operation(item);
                    }
                );
                var combined_result = [].concat(demo_operations, lookup.Operations());
                return combined_result;
            }
            if (use_Japanese_tokeniser)
            {
                var combined_result = [].concat([new lookup.model_Operation(lookup.empty_note)], lookup.Operations()); // combining with empty note, hope it will refresh set
                return combined_result;
            }
            
            return lookup.Operations();
        }
    );

    

    lookup.FilteredOperations = ko.pureComputed
        (
            function()
            {                
                var search_query = lookup.SearchNotesQuery().trim().toLowerCase();
                var operationsToWorkWith = lookup.Operations_And_Options();
                if(search_query.length === 0)
                {
                    return operationsToWorkWith;
                }
                else
                {
                    const first_jump = lookup.find_aliases(search_query);
                    const second_jump = first_jump.flatMap(first => lookup.find_aliases(first));
                    // [2022-01-09] Aliases should search only by backward-index (from word to note)
                    // [2022-01-09] if search query matches any present word then it should search by word-backward-index
                    var aliases = [].concat([search_query], first_jump, second_jump)
                        .filter(query => query.length > 0);
                    var reduced = aliases.reduce((ac, elem) => { ac[elem] = true; return ac;}, {});
                    aliases = Object.getOwnPropertyNames(reduced);
                    console.log(aliases);
                    // classic search approach
                    const filtered_operations = ko.utils.arrayFilter
                    (
                        operationsToWorkWith,
                        function(item, index)
                        {
                            if(item.name === 'create')
                            {
                                var searchResult =  aliases.some( query => item.data.text.toLowerCase().indexOf(query) >= 0);
                                return searchResult;
                            }
                            else
                            {
                                if(item.name === 'quote' || item.name === 'quote-edit')
                                {
                                    var searchResult1 = aliases.some( query => item.data.quoted.text.toLowerCase().indexOf(query) >= 0);
                                    var searchResult2 = aliases.some( query => item.data.current.text.toLowerCase().indexOf(query) >= 0);
                                    return searchResult1 || searchResult2;
                                }
                                else
                                {
                                    return false;
                                }
                            }
                        }
                    );
                    return filtered_operations;
                }
            }
        );

    lookup.FilteredOperations
        .subscribe(function(changes)
            {
              reply('FilteredCards.length.changed', lookup.FilteredOperations().length);
            });
    
    lookup.LimitedFilteredOperations = ko.pureComputed(function()
            {
                var startIndex = lookup.FilteredOperations().length - lookup.CurrentResultLimit()
                if(startIndex < 0)
                {
                    startIndex = 0;
                }
                return lookup.FilteredOperations().slice(startIndex);
            });

    lookup.NumberOfHiddenOperations = ko.pureComputed(function()
    {
        return lookup.FilteredOperations().length - lookup.LimitedFilteredOperations().length;
    });

    lookup.NumberOfHiddenOperations
        .subscribe(function(changes)
            {
                reply('NumberOfHiddenOperations.changed', lookup.NumberOfHiddenOperations());
            });

    lookup.LimitedFilteredOperations
        .subscribe(function(changes)
            {
                console.log('LimitedFilteredOperations changed');
                var toProcess = lookup.LimitedFilteredOperations();
                var toSend = ko.utils.arrayMap(toProcess, function(item) {
                    return item.ConvertToJs();
                });
                reply('LimitedFilteredOperations.changed.event', toSend);

            });

    lookup.ResetCurrentResultLimit = function()
    {
        lookup.CurrentResultLimit(45);
    };

    lookup.ExtendAmountForCurrentResultLimit = 45;


    lookup.ExtendCurrentResultLimit = function()
    {
        lookup.CurrentResultLimit(lookup.CurrentResultLimit() + lookup.ExtendAmountForCurrentResultLimit);
    };

    lookup.SetCurrentResultLimit = function(value)
    {
        lookup.CurrentResultLimit(value);
    };

    lookup.CurrentResultLimit
        .subscribe(function(changes)
            {
                reply('CurrentResultLimit.changed', lookup.CurrentResultLimit());
            });



function on_operations_changed(changes)
{
    if (changes && changes.length > 0) {
        var addedChanges = ko.utils.arrayFilter
            (
                changes, 
                function (item) 
                {
                    return item.status == "added"
                }
            );

        if (addedChanges && addedChanges.length > 0) {
            var toStoreOperations = ko.utils.arrayMap
            (
                lookup.Operations(), 
                function (item) {
                return item.ConvertToJs()
                }
            );

            toStoreOperations = toStoreOperations
                .sort(
                    function (left, right) {
                        if (left.time === right.time) {
                            return 0;
                        }

                        else {
                            if (left.time < right.time) {
                                return -1;
                            }

                            else {
                                return 1;
                            }
                        }
                    }
                );


            reply('saveOperationsToStorage.event', toStoreOperations);
        }
    }
};


// system functions

function defaultReply(message) {
  // your default PUBLIC function executed only when main page calls the queryableWorker.postMessage() method directly
  // do something
}

function reply() {
  if (arguments.length < 1) { throw new TypeError('reply - not enough arguments'); return; }
  postMessage({ 'queryMethodListener': arguments[0], 'queryMethodArguments': Array.prototype.slice.call(arguments, 1) });
}

lookup.reply_from_backend_worker = reply;

onmessage = function(oEvent) {
  if (oEvent.data instanceof Object && oEvent.data.hasOwnProperty('queryMethod') && oEvent.data.hasOwnProperty('queryMethodArguments')) {
    lookup[oEvent.data.queryMethod].apply(self, oEvent.data.queryMethodArguments);
    reply(oEvent.data.queryMethod + '.finished');
  } else {
    defaultReply(oEvent.data);
  }
};

function model_Card(data)
{
    var self = this;
    self.Note = data.Note;
    self.isRoot = typeof(data.connections_incoming) === 'undefined';
    self.hasTags = typeof(data.connections_outgoing) !== 'undefined';
    self.Tags = ko.observableArray([]);
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
        var result = self.AnalyzeText(self.Note.text(), query);
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
                        self.AnalyzeText(item.label(), query) ||
                        self.AnalyzeText(item.Destination.text(), query)
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
                        self.AnalyzeText(item.Source.text(), query);
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

    self.switchDone = function()
    {
        event.stopPropagation();
        self.Note.switchDone();
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
        var foundTaskTag = ko.utils.arrayFirst(self.SmallTags(), function(item){
            return item.Destination.text().toLowerCase().trim() === "task";
        });
        return  typeof(foundTaskTag) !== 'undefined';
    });

    self.convertFromTask = function()
    {
        var foundTaskTags = 
        ko.utils.arrayFilter(self.SmallTags(),
            function(item)
            {
                return item.Destination.text().toLowerCase().trim() === "task";
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
        lookup.AddInformationToExistingOne(self, "task");
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
}
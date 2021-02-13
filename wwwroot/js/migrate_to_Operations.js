
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

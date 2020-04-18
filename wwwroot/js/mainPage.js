

function ConnectedNotesViewModel()
{
    var self = this;
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

    lookup.defineLocalStorage();

    
    lookup.freeLocalIndex = 0;
    lookup.localPrefix = '_local_';

    lookup.hashCards = {};

    

    lookup.crypto_worker = undefined;
    
    lookup.crypto_worker = new Worker("js/worker-crypto.js");

    

    lookup.publicCryptoKey = ko.observable(undefined);

    lookup.SyncOptionsVisible = ko.observable(false);

    lookup.OpenSyncOptions = function() 
    {
        lookup.SyncOptionsVisible(true);
    };
    
    lookup.HideSyncOptions = function() 
    {
        lookup.SyncOptionsVisible(false);
    };

    lookup.PromoVisible = ko.observable(false);

    lookup.HidePromo = function() 
    {
        lookup.PromoVisible(false);
        lookup.localStorage.setItem("PromoVisible", JSON.stringify(false));
    };

    lookup.ShowPromo = function() 
    {
        lookup.PromoVisible(true);
        lookup.localStorage.setItem("PromoVisible", JSON.stringify(true));
    };

    var color_presets = [ 
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
    ];

    lookup.data_color_presets = color_presets;

    // populate colors immediately
    var toAddColors = ko.utils.arrayMap(color_presets, function(elem) 
    {
        var toReturn = new model_ColorPreset(elem);
        return toReturn;
    });

    ko.utils.arrayPushAll(lookup.ColorPresets, toAddColors);

    lookup.SwitchEditOfCard = function(card){
        card.underEdit(!card.underEdit());
    };

    lookup.ColorNode = function(colorToApply) {
        
        var toWorkWith = lookup.NoteToEdit();
        
        
        toWorkWith.color = colorToApply.Color();
        toWorkWith.background = colorToApply.Background();

        var info = toWorkWith.ConvertToJs();
        lookup.pushToHistory({
            action: lookup.actions.NoteUpdated,
            data: info
        });
    };

    lookup.ColorNodeFromCode = function(colorToApply, toWorkWith) {
                
        toWorkWith.color = colorToApply.Color();
        toWorkWith.background = colorToApply.Background();

        var info = toWorkWith.ConvertToJs();
        lookup.pushToHistory({
            action: lookup.actions.NoteUpdated,
            data: info
        });
    };

    lookup.CheckIfEveryNodeHasMigratedColor = function()
    {
            ko.utils.arrayForEach(lookup.Notes(), function(item) {
                lookup.MigrationOfColorOfNode(item);
            });
    };

    lookup.composedCards = ko.observableArray([]);

    lookup.populate = function(data) {
        lookup.for_code_access_hash_of_color_presets = {};
        lookup.data_color_presets.forEach(element => {
            lookup.for_code_access_hash_of_color_presets[element.color] = true;
        });
        var toAdd = ko.utils.arrayMap(data.notes, function(elem) 
        {
            var noteToAdd = lookup.Instanciate_model_node(elem);
            lookup.hashCards[noteToAdd.id] = new model_Card({ Note: noteToAdd});
            return noteToAdd;
        });
        ko.utils.arrayPushAll(lookup.Notes, toAdd);

        var connectionsToAdd = ko.utils.arrayMap(data.connections, function(elem) {
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

            return connectionToAdd;
        });
        ko.utils.arrayPushAll(lookup.Connections, connectionsToAdd);
        for(var key in lookup.hashCards)
        {
            lookup.composedCards.push(lookup.hashCards[key]);
        }

        lookup.CheckIfEveryNodeHasMigratedColor();
        lookup.migrateConnectionToNode();

        
        
    };

    

    

    lookup.saveTrustedPublicKeys = function() {
        lookup.localStorage.setItem("TrustedPublicKeysToSendTo", JSON.stringify(lookup.TrustedPublicKeysToSendTo()));
    };

    lookup.GenerateConnectionIsA = function(A, Z)
    {
        //   A    Z         R
        // X is Y is D => X is D
        if(A.label() == "is a")
        {
            if(A.DestinationId == Z.SourceId)
            {
                if(Z.label() == "is a")
                {
                    var from = lookup.findNodeById(A.SourceId);
                    var to = lookup.findNodeById(Z.DestinationId);
                    if(from != null && to != null)
                    {
                        lookup.ConnectNotes(from, to, "is a", true);
                    }
                    


                }
            }
        }

    };

    lookup.GenerateConnectionHasProperty = function(A, Z)
    {
        //   A    Z         R
        // X is Y is D => X is D
        if(A.label() == "is a")
        {
            if(A.DestinationId == Z.SourceId)
            {
                if(Z.label() == "has property")
                {
                    var from = lookup.findNodeById(A.SourceId);
                    var to = lookup.findNodeById(Z.DestinationId);
                    if(from != null && to != null)
                    {
                        lookup.ConnectNotes(from, to, "has property", true);
                    }
                    


                }
            }
        }

    };

    lookup.GenerateConnectionHasPart = function(A, Z)
    {
        //   A    Z         R
        // X is Y is D => X is D
        if(A.label() == "is a")
        {
            if(A.DestinationId == Z.SourceId)
            {
                if(Z.label() == "has part")
                {
                    var from = lookup.findNodeById(A.SourceId);
                    var to = lookup.findNodeById(Z.DestinationId);
                    if(from != null && to != null)
                    {
                        lookup.ConnectNotes(from, to, "has part", true);
                    }
                    


                }
            }
        }

    };

    lookup.ActualGenerateConnections = function()
    {
        ko.utils.arrayForEach(
            lookup.Connections(), 
            function(itemA, indexA)
                { 
                    ko.utils.arrayForEach(
                        lookup.Connections(), 
                        function(itemB, indexB)
                            { 
                                if(indexA !== indexB)
                                {
                                    lookup.GenerateConnectionIsA(itemA, itemB);
                                    lookup.GenerateConnectionHasProperty(itemA, itemB);
                                    lookup.GenerateConnectionHasPart(itemA, itemB);
                                }
                            } 
                        );
                } 
            );
        setTimeout(lookup.ActualGenerateConnections, 3000);
    };



    lookup
        .history
        .extend(
            { 
                rateLimit: 500 
            }
        )
        .subscribe(
            function(changes) {
                if(changes && changes.length > 0)
                {

                    var addedChanges = ko.utils.arrayFilter(changes, function(item){ 
                            return item.status == "added";
                        } 
                    );

                    if(addedChanges && addedChanges.length > 0 ) {

                        var toStoreNotes = ko.utils.arrayMap(lookup.Notes(), function(item) {
                            return item.ConvertToJs();
                        });
                        var toStoreConnections = ko.utils.arrayMap(lookup.Connections(), function(item) {
                            return item.ConvertToJs();
                        });
                       
                        
                        lookup.localStorage.setItem("Notes", JSON.stringify(toStoreNotes));
                        lookup.localStorage.setItem("Connections", JSON.stringify(toStoreConnections));
                        lookup.localStorage.setItem("localFreeIndex", JSON.stringify(lookup.freeLocalIndex));
                        lookup.localStorage.setItem("viewPosition", JSON.stringify({}))

                        var filteredChanges = ko.utils.arrayFilter(addedChanges, function(item){ 
                                return item.value.action != lookup.actions.PositionsUpdated 
                                    && item.value.action != ""
                                    && !item.value.isFromOuterSpace;
                            } 
                        );

                        console.log("before filter: " + filteredChanges.length);

                         // filter changes here by same id
                         var filter = {};
                         // if foreach is sequential filter will keep latest index available for id
                         ko.utils.arrayForEach(filteredChanges,
                             function(item, index)
                             {
                                 if(item.value.data && item.value.data.id)
                                 {
                                     filter[item.value.action + item.value.data.id] = index;
                                 }
                             }
                         );
                         // therefore need to keep only latest item with same id, because there is rateLimit not all values will be published to other devices
                         filteredChanges = ko.utils.arrayFilter(filteredChanges,
                             function(item, index)
                             {
                                 if(item.value.data && item.value.data.id)
                                 {
                                     return filter[item.value.action + item.value.data.id] == index;
                                 }
                             }
                         );

                         console.log("after filter: " + filteredChanges.length);



                        var messagesToAdd = ko.utils.arrayMap(filteredChanges, function(item) {
                            return item.value;
                        });

                        ko.utils.arrayForEach(lookup.TrustedPublicKeysToSendTo(), function(item) {
                            item.messagesPrepared = item.messagesPrepared.concat(messagesToAdd);
                        });

                        lookup.saveTrustedPublicKeys();
                        lookup.history.removeAll();
                    

                    }
                }
            }
            ,null
            ,"arrayChange"
        );


    lookup.getLocalIndex = function() {
        return ( lookup.localPrefix + (lookup.freeLocalIndex++) );
    };

    
    
    lookup.sortedByDateCards = ko.pureComputed(function()
    {
        return lookup
            .composedCards()
            .sort(
                function(left, right)
                {
                    if(left.Note.createDate === right.Note.createDate)
                    {
                        return 0;
                    }
                    else
                    {
                        if(left.Note.createDate < right.Note.createDate)
                        {
                            return 1;
                        }
                        else
                        {
                            return -1;
                        }
                    }
                }
            );
    });

    lookup.searchBarPosition = ko.pureComputed(function()
    {
        return lookup.sortedByDateCards().length === 0 ? "45%" : "0%" ;
    });

    // the idea is that cards without tags should not be displayed unless they are root
    lookup.filteredOutLeafs = ko.pureComputed(
        function()
        {
            return ko.utils.arrayFilter
            (
                lookup.sortedByDateCards(),
                function(item, index)
                {
                    if(item.Tags().length == 0 && item.Note.text().length < 20)
                    {
                        return !item.Note.isReferenced();
                    }
                    else
                    {
                        return true;
                    }
                }


            );

        }
    );
    lookup.FilteredCards = ko.pureComputed(function() {
        return ko.utils.arrayFilter
        (
            lookup.filteredOutLeafs(), 
            function(item, index)
                { 
                    var resultOfSearchQuery = true;
                    if(lookup.SearchNotesQuery() && lookup.SearchNotesQuery().trim().length > 0)
                    {
                        resultOfSearchQuery = item.IsForSearchResult(lookup.SearchNotesQuery().trim().toLowerCase())
                    }
                    if(lookup.stackOfSearch().length > 0)
                    {
                        var stackResult = lookup.stackOfSearch().every( function (searchItem) 
                        {
                            var result = item.IsForSearchResult(searchItem);
                            return result;

                        });
                        resultOfSearchQuery = resultOfSearchQuery && stackResult;

                    }
                    return resultOfSearchQuery;
                    
                    
                }
        );
    });

    lookup.FilteredCards
        .extend({ rateLimit: 500 });

    lookup.CurrentResultLimit = ko.observable(25);

    lookup.ResetCurrentResultLimit = function()
    {
        lookup.CurrentResultLimit(25);
    };

    lookup.LimitedFilteredCards = ko.pureComputed(function()
    {
        return lookup.FilteredCards().slice(0, lookup.CurrentResultLimit());
    });

    lookup.mergedOpenedAndFilteredCards = ko.pureComputed(function()
    {
        if(lookup.stackOfCards().length > 0)
        {
            var toWorkWith = lookup.stackOfCards();
            var parent = null;
            for(var k in toWorkWith)
            {
                var x = toWorkWith[k];
                var foundIndex = lookup.LimitedFilteredCards().indexOf(x);
                if(foundIndex >= 0)
                {
                    parent = x;
                }
            }

            if(parent !== null)
            {
                var indexInStack = lookup.stackOfCards.indexOf(parent);
                var indexInFiltered = lookup.LimitedFilteredCards().indexOf(parent);
                var left = lookup.LimitedFilteredCards().slice(0, indexInFiltered);
                var right = lookup.LimitedFilteredCards().slice(indexInFiltered);
                var middle = lookup.stackOfCards().slice(indexInStack + 1).reverse();
                return left.concat(middle, right);

            }
            else
            {
                return lookup.stackOfCards().concat(lookup.LimitedFilteredCards());
            }

        }
        else
        {
            return lookup.LimitedFilteredCards();
        }
    });

    lookup.cardsByColumns = ko.pureComputed(
        function()
        {
            var columnsCount = lookup.columnsCount();
            if(typeof(columnsCount) === "undefined" || columnsCount === 1 )
            {
               columnsCount = 1;
            }
            var result = [];
            for(var k = 0; k < columnsCount; k++)
            {
                result.push([]);
            }
            ko.utils.arrayForEach(lookup.mergedOpenedAndFilteredCards(), function(item, index) {
                var dividedIndex = index % columnsCount;
                result[dividedIndex].push(item);
            });
            return result;

        }
    );

    lookup.ShowExtendCurrentResultLimit = ko.pureComputed(function()
    {
        return lookup.FilteredCards().length > lookup.CurrentResultLimit();
    });

    lookup.NumberOfHiddenSearhItems = ko.pureComputed(function()
    {
        return lookup.FilteredCards().length - lookup.CurrentResultLimit();
    });


    lookup.ExtendCurrentResultLimit = function()
    {
        lookup.CurrentResultLimit(lookup.CurrentResultLimit() + 15);
    };

    lookup.SendMessage = function(item) {
        lookup.crypto_worker.postMessage({
            action: 'encrypt'
            , PlainText: unescape(encodeURIComponent(item.message))
            , ReceiverPublicKey: item.receiver
            , Id: 1
        });
        

    };

    lookup.DecryptMessage = function(item) {
        lookup.crypto_worker.postMessage(
            {
                action: 'decrypt'
                , CipherText: item
            });
        

    };

    lookup.ActualSendMessage = function(receiver, text, id) {
        if(navigator.onLine)
        {
            $.ajax({
                type: "POST",
                url: "Home/SendMessages",
                data: {
                    messages: [
                        {
                            Receiver: receiver,
                            Text: text
                        }
                    ],
                    senderPublicKey: lookup.publicCryptoKey()
                },
                success: function() {
                },
                error: function() {
                    console.log("SendMessages error");
                },
                dataType: "json"
            });
        }
        

    };

    lookup.ReceiveMessages = function(publicKey) {
        if(navigator.onLine)
        {
            $.ajax({
                type: "POST",
                url: "Home/ReceiveMessages",
                data: {
                    publicKey: publicKey
                },
                success: function(data) {
                    if(data && data.length > 0)
                    {
                        ko.utils.arrayForEach(data, function(item) {
                            lookup.DecryptMessage(item);
                        });
                    }
                    
                },
                error: function() {
                    console.log("ReceiveMessages error");
                },
                dataType: "json"
            });
        }

    };

    lookup.TokenToShare = ko.observable("");
    lookup.SynchronizationToken = ko.observable("");

    lookup.ConvertToLocalId = function(itemToSend) 
    {
        var ownPublicKey = lookup.publicCryptoKey();
        if(typeof(ownPublicKey) == "undefined" || ownPublicKey == null) 
        {
            return itemToSend;
        }
        var shrinkedOwnPublicKey = ownPublicKey.substring(0, 5) + '_' ;
       
                
                    

        if(typeof(itemToSend.data) !== "undefined")
        {
            var data = itemToSend.data;
            if(data.id)
            {
                if(data.id.startsWith(shrinkedOwnPublicKey))
                {
                    data.id = lookup.localPrefix + data.id.substring(shrinkedOwnPublicKey.length);
                }
            }
            if(typeof(data.SourceId) === "string")
            {
                if(data.SourceId.startsWith(shrinkedOwnPublicKey))
                {
                    data.SourceId = lookup.localPrefix + data.SourceId.substring(shrinkedOwnPublicKey.length);
                }
            }
            if(typeof(data.DestinationId) === "string")
            {
                if(data.DestinationId.startsWith(shrinkedOwnPublicKey))
                {
                    data.DestinationId = lookup.localPrefix + data.DestinationId.substring(shrinkedOwnPublicKey.length);
                }
            }
        }

        return itemToSend;
               

            
        
    };

    lookup.isOnLine = ko.observable(navigator.onLine);

    lookup.processMessages = function() {
        var ownPublicKey = lookup.publicCryptoKey();
        var shrinkedOwnPublicKey = ownPublicKey.substring(0, 5) + '_' ;
        if(navigator.onLine)
        {
            lookup.isOnLine(true);
            var messages = ko.utils.arrayMap
            (lookup.TrustedPublicKeysToSendTo(), function(item) 
                {
                    if(item.messagesPrepared && item.messagesPrepared.length > 0 ) 
                    {
                        var itemToSend = item.messagesPrepared.shift();
                        // hope message will not be lost

                        if(typeof(itemToSend.data) !== "undefined")
                        {
                            var data = itemToSend.data;
                            if(typeof(data.id) === "string")
                            {
                                if(data.id.startsWith(lookup.localPrefix))
                                {
                                    data.id = shrinkedOwnPublicKey + data.id.substring(lookup.localPrefix.length);
                                }
                            }
                            if(typeof(data.SourceId) === "string")
                            {
                                if(data.SourceId.startsWith(lookup.localPrefix))
                                {
                                    data.SourceId = shrinkedOwnPublicKey + data.SourceId.substring(lookup.localPrefix.length);
                                }
                            }
                            if(typeof(data.DestinationId) === "string")
                            {
                                if(data.DestinationId.startsWith(lookup.localPrefix))
                                {
                                    data.DestinationId = shrinkedOwnPublicKey + data.DestinationId.substring(lookup.localPrefix.length);
                                }
                            }
                        }

                        return {
                            receiver: item.publicKey,
                            message: JSON.stringify(itemToSend)
                        }
                    }
                    else 
                    {
                        return null;
                    }

                }
            );

            messages = ko.utils.arrayFilter(
                messages,
                function(item) 
                    {
                        return item != null;
                    }
                );
            if(messages && messages.length > 0) 
            {
                ko.utils.arrayForEach(messages, function(item) {
                    lookup.SendMessage(item);
                });
                lookup.saveTrustedPublicKeys();
            }

            lookup.ReceiveMessages(ownPublicKey);
            
        }
        else
        {
            lookup.isOnLine(false);
        }
        
        setTimeout(lookup.processMessages, 3000);
    };

    
    // No need to store publicCryptoKey in local storage because in order to receive and send messages we will need private key to be restored first
    lookup.publicCryptoKey.subscribe(function(changes) {
        lookup.StatisticsOnLoad();
        lookup.RemoveOwnPublicKeyFromTrusted();
        lookup.processMessages();

    });

    lookup.TrustedPublicKeysToSendTo = ko.observableArray([]);

    lookup.TrustedPublicKeysToSendTo.subscribe(function(changes) {
        if(changes && changes.length > 0)
        {
            $.each(changes, function(index, value) {
                if(value.status == "added") {
                    if(value.value.status == "awaitingInitialSnapshot")
                    {
                        var notesChanges = ko.utils.arrayMap(lookup.Notes(), function(elem) {
                            var result = {
                                action: lookup.actions.NoteAdded,
                                data: elem.ConvertToJs()
                            };
                            return result;
                        });

                        var connectionsChanges = ko.utils.arrayMap(lookup.Connections(), function(elem) {
                            var result = {
                                action: lookup.actions.ConnectionAdded,
                                data: elem.ConvertToJs()
                            };
                            return result;
                        });

                        if(!value.value.messagesPrepared ) {
                            value.value.messagesPrepared = [];
                        }
                        value.value.messagesPrepared = value.value.messagesPrepared.concat(notesChanges);
                        value.value.messagesPrepared = value.value.messagesPrepared.concat(connectionsChanges);

                        value.value.status = 'readyToTrackHistory';
                    }
                }
            });
            lookup.saveTrustedPublicKeys();
        }
    }, null, "arrayChange");

    lookup.ReceivedPublicKey = ko.observable("");

    
    
    


    lookup.GetOneTimeSynchronizationToken = function() {
        lookup.OpenTokenConsumptionMenu(false);
        lookup.OpenTokenGenerationMenu(true);
        lookup.TokenToShare("");
        if(navigator.onLine)
        {
            $.ajax({
                type: "POST",
                url: "Home/GetOneTimeSynchronizationToken",
                data: {
                    publicKey: lookup.publicCryptoKey()
                },
                success: function(data){
                    lookup.TokenToShare(data);
                },
                dataType: "json"
            });
        }
        

    };

    lookup.StatisticsOnLoad = function() {
        if(navigator.onLine)
        {
            $.ajax({
                type: "POST",
                url: "Home/StatisticsOnLoad",
                data: {
                    publicKey: lookup.publicCryptoKey()
                },
                success: function(data){
                },
                dataType: "json"
            });
        }
        

    };


    lookup.SynchronizeUsingToken = function() {
        if(navigator.onLine)
        {
            $.ajax({
                type: "POST",
                url: "Home/GetSyncPublicKey",
                data: {
                    token: lookup.SynchronizationToken().trim()
                },
                success: function(data){
                    lookup.ReceivedPublicKey(data);
                },
                dataType: "json"
            });
        }
        

    };

    lookup.findPublicKey = function(key) 
    {
        var filtered = ko.utils.arrayFilter(lookup.TrustedPublicKeysToSendTo(), function(item){ return item.publicKey == key;} );
        var foundMaybe = filtered.length > 0 ? filtered[0] : null;
        return foundMaybe;

    };

    lookup.AddPublicKeyToTrusted = function(keyToAdd) {
        
        var foundMaybe = lookup.findPublicKey(keyToAdd);
        if(foundMaybe == null) {
            var toPush = {
                status: "awaitingInitialSnapshot",
                publicKey: keyToAdd
            };
            lookup.TrustedPublicKeysToSendTo.push(toPush);
        }
    };

    lookup.RemoveOwnPublicKeyFromTrusted = function()
    {
        var foundMaybe = lookup.findPublicKey(lookup.publicCryptoKey());
        if(foundMaybe != null)
        {
            lookup.TrustedPublicKeysToSendTo.remove(foundMaybe);
        }
    };

    lookup.AddReceivedPublicKeyToTrusted = function() {
        lookup.AddPublicKeyToTrusted(lookup.ReceivedPublicKey());
        lookup.ReceivedPublicKey("");
        lookup.SynchronizationToken("");
    };

    
    lookup.AddNoteToExistingOne = function(existing) {
        var extraText = existing.AdditionalInformationText();
        if(typeof(extraText) !== "undefined")
        {
            extraText = extraText.trim();
        }
        else
        {
            extraText = "";
        }
        // block adding of extra information if it is empty
        if(extraText.length !== 0)
        {
            var obj = {
                text: extraText,
                textColor: existing.AdditionalInformationTextColor()
            };
            lookup.CreateNote(obj, function(destination) { 
                lookup.ConnectNotes(existing.Note, destination);  
                existing.AdditionalInformationText("");
                existing.AdditionalInformationTextColor(lookup.GetRandomColor().Color());
            });
        }
        
    };

    lookup.AddInformationToExistingOne = function(existing, information) {
        
        // block adding of extra information if it is empty
        if(typeof(information) !== 'undefined')
        {
            information = information.trim();
            if(information.length !== 0)
            {
                var obj = {
                    text: information,
                    textColor: lookup.GetRandomColor().Color()
                };
                lookup.CreateNote(obj, function(destination) { 
                    lookup.ConnectNotes(existing.Note, destination);  
                });
            }

        } 
        
    };


    lookup.privateCryptoPair = {};

    if(typeof(Worker) == "undefined") {
        console.log("Failed to find Worker.");
    }
    if(!lookup.localStorage) {
        console.log("Local web-storage is unavailable.");
    }

    
    if(lookup.localStorage["Notes"]){
        var data = {};
        data.notes = JSON.parse(lookup.localStorage.getItem("Notes"));
        data.connections = JSON.parse(lookup.localStorage.getItem("Connections"));
        lookup.populate(data);
    }
    if(lookup.localStorage["privateCryptoPair"]){
        lookup.privateCryptoPair = JSON.parse(lookup.localStorage.getItem("privateCryptoPair"));
    }
    
    if(lookup.localStorage["localFreeIndex"]) {
        lookup.freeLocalIndex = JSON.parse(lookup.localStorage.getItem("localFreeIndex"));
    }
    else {
        lookup.freeLocalIndex = lookup.Notes().length + lookup.Connections().length + 1;
    }

    if(lookup.localStorage["viewPosition"])
    {
         var parsedViewPosition = JSON.parse(lookup.localStorage.getItem("viewPosition"));
    }
    if(typeof(lookup.localStorage["PromoVisible"]) != "undefined")
    {
        lookup.PromoVisible(JSON.parse(lookup.localStorage.getItem("PromoVisible")) );
    }

    if(localStorage["TrustedPublicKeysToSendTo"]){ 
        lookup.TrustedPublicKeysToSendTo(JSON.parse(lookup.localStorage.getItem("TrustedPublicKeysToSendTo")));
        if(
            lookup.TrustedPublicKeysToSendTo().length > 0 
            && typeof(lookup.TrustedPublicKeysToSendTo()[0].status) == "undefined"
        )
        {
            var toAdd = ko.utils.arrayMap(lookup.TrustedPublicKeysToSendTo(), function(elem) {
                var result = {
                    status: "awaitingInitialSnapshot",
                    
                    publicKey: elem
                };
                return result;
            });
            lookup.TrustedPublicKeysToSendTo(toAdd);
            lookup.saveTrustedPublicKeys();
        }
    }

    lookup.backgroundApplySaved();

    
    lookup.crypto_worker.onmessage = function(e) {
        if(e.data.action == "applySaveOfKey.Result" ) {
            if(typeof(lookup.privateCryptoPair.n) == "undefined") {
                lookup.localStorage.setItem("privateCryptoPair", JSON.stringify(e.data.data));
            }
            lookup.crypto_worker.postMessage({action: 'getPublicKey', data: lookup.privateCryptoPair});
        }
        if(e.data.action == "getPublicKey.Result") {
            var keyToUse = e.data.data;
            if(
                !lookup.publicCryptoKey() 
                || lookup.publicCryptoKey() == null 
                || typeof(lookup.publicCryptoKey()) == "undefined" 
            )
            {
                // will see maybe 10 MB is enough 
                // lookup.AddPublicKeyToTrusted(keyToUse); // we need to keep history for our self in order to store everything not only on local machine but on server also
                // because local storage is limited to 10 MB
                lookup.publicCryptoKey(keyToUse);
            }
            
            // start receiving outer world changes from here via timer
            
        }
        if(e.data.action == "encrypt.Result") {
            lookup.ActualSendMessage(e.data.receiverPublicKey, e.data.encryptedText.cipher, e.data.id);   
        }
        if(e.data.action == "decrypt.Result") {
            var decrypted = e.data.decryptionResult;
            var publicKeyOfSender = decrypted.publicKeyString;
            var foundMaybe = lookup.findPublicKey(publicKeyOfSender);
            if(foundMaybe == null)
            {
                lookup.ReceivedPublicKey(publicKeyOfSender);
            }
            
            // put public key to trusted -> ReceivedPublicKey
            var signatureStatus = decrypted.signature;

            var plainText = decodeURIComponent(escape(decrypted.plaintext));
            // console.log(publicKeyOfSender);
            // console.log(plainText);
            var actionReceived = JSON.parse(plainText);
            actionReceived.isFromOuterSpace = true;
            lookup.pushToHistory(actionReceived);

        }
    };

    lookup.crypto_worker.postMessage({action: 'applySaveOfKey', data: lookup.privateCryptoPair});
    

    lookup.connectFrom = ko.observable(null);
    lookup.previousConnectFrom = ko.observable(null);
    

    

    

    lookup.CreateNoteFromSearchQuery = function() {
        var obj = {
            text: lookup.SearchNotesQuery().trim()
            };
        lookup.CreateNote(obj, function(added)
            {
                console.log('create');
                lookup.SearchNotesQuery("");
                lookup.jumpToCardOnCreate(added);
                lookup.assign_labels_by_dictionary(added);
            }
        );
    };

    lookup.SelectPreviousFrom = function(data) {
        lookup.previousConnectFrom(data);
        lookup.ResetCurrentResultLimit();
        lookup.insertIntoStackOfCards(data);
    };
    lookup.ClearPreviousFrom = function() {
        lookup.previousConnectFrom(null);
    };

    lookup.ConnectPreviousWithCurrent = function(data) {
        // prevent self-selection, because self-loops are not allowed here
        if(lookup.previousConnectFrom() != data){
            lookup.ConnectNotes(lookup.previousConnectFrom().Note, data.Note );
            lookup.previousConnectFrom(null);
        }
    };

    

    lookup.OpenTokenConsumptionMenu = ko.observable(false);
    lookup.OpenTokenGenerationMenu = ko.observable(false);
    lookup.iHaveSyncToken = function()
    {
        lookup.OpenTokenConsumptionMenu(true);
        lookup.OpenTokenGenerationMenu(false);
    };

    

    

    

    


    self.ApplyLookupToSelf = function()
    {
        for(var x in lookup)
        {
            self[x] = lookup[x];
        }
    };

    

};


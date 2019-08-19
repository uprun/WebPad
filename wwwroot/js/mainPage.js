

function ConnectedNotesViewModel()
{
    var self = this;
    self.actions = 
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

    lookup.Notes = ko.observableArray([]);
    self.Notes = lookup.Notes;

    lookup.ColorPresets = ko.observableArray([]);
    self.ColorPresets = lookup.ColorPresets;

    lookup.Connections = ko.observableArray([]);
    self.Connections = lookup.Connections;

    lookup.crypto_worker = undefined;
    
    lookup.crypto_worker = new Worker("js/worker-crypto.js");

    lookup.history = ko.observableArray([]);

    self.history = lookup.history; 

    



    self.processMessageFromOuterSpace = function(item)
    {
        var current_action = item.action;
        var current_data = item.data;
        if(current_action == self.actions.NoteUpdated)
        {
            var found = lookup.findNodeById(current_data.id);
            if(found)
            {
                found.text(current_data.text);
                found.color = current_data.color;
                found.background = current_data.background;
                found.x = current_data.x;
                found.y = current_data.y;
            }
            else
            {
                var noteToAdd = new model_Node(current_data);
                lookup.Notes.push(noteToAdd);
            }
        }

        if(current_action == self.actions.ConnectionUpdated)
        {
            var found = lookup.findEdgeById(current_data.id);
            if(found)
            {
                found.label(current_data.label);
            }
            else
            {
                var connectionToAdd = 
                new model_Connection
                    (
                    current_data.id,
                    current_data.SourceId,
                    current_data.DestinationId,
                    current_data.label,
                    current_data.generated,
                    lookup.findNodeById
                    );
                lookup.Connections.push(connectionToAdd)
            }
        }

        if(current_action == self.actions.NoteAdded)
        {
            var found = lookup.findNodeById(current_data.id);
            if(!found)
            {
                var noteToAdd = new model_Node(current_data);
                lookup.Notes.push(noteToAdd);
            }
            else
            {
                if(!found.id.startsWith(lookup.localPrefix))
                {
                    found.text(current_data.text);
                }
            }
            
        }

        if(current_action == self.actions.NoteDeleted)
        {
            var found = lookup.findNodeById(current_data.id);
            if(found)
            {
                lookup.Notes.remove(found);
            }
        }

        if(current_action == self.actions.ConnectionAdded)
        {
            var found = lookup.findEdgeById(current_data.id);
            if(!found)
            {
                var connectionToAdd = 
                    new model_Connection
                    (
                        current_data.id,
                        current_data.SourceId,
                        current_data.DestinationId, 
                        current_data.label, 
                        current_data.generated,
                        lookup.findNodeById
                    );
                lookup.Connections.push(connectionToAdd)
            }
            else
            {
                if(!found.id.startsWith(lookup.localPrefix))
                {
                    found.label(current_data.label);
                }
            }
        }

        if(current_action == self.actions.ConnectionDeleted)
        {
            var found = lookup.findEdgeById(current_data.id);
            if(found)
            {
                lookup.Connections.remove(found);
            }
        }

        // if(current_action == self.actions.HealthCheckRequest)
        // {
        //     var toStoreNotes = ko.utils.arrayMap(lookup.Notes(), function(item) {
        //         return item.id;
        //     });
        //     var toStoreConnections = ko.utils.arrayMap(lookup.Connections(), function(item) {
        //         return item.id;
        //     });
        //     var all_available_ids = toStoreNotes.concat(toStoreConnections);
        //     var chunked_ids = all_available_ids.chunk(40);

        //     ko.utils.arrayForEach(chunked_ids, function(item, id) {
        //         self.pushToHistory({
        //             action: self.actions.HealthCheckIdsProposal,
        //             data: { 
        //                 checkedIndex: undefined,
        //                 publicKey: publicKey.publicKey 
        //             }
        //         });
        //     });


        // }
    };

    var color_presets = [ 
        { 
            background: "#ff5e00",
            color: "#000000" 
        },
        { 
            background: "#6a1b9a",
            color: "#ffffff" 
        },
        { 
            background: "#19bd11",
            color: "#000000" 
        },
        { 
            background: "#f8df00",
            color: "#000000" 
        }
    ];

    // populate colors immediately
    var toAddColors = ko.utils.arrayMap(color_presets, function(elem) 
    {
        var toReturn = new model_ColorPreset(elem);
        return toReturn;
    });

    ko.utils.arrayPushAll(lookup.ColorPresets, toAddColors);


    self.ColorNode = function(colorToApply) {
        
        var toWorkWith = self.NoteToEdit();
        
        
        toWorkWith.color = colorToApply.Color();
        toWorkWith.background = colorToApply.Background();

        var info = toWorkWith.ConvertToJs();
        self.pushToHistory({
            action: self.actions.NoteUpdated,
            data: info
        });
    };

    self.ColorNodeFromCode = function(colorToApply, toWorkWith) {
                
        toWorkWith.color = colorToApply.Color();
        toWorkWith.background = colorToApply.Background();

        var info = toWorkWith.ConvertToJs();
        self.pushToHistory({
            action: self.actions.NoteUpdated,
            data: info
        });
    };

    self.CheckIfEveryNodeHasColor = function()
    {
        var filtered = ko.utils.arrayFilter(
            lookup.Notes(),
            function(item) 
            {
                if(typeof(item.color) === "undefined" )
                {
                    return true;
                }
                return false;
            }
        );
        if(filtered.length > 0)
        {
            var colors =  lookup.ColorPresets();
            filtered = ko.utils.arrayFilter(filtered, function(item, index)
            {
                return index < 50;
            });

            ko.utils.arrayForEach(filtered, function(item) {
                var selectedColorIndex = Math.floor(Math.random() * colors.length);
                var selectedColor = colors[selectedColorIndex];
                self.ColorNodeFromCode(selectedColor, item);
            });
        }
    };

    self.colorFreeIndex = 0;

    self.populate = function(data) {
        var toAdd = ko.utils.arrayMap(data.notes, function(elem) 
        {
            var noteToAdd = new model_Node(elem);
            return noteToAdd;
        });
        ko.utils.arrayPushAll(lookup.Notes, toAdd);

        

        var connectionsToAdd = ko.utils.arrayMap(data.connections, function(elem) {
            var connectionToAdd = new model_Connection(elem.id, elem.SourceId, elem.DestinationId, elem.label, elem.generated, lookup.findNodeById);
            return connectionToAdd;
        });
        ko.utils.arrayPushAll(lookup.Connections, connectionsToAdd);
        

        //self.CheckIfEveryNodeHasColor();

        
        
    };

    self.processCallBacks = function(item)
    {
        
    };

    self.pushToHistory = function(item) {
        item = self.ConvertToLocalId(item);
        self.processMessageFromOuterSpace(item);
        item.historyIndex = lookup.freeLocalIndex++;
        self.processCallBacks(item);        
        lookup.history.push(item);
    };

    self.saveTrustedPublicKeys = function() {
        lookup.localStorage.setItem("TrustedPublicKeysToSendTo", JSON.stringify(self.TrustedPublicKeysToSendTo()));
    };

    self.GenerateConnectionIsA = function(A, Z)
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
                        self.ConnectNotes(from, to, "is a", true);
                    }
                    


                }
            }
        }

    };

    self.GenerateConnectionHasProperty = function(A, Z)
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
                        self.ConnectNotes(from, to, "has property", true);
                    }
                    


                }
            }
        }

    };

    self.GenerateConnectionHasPart = function(A, Z)
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
                        self.ConnectNotes(from, to, "has part", true);
                    }
                    


                }
            }
        }

    };

    self.ActualGenerateConnections = function()
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
                                    self.GenerateConnectionIsA(itemA, itemB);
                                    self.GenerateConnectionHasProperty(itemA, itemB);
                                    self.GenerateConnectionHasPart(itemA, itemB);
                                }
                            } 
                        );
                } 
            );
        setTimeout(self.ActualGenerateConnections, 3000);
    };



    self
        .history
        .extend(
            { 
                rateLimit: 3000 
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
                                return item.value.action != self.actions.PositionsUpdated 
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

                        ko.utils.arrayForEach(self.TrustedPublicKeysToSendTo(), function(item) {
                            item.messagesPrepared = item.messagesPrepared.concat(messagesToAdd);
                        });

                        self.saveTrustedPublicKeys();
                        lookup.history.removeAll();
                    

                    }
                }
            }
            ,null
            ,"arrayChange"
        );


    self.getLocalIndex = function() {
        return ( lookup.localPrefix + (lookup.freeLocalIndex++) );
    };

    self.SearchNotesQuery = ko.observable("");

    self.MaxSearchResults = ko.observable(4);

    self.FilteredNodes = ko.pureComputed(function() {
        return ko.utils.arrayFilter
        (
            lookup.Notes(), 
            function(item, index)
                { 
                    if(self.SearchNotesQuery() && self.SearchNotesQuery().trim().length > 0)
                    {
                        var result = item.text().toLowerCase().indexOf(self.SearchNotesQuery().trim().toLowerCase()) >= 0;
                        return result;
                    }
                    else
                    {
                        return false;
                    }
                    
                }
        );
    });

    self.FilteredNodesFirstElements = ko.pureComputed(function()
        {
            return self.FilteredNodes().slice(0, self.MaxSearchResults());
        });

    self.previousHighlighted = [];
    self.FilteredNodesFirstElements
        .extend(
            { 
                rateLimit: 1500 
            }
        )
        .subscribe(
            function(changes) {
                var addedChanges = ko.utils.arrayMap(changes, function(item){ 
                        return item.ConvertToJs();
                    } 
                );
                var hash = {};
                if(self.SearchNotesQuery().trim().length > 0)
                {

                    ko.utils.arrayForEach(addedChanges, function(item)
                        {
                            
                            hash[item.id] = true;
                        }
                    );

                }

                ko.utils.arrayForEach(self.previousHighlighted, function(item)
                    {
                        if(!hash[item.id])
                        {
                            
                        }
                    }
                );
                self.previousHighlighted = addedChanges.slice(0);

            }
        );
    
    self.focusOnNode = function(item)
    {
        
    };

    self.SendMessage = function(item) {
        lookup.crypto_worker.postMessage({
            action: 'encrypt'
            , PlainText: unescape(encodeURIComponent(item.message))
            , ReceiverPublicKey: item.receiver
            , Id: 1
        });
        

    };

    self.DecryptMessage = function(item) {
        lookup.crypto_worker.postMessage(
            {
                action: 'decrypt'
                , CipherText: item
            });
        

    };

    self.ActualSendMessage = function(receiver, text, id) {
        $.ajax({
            type: "POST",
            url: "SendMessages",
            data: {
                messages: [
                    {
                        Receiver: receiver,
                        Text: text
                    }
                ],
                senderPublicKey: self.publicCryptoKey()
            },
            success: function() {
            },
            error: function() {
                console.log("SendMessages error");
            },
            dataType: "json"
        });

    };

    self.ReceiveMessages = function(publicKey) {
        $.ajax({
            type: "POST",
            url: "ReceiveMessages",
            data: {
                publicKey: publicKey
            },
            success: function(data) {
                if(data && data.length > 0)
                {
                    ko.utils.arrayForEach(data, function(item) {
                        self.DecryptMessage(item);
                    });
                }
                
            },
            error: function() {
                console.log("ReceiveMessages error");
            },
            dataType: "json"
        });

    };

    self.TokenToShare = ko.observable("");
    self.SynchronizationToken = ko.observable("");

    self.ConvertToLocalId = function(itemToSend) 
    {
        var ownPublicKey = self.publicCryptoKey();
        if(typeof(ownPublicKey) == "undefined" || ownPublicKey == null) 
        {
            return itemToSend;
        }
        var shrinkedOwnPublicKey = ownPublicKey.substring(0, 5) + '_' ;
       
                
                    

        if(itemToSend.data)
        {
            var data = itemToSend.data;
            if(data.id)
            {
                if(data.id.startsWith(shrinkedOwnPublicKey))
                {
                    data.id = lookup.localPrefix + data.id.substring(shrinkedOwnPublicKey.length);
                }
            }
            if(data.SourceId)
            {
                if(data.SourceId.startsWith(shrinkedOwnPublicKey))
                {
                    data.SourceId = lookup.localPrefix + data.SourceId.substring(shrinkedOwnPublicKey.length);
                }
            }
            if(data.DestinationId)
            {
                if(data.DestinationId.startsWith(shrinkedOwnPublicKey))
                {
                    data.DestinationId = lookup.localPrefix + data.DestinationId.substring(shrinkedOwnPublicKey.length);
                }
            }
        }

        return itemToSend;
               

            
        
    };


    self.processMessages = function() {
        var ownPublicKey = self.publicCryptoKey();
        var shrinkedOwnPublicKey = ownPublicKey.substring(0, 5) + '_' ;
        var messages = ko.utils.arrayMap(self.TrustedPublicKeysToSendTo(), function(item) 
            {
                if(item.messagesPrepared && item.messagesPrepared.length > 0 ) 
                {
                    var itemToSend = item.messagesPrepared.shift();
                    // hope message will not be lost

                    if(itemToSend.data)
                    {
                        var data = itemToSend.data;
                        if(data.id)
                        {
                            if(data.id.startsWith(lookup.localPrefix))
                            {
                                data.id = shrinkedOwnPublicKey + data.id.substring(lookup.localPrefix.length);
                            }
                        }
                        if(data.SourceId)
                        {
                            if(data.SourceId.startsWith(lookup.localPrefix))
                            {
                                data.SourceId = shrinkedOwnPublicKey + data.SourceId.substring(lookup.localPrefix.length);
                            }
                        }
                        if(data.DestinationId)
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
                self.SendMessage(item);
            });
            self.saveTrustedPublicKeys();
        }
        var needToSavePublicKeys = false;
        ko.utils.arrayForEach(self.TrustedPublicKeysToSendTo(), function(publicKey) {
            var time_now = new Date();
            var conditionApplies = false;
            if(publicKey.lastTimeHealthChecked)
            {
                var hours_26_check_ms = 26 * 60 * 60 * 1000; // value of 26 hours in milliseconds
                
                var diff_ms = time_now - publicKey.lastTimeHealthChecked;
                if(diff_ms < 0 || diff_ms > hours_26_check_ms)
                {
                    conditionApplies = true;
                }
            }
            else
            {
                conditionApplies = true;
            }
            if(conditionApplies)
            {
                publicKey.lastTimeHealthChecked = time_now;
                needToSavePublicKeys = true;
                self.pushToHistory({
                    action: self.actions.HealthCheckRequest,
                    data: { 
                        checkedIndex: undefined,
                        publicKey: publicKey.publicKey 
                    }
                });
            }
        });
        
        if(needToSavePublicKeys)
        {
            self.saveTrustedPublicKeys();
        }

        self.TrustedPublicKeysToSendTo()

        self.ReceiveMessages(ownPublicKey);
        setTimeout(self.processMessages, 3000);
    };

    self.publicCryptoKey = ko.observable(undefined);
    // No need to store publicCryptoKey in local storage because in order to receive and send messages we will need private key to be restored first
    self.publicCryptoKey.subscribe(function(changes) {
        self.StatisticsOnLoad();
        self.RemoveOwnPublicKeyFromTrusted();
        self.processMessages();

    });

    self.TrustedPublicKeysToSendTo = ko.observableArray([]);

    self.TrustedPublicKeysToSendTo.subscribe(function(changes) {
        if(changes && changes.length > 0)
        {
            $.each(changes, function(index, value) {
                if(value.status == "added") {
                    if(value.value.status == "awaitingInitialSnapshot")
                    {
                        var notesChanges = ko.utils.arrayMap(lookup.Notes(), function(elem) {
                            var result = {
                                action: self.actions.NoteAdded,
                                data: elem.ConvertToJs()
                            };
                            return result;
                        });

                        var connectionsChanges = ko.utils.arrayMap(lookup.Connections(), function(elem) {
                            var result = {
                                action: self.actions.ConnectionAdded,
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
            self.saveTrustedPublicKeys();
        }
    }, null, "arrayChange");

    self.ReceivedPublicKey = ko.observable("");

    self.SyncOptionsVisible = ko.observable(false);
    self.OpenSyncOptions = function() 
    {
        self.SyncOptionsVisible(true);
    };
    self.HideSyncOptions = function() 
    {
        self.SyncOptionsVisible(false);
    };


    self.GetOneTimeSynchronizationToken = function() {
        self.TokenToShare("");
        $.ajax({
            type: "POST",
            url: "GetOneTimeSynchronizationToken",
            data: {
                publicKey: self.publicCryptoKey()
            },
            success: function(data){
                self.TokenToShare(data);
            },
            dataType: "json"
        });

    };

    self.StatisticsOnLoad = function() {
        $.ajax({
            type: "POST",
            url: "StatisticsOnLoad",
            data: {
                publicKey: self.publicCryptoKey()
            },
            success: function(data){
            },
            dataType: "json"
        });

    };


    self.SynchronizeUsingToken = function() {
        $.ajax({
            type: "POST",
            url: "GetSyncPublicKey",
            data: {
                token: self.SynchronizationToken().trim()
            },
            success: function(data){
                self.ReceivedPublicKey(data);
            },
            dataType: "json"
        });

    };

    self.findPublicKey = function(key) 
    {
        var filtered = ko.utils.arrayFilter(self.TrustedPublicKeysToSendTo(), function(item){ return item.publicKey == key;} );
        var foundMaybe = filtered.length > 0 ? filtered[0] : null;
        return foundMaybe;

    };

    self.AddPublicKeyToTrusted = function(keyToAdd) {
        
        var foundMaybe = self.findPublicKey(keyToAdd);
        if(foundMaybe == null) {
            var toPush = {
                status: "awaitingInitialSnapshot",
                publicKey: keyToAdd
            };
            self.TrustedPublicKeysToSendTo.push(toPush);
        }
    };

    self.RemoveOwnPublicKeyFromTrusted = function()
    {
        var foundMaybe = self.findPublicKey(self.publicCryptoKey());
        if(foundMaybe != null)
        {
            self.TrustedPublicKeysToSendTo.remove(foundMaybe);
        }
    };

    self.AddReceivedPublicKeyToTrusted = function() {
        self.AddPublicKeyToTrusted(self.ReceivedPublicKey());
        self.ReceivedPublicKey("");
        self.SynchronizationToken("");
    };

    
    self.CreateNoteFromDestinationSearchQuery = function() {
        var obj = {
            text: ""
            , x: self.connectFrom().x
            , y: self.connectFrom().y
        };
        self.CreateNote(obj, function(destination) { 
            self.ConnectNotes(self.connectFrom(), destination);  
            self.SelectNoteToEdit(destination.id);
        });
    };


    self.privateCryptoPair = {};

    if(typeof(Worker) == "undefined") {
        console.log("Failed to find Worker.");
    }
    if(!localStorage) {
        console.log("Local web-storage is unavailable.");
    }

    
    if(localStorage["Notes"]){
        var data = {};
        data.notes = JSON.parse(lookup.localStorage.getItem("Notes"));
        data.connections = JSON.parse(lookup.localStorage.getItem("Connections"));
        self.populate(data);
    }
    if(localStorage["privateCryptoPair"]){
        self.privateCryptoPair = JSON.parse(lookup.localStorage.getItem("privateCryptoPair"));
    }
    
    if(localStorage["localFreeIndex"]) {
        lookup.freeLocalIndex = JSON.parse(lookup.localStorage.getItem("localFreeIndex"));
    }
    else {
        lookup.freeLocalIndex = lookup.Notes().length + lookup.Connections().length + 1;
    }

    if(localStorage["viewPosition"])
    {
         var parsedViewPosition = JSON.parse(lookup.localStorage.getItem("viewPosition"));
    }

    if(localStorage["TrustedPublicKeysToSendTo"]){ 
        self.TrustedPublicKeysToSendTo(JSON.parse(lookup.localStorage.getItem("TrustedPublicKeysToSendTo")));
        if(
            self.TrustedPublicKeysToSendTo().length > 0 
            && typeof(self.TrustedPublicKeysToSendTo()[0].status) == "undefined"
        )
        {
            var toAdd = ko.utils.arrayMap(self.TrustedPublicKeysToSendTo(), function(elem) {
                var result = {
                    status: "awaitingInitialSnapshot",
                    
                    publicKey: elem
                };
                return result;
            });
            self.TrustedPublicKeysToSendTo(toAdd);
            self.saveTrustedPublicKeys();
        }
    }

    
    lookup.crypto_worker.onmessage = function(e) {
        if(e.data.action == "applySaveOfKey.Result" ) {
            if(typeof(self.privateCryptoPair.n) == "undefined") {
                lookup.localStorage.setItem("privateCryptoPair", JSON.stringify(e.data.data));
            }
            lookup.crypto_worker.postMessage({action: 'getPublicKey', data: self.privateCryptoPair});
        }
        if(e.data.action == "getPublicKey.Result") {
            var keyToUse = e.data.data;
            if(
                !self.publicCryptoKey() 
                || self.publicCryptoKey() == null 
                || typeof(self.publicCryptoKey()) == "undefined" 
            )
            {
                // will see maybe 10 MB is enough 
                // self.AddPublicKeyToTrusted(keyToUse); // we need to keep history for our self in order to store everything not only on local machine but on server also
                // because local storage is limited to 10 MB
                self.publicCryptoKey(keyToUse);
            }
            
            // start receiving outer world changes from here via timer
            
        }
        if(e.data.action == "encrypt.Result") {
            self.ActualSendMessage(e.data.receiverPublicKey, e.data.encryptedText.cipher, e.data.id);   
        }
        if(e.data.action == "decrypt.Result") {
            var decrypted = e.data.decryptionResult;
            var publicKeyOfSender = decrypted.publicKeyString;
            var foundMaybe = self.findPublicKey(publicKeyOfSender);
            if(foundMaybe == null)
            {
                self.ReceivedPublicKey(publicKeyOfSender);
            }
            
            // put public key to trusted -> ReceivedPublicKey
            var signatureStatus = decrypted.signature;

            var plainText = decodeURIComponent(escape(decrypted.plaintext));
            // console.log(publicKeyOfSender);
            // console.log(plainText);
            var actionReceived = JSON.parse(plainText);
            actionReceived.isFromOuterSpace = true;
            self.pushToHistory(actionReceived);

        }
    };

    lookup.crypto_worker.postMessage({action: 'applySaveOfKey', data: self.privateCryptoPair});
    

    self.connectFrom = ko.observable(null);
    self.previousConnectFrom = ko.observable(null);

    self.CreateNote = function(obj, callback) {

        var selectedColorIndex = Math.floor(Math.random() * color_presets.length);
        var selectedColor = color_presets[selectedColorIndex];
        var toAdd = new model_Node(
            {
                id: self.getLocalIndex(),
                text: obj.text,
                x: obj.x + 100,
                y: obj.y,
                color: selectedColor.color,
                background: selectedColor.background
            });
        var added = toAdd.ConvertToJs();
        self.pushToHistory({
            action: self.actions.NoteAdded,
            data: added
        });
        if(callback && typeof(callback) === "function") {
            callback(toAdd);
        }
    };

    self.CreateNoteFromSearchQuery = function() {
        var obj = {
            text: self.SearchNotesQuery().trim()
            , x: coord.x
            , y: coord.y };
        self.CreateNote(obj);
        self.SearchNotesQuery("");
    };

    self.SelectFrom = function(data) {
        // prevent self-selection, because self-loops are not allowed here
        if(self.connectFrom() != data){
            self.previousConnectFrom(self.connectFrom());
            self.connectFrom(data);
        }
    };

    self.ConnectPreviousWithCurrent = function() {
        self.ConnectNotes(self.previousConnectFrom(), self.connectFrom() )
    };

    self.ConnectNotes = function(from, to, label, generated) {
        var connectionToAdd = new model_Connection(
            self.getLocalIndex(),
            from.id,
            to.id,
            label ? label : "", 
            generated,
            lookup.findNodeById
        );
        var added = connectionToAdd.ConvertToJs();
        var filtered = ko.utils.arrayFilter(
            lookup.Connections(), 
            function(item)
                { 
                    return item.SourceId == connectionToAdd.SourceId &&
                        item.DestinationId == connectionToAdd.DestinationId &&
                        item.label() == connectionToAdd.label();
                } 
            );
        var searchResult = filtered.length > 0 ? filtered[0] : null;
        // don't allow to create duplicate connections
        if(!searchResult)
        {
            
            self.pushToHistory({
                action: self.actions.ConnectionAdded,
                data: added
            });
        }
        
    };

    self.RemoveNoteUnderEdit = function() {
        var toRemove = self.NoteToEdit();

        lookup.Notes.remove(toRemove);
        var deleted = toRemove.ConvertToJs();
        self.pushToHistory({
            action: self.actions.NoteDeleted,
            data: deleted
        });
    };

    

    

    self.RemoveConnectionUnderEdit = function() {
        var toRemove = self.EdgeToEdit();
        lookup.Connections.remove(toRemove);
        var deleted = toRemove.ConvertToJs();
        self.pushToHistory({
            action: self.actions.ConnectionDeleted,
            data: deleted
        });
    };

    self.NoteToEdit = ko.observable(null);

    self.EdgeToEdit = ko.observable(null);

    

   
    self.textToEdit = ko.observable("");

    self.textToEdit
        .subscribe(function(changes) {
            if(changes && self.NoteToEdit() && changes != self.NoteToEdit().text())
            {
                var toSend = self.NoteToEdit().ConvertToJs();
                toSend.text = changes;
                
                self.pushToHistory({
                        action: self.actions.NoteUpdated,
                        data: toSend
                    }
                );
            }
            if(changes && self.EdgeToEdit() && changes != self.EdgeToEdit().label())
            {
                var toSend = self.EdgeToEdit().ConvertToJs();
                toSend.label = changes;
                self.pushToHistory({
                    action: self.actions.ConnectionUpdated,
                    data: toSend
                });
            }
        });


    self.SelectNoteToEdit = function(id) {
        
        var from = lookup.findNodeById(id);
        if(from != null) {
            self.NoteToEdit( from );
            self.textToEdit(from.text());
            self.SelectFrom( from );
        }
    };

    self.DeselectNoteToEdit = function() {
        self.NoteToEdit(null);
    };

    self.SelectEdgeToEdit = function(id) {
        
        var from = lookup.findEdgeById(id);
        if(from != null) {
            self.EdgeToEdit( from );
            self.textToEdit(from.label());
        }
    };

    self.DeselectEdgeToEdit = function() {
        self.EdgeToEdit(null);
    };

    self.UpdatePositionsOfNodes = function (positions){
        for(var key in positions)
        {
            var elem = positions[key];
            if(typeof(elem) != "function")
            {
                var nodeFound = lookup.findNodeById(key);
                if(nodeFound) {
                    nodeFound.x = elem.x;
                    nodeFound.y = elem.y;
                    var toSend = nodeFound.ConvertToJs();
                    self.pushToHistory({
                            action: self.actions.NoteUpdated,
                            data: toSend
                        }
                    );
                }

            }
        }
        ko.utils.arrayForEach(positions, function(position) {
            
        });
        self.pushToHistory({
            action: self.actions.PositionsUpdated,
            data: null
        });
    };

    self.ViewPortUpdated = function()
    {
        self.pushToHistory({
            action: self.actions.PositionsUpdated,
            data: null
        });
    }

    

};


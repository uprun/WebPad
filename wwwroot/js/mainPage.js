function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}

var localStorage = undefined;
if (storageAvailable('localStorage')) {
    localStorage = window['localStorage'];
}
else {
    // Too bad, no localStorage for us
}

var storageForCallBacks = {
    view: {
        getFocusCoordinates: '',
        setFocusCoordinates: '',
        setFocusOnNode: ''
    },
    note: {
        added: '',
        updated: '',
        removed: '',
        applySelection: '',
        initialLoad: '',
        highlight: ''
    },
    connection: {
        added: '',
        updated: '',
        removed: '',
        applySelection: '',
        initialLoad: ''

    }
};

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

    
    self.freeLocalIndex = 0;
    self.localPrefix = '_local_';
    self.Notes = ko.observableArray([]);
    self.ColorPresets = ko.observableArray([]);
    self.Connections = ko.observableArray([]);

    self.crypto_worker = undefined;
    
    self.crypto_worker = new Worker("js/worker-crypto.js");

    self.history = ko.observableArray([]);

    /**
     * Define the chunk method in the prototype of an array
     * that returns an array with arrays of the given size.
     *
     * @param chunkSize {Integer} Size of every group
     */
    Object.defineProperty(Array.prototype, 'chunk', {
        value: function(chunkSize){
            var temporal = [];
            
            for (var i = 0; i < this.length; i+= chunkSize){
                temporal.push(this.slice(i,i+chunkSize));
            }
                    
            return temporal;
        }
    });

    self.processMessageFromOuterSpace = function(item)
    {
        var current_action = item.action;
        var current_data = item.data;
        if(current_action == self.actions.NoteUpdated)
        {
            var found = self.findNodeById(current_data.id);
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
                self.Notes.push(noteToAdd);
            }
        }

        if(current_action == self.actions.ConnectionUpdated)
        {
            var found = self.findEdgeById(current_data.id);
            if(found)
            {
                found.label(current_data.label);
            }
            else
            {
                var connectionToAdd = new model_Connection(current_data.id,
                    current_data.SourceId,
                    current_data.DestinationId,
                    current_data.label,
                    current_data.generated);
                self.Connections.push(connectionToAdd)
            }
        }

        if(current_action == self.actions.NoteAdded)
        {
            var found = self.findNodeById(current_data.id);
            if(!found)
            {
                var noteToAdd = new model_Node(current_data);
                self.Notes.push(noteToAdd);
            }
            else
            {
                if(!found.id.startsWith(self.localPrefix))
                {
                    found.text(current_data.text);
                }
            }
            
        }

        if(current_action == self.actions.NoteDeleted)
        {
            var found = self.findNodeById(current_data.id);
            if(found)
            {
                self.Notes.remove(found);
            }
        }

        if(current_action == self.actions.ConnectionAdded)
        {
            var found = self.findEdgeById(current_data.id);
            if(!found)
            {
                var connectionToAdd = new model_Connection(current_data.id, current_data.SourceId, current_data.DestinationId, current_data.label, current_data.generated);
                self.Connections.push(connectionToAdd)
            }
            else
            {
                if(!found.id.startsWith(self.localPrefix))
                {
                    found.label(current_data.label);
                }
            }
        }

        if(current_action == self.actions.ConnectionDeleted)
        {
            var found = self.findEdgeById(current_data.id);
            if(found)
            {
                self.Connections.remove(found);
            }
        }

        // if(current_action == self.actions.HealthCheckRequest)
        // {
        //     var toStoreNotes = ko.utils.arrayMap(self.Notes(), function(item) {
        //         return item.id;
        //     });
        //     var toStoreConnections = ko.utils.arrayMap(self.Connections(), function(item) {
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

    ko.utils.arrayPushAll(self.ColorPresets, toAddColors);

    self.colorFreeIndex = 0;

    self.populate = function(data) {
        var toAdd = ko.utils.arrayMap(data.notes, function(elem) 
        {
            var noteToAdd = new model_Node(elem);
            return noteToAdd;
        });
        ko.utils.arrayPushAll(self.Notes, toAdd);

        storageForCallBacks.note.initialLoad(data.notes);

        var connectionsToAdd = ko.utils.arrayMap(data.connections, function(elem) {
            var connectionToAdd = new model_Connection(elem.id, elem.SourceId, elem.DestinationId, elem.label, elem.generated);
            return connectionToAdd;
        });
        ko.utils.arrayPushAll(self.Connections, connectionsToAdd);
        storageForCallBacks.connection.initialLoad(data.connections);

        
        
    };

    self.processCallBacks = function(item)
    {
        var current_action = item.action;
        var current_data = item.data;
        if(current_action == self.actions.NoteUpdated)
        {
            storageForCallBacks.note.updated(current_data);
        }

        if(current_action == self.actions.ConnectionUpdated)
        {
            storageForCallBacks.connection.updated(current_data);
        }

        if(current_action == self.actions.NoteAdded)
        {
            storageForCallBacks.note.added(current_data);
        }

        if(current_action == self.actions.NoteDeleted)
        {
            storageForCallBacks.note.removed(current_data);
        }

        if(current_action == self.actions.ConnectionAdded)
        {
            storageForCallBacks.connection.added(current_data);
        }

        if(current_action == self.actions.ConnectionDeleted)
        {
            storageForCallBacks.connection.removed(current_data);
        }
    };

    self.pushToHistory = function(item) {
        item = self.ConvertToLocalId(item);
        self.processMessageFromOuterSpace(item);
        item.historyIndex = self.freeLocalIndex++;
        self.processCallBacks(item);        
        self.history.push(item);
    };

    self.saveTrustedPublicKeys = function() {
        localStorage.setItem("TrustedPublicKeysToSendTo", JSON.stringify(self.TrustedPublicKeysToSendTo()));
    };

    self.GenerateConnection = function(A, Z)
    {
        //   A    Z         R
        // X is Y is D => X is D
        if(A.label() == "is")
        {
            if(A.DestinationId == Z.SourceId)
            {
                if(Z.label() == "is")
                {
                    var from = self.findNodeById(A.SourceId);
                    var to = self.findNodeById(Z.DestinationId);
                    self.ConnectNotes(from, to, "is", true);


                }
            }
        }

    };

    self.ActualGenerateConnections = function()
    {
        ko.utils.arrayForEach(
            self.Connections(), 
            function(itemA, indexA)
                { 
                    ko.utils.arrayForEach(
                        self.Connections(), 
                        function(itemB, indexB)
                            { 
                                if(indexA !== indexB)
                                {
                                    self.GenerateConnection(itemA, itemB);
                                }
                            } 
                        );
                } 
            );
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

                        var toStoreNotes = ko.utils.arrayMap(self.Notes(), function(item) {
                            return item.ConvertToJs();
                        });
                        var toStoreConnections = ko.utils.arrayMap(self.Connections(), function(item) {
                            return item.ConvertToJs();
                        });
                       
                        
                        localStorage.setItem("Notes", JSON.stringify(toStoreNotes));
                        localStorage.setItem("Connections", JSON.stringify(toStoreConnections));
                        localStorage.setItem("localFreeIndex", JSON.stringify(self.freeLocalIndex));
                        localStorage.setItem("viewPosition", JSON.stringify(storageForCallBacks.view.getFocusCoordinates()))

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
                        self.history.removeAll();
                    

                    }
                }
            }
            ,null
            ,"arrayChange"
        );


    self.getLocalIndex = function() {
        return ( self.localPrefix + (self.freeLocalIndex++) );
    };

    self.SearchNotesQuery = ko.observable("");

    self.MaxSearchResults = ko.observable(4);

    self.FilteredNodes = ko.pureComputed(function() {
        return ko.utils.arrayFilter
        (
            self.Notes(), 
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
                            storageForCallBacks.note.highlight(item, 2);
                            hash[item.id] = true;
                        }
                    );

                }

                ko.utils.arrayForEach(self.previousHighlighted, function(item)
                    {
                        if(!hash[item.id])
                        {
                            storageForCallBacks.note.highlight(item, 0);
                        }
                    }
                );
                self.previousHighlighted = addedChanges.slice(0);

            }
        );
    
    self.focusOnNode = function(item)
    {
        storageForCallBacks.view.setFocusOnNode(item.id);
    };

    self.SendMessage = function(item) {
        self.crypto_worker.postMessage({
            action: 'encrypt'
            , PlainText: unescape(encodeURIComponent(item.message))
            , ReceiverPublicKey: item.receiver
            , Id: 1
        });
        

    };

    self.DecryptMessage = function(item) {
        self.crypto_worker.postMessage(
            {
                action: 'decrypt'
                , CipherText: item
            });
        

    };

    self.ActualSendMessage = function(receiver, text, id) {
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
                senderPublicKey: self.publicCryptoKey()
            },
            success: function() {
            },
            error: function() {
                console.log("Home/SendMessages error");
            },
            dataType: "json"
        });

    };

    self.ReceiveMessages = function(publicKey) {
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
                        self.DecryptMessage(item);
                    });
                }
                
            },
            error: function() {
                console.log("Home/ReceiveMessages error");
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
                    data.id = self.localPrefix + data.id.substring(shrinkedOwnPublicKey.length);
                }
            }
            if(data.SourceId)
            {
                if(data.SourceId.startsWith(shrinkedOwnPublicKey))
                {
                    data.SourceId = self.localPrefix + data.SourceId.substring(shrinkedOwnPublicKey.length);
                }
            }
            if(data.DestinationId)
            {
                if(data.DestinationId.startsWith(shrinkedOwnPublicKey))
                {
                    data.DestinationId = self.localPrefix + data.DestinationId.substring(shrinkedOwnPublicKey.length);
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
                            if(data.id.startsWith(self.localPrefix))
                            {
                                data.id = shrinkedOwnPublicKey + data.id.substring(self.localPrefix.length);
                            }
                        }
                        if(data.SourceId)
                        {
                            if(data.SourceId.startsWith(self.localPrefix))
                            {
                                data.SourceId = shrinkedOwnPublicKey + data.SourceId.substring(self.localPrefix.length);
                            }
                        }
                        if(data.DestinationId)
                        {
                            if(data.DestinationId.startsWith(self.localPrefix))
                            {
                                data.DestinationId = shrinkedOwnPublicKey + data.DestinationId.substring(self.localPrefix.length);
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
                        var notesChanges = ko.utils.arrayMap(self.Notes(), function(elem) {
                            var result = {
                                action: self.actions.NoteAdded,
                                data: elem.ConvertToJs()
                            };
                            return result;
                        });

                        var connectionsChanges = ko.utils.arrayMap(self.Connections(), function(elem) {
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
            url: "Home/GetOneTimeSynchronizationToken",
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
            url: "Home/StatisticsOnLoad",
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
            url: "Home/GetSyncPublicKey",
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
            storageForCallBacks.note.applySelection(destination.id);
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
        data.notes = JSON.parse(localStorage.getItem("Notes"));
        data.connections = JSON.parse(localStorage.getItem("Connections"));
        self.populate(data);
    }
    if(localStorage["privateCryptoPair"]){
        self.privateCryptoPair = JSON.parse(localStorage.getItem("privateCryptoPair"));
    }
    
    if(localStorage["localFreeIndex"]) {
        self.freeLocalIndex = JSON.parse(localStorage.getItem("localFreeIndex"));
    }
    else {
        self.freeLocalIndex = self.Notes().length + self.Connections().length + 1;
    }
    //localStorage.setItem("viewPosition", JSON.stringify(storageForCallBacks.view.getFocusCoordinates()))

    if(localStorage["viewPosition"])
    {
         var parsedViewPosition = JSON.parse(localStorage.getItem("viewPosition"));
         storageForCallBacks.view.setFocusCoordinates(parsedViewPosition);
    }

    if(localStorage["TrustedPublicKeysToSendTo"]){ 
        self.TrustedPublicKeysToSendTo(JSON.parse(localStorage.getItem("TrustedPublicKeysToSendTo")));
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

    
    self.crypto_worker.onmessage = function(e) {
        if(e.data.action == "applySaveOfKey.Result" ) {
            if(typeof(self.privateCryptoPair.n) == "undefined") {
                localStorage.setItem("privateCryptoPair", JSON.stringify(e.data.data));
            }
            self.crypto_worker.postMessage({action: 'getPublicKey', data: self.privateCryptoPair});
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

    self.crypto_worker.postMessage({action: 'applySaveOfKey', data: self.privateCryptoPair});
    

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
        var coord = storageForCallBacks.view.getFocusCoordinates();
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
            generated
        );
        var added = connectionToAdd.ConvertToJs();
        var filtered = ko.utils.arrayFilter(
            self.Connections(), 
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

        self.Notes.remove(toRemove);
        var deleted = toRemove.ConvertToJs();
        self.pushToHistory({
            action: self.actions.NoteDeleted,
            data: deleted
        });
    };

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

    self.RemoveConnectionUnderEdit = function() {
        var toRemove = self.EdgeToEdit();
        self.Connections.remove(toRemove);
        var deleted = toRemove.ConvertToJs();
        self.pushToHistory({
            action: self.actions.ConnectionDeleted,
            data: deleted
        });
    };

    self.NoteToEdit = ko.observable(null);

    self.EdgeToEdit = ko.observable(null);

    self.buffer_findNodeById = undefined;
    self.findNodeById = function(id)
    {
        if(typeof(self.buffer_findNodeById) == "undefined")
        {
            self.buffer_findNodeById = {};
            ko.utils.arrayForEach
            (
                self.Notes(), 
                function(item) 
                    {
                        self.buffer_findNodeById[item.id] = item;
                    }
            );
        }

        var result = self.buffer_findNodeById[id];
        if(typeof(result) == "undefined")
        {
            var filtered = ko.utils.arrayFilter(self.Notes(), function(item){ return item.id == id;} );
            result = filtered.length > 0 ? filtered[0] : null;
        }

        return result;

    };

    self.buffer_findEdgeById = undefined;
    self.findEdgeById = function(id)
    {
        if(typeof(self.buffer_findEdgeById) == "undefined")
        {
            self.buffer_findEdgeById = {};
            ko.utils.arrayForEach
            (
                self.Connections(), 
                function(item) 
                    {
                        self.buffer_findEdgeById[item.id] = item;
                    }
            );
        }
        var result = self.buffer_findEdgeById[id];
        if(typeof(result) == "undefined")
        {
            var filtered = ko.utils.arrayFilter(self.Connections(), function(item){ return item.id == id;} );
            result = filtered.length > 0 ? filtered[0] : null;
        }

        
        return result;

    }
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
        
        var from = self.findNodeById(id);
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
        
        var from = self.findEdgeById(id);
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
                var nodeFound = self.findNodeById(key);
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


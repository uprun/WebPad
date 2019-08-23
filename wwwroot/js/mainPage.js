

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

    lookup.Notes = ko.observableArray([]);

    lookup.ColorPresets = ko.observableArray([]);

    lookup.Connections = ko.observableArray([]);

    lookup.crypto_worker = undefined;
    
    lookup.crypto_worker = new Worker("js/worker-crypto.js");

    lookup.history = ko.observableArray([]); 

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

    lookup.PromoVisible = ko.observable(true);

    lookup.HidePromo = function() 
    {
        lookup.PromoVisible(false);
    };

    lookup.ShowPromo = function() 
    {
        lookup.PromoVisible(true);
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
        },
        { 
            background: "#1a65b7",
            color: "#ffffff" 
        }
    ];

    // populate colors immediately
    var toAddColors = ko.utils.arrayMap(color_presets, function(elem) 
    {
        var toReturn = new model_ColorPreset(elem);
        return toReturn;
    });

    ko.utils.arrayPushAll(lookup.ColorPresets, toAddColors);


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

    lookup.CheckIfEveryNodeHasColor = function()
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
                lookup.ColorNodeFromCode(selectedColor, item);
            });
        }
    };

    lookup.composedCards = ko.observableArray([]);

    lookup.populate = function(data) {
        var hash = {};
        var toAdd = ko.utils.arrayMap(data.notes, function(elem) 
        {
            var noteToAdd = new model_Node(elem);
            hash[noteToAdd.id] = new model_Card({ Note: noteToAdd});
            return noteToAdd;
        });
        ko.utils.arrayPushAll(lookup.Notes, toAdd);

        

        var connectionsToAdd = ko.utils.arrayMap(data.connections, function(elem) {
            var connectionToAdd = new model_Connection(elem.id, elem.SourceId, elem.DestinationId, elem.label, elem.generated, lookup.findNodeById);
            var found = hash[connectionToAdd.SourceId];
            if(found)
            {
                found.Tags.push(connectionToAdd);
            }

            return connectionToAdd;
        });
        ko.utils.arrayPushAll(lookup.Connections, connectionsToAdd);
        for(var key in hash)
        {
            lookup.composedCards.push(hash[key]);
        }

        //lookup.CheckIfEveryNodeHasColor();

        
        
    };

    

    lookup.pushToHistory = function(item) {
        item = lookup.ConvertToLocalId(item);
        lookup.processMessageFromOuterSpace(item);
        item.historyIndex = lookup.freeLocalIndex++;
        lookup.history.push(item);
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

    lookup.SearchNotesQuery = ko.observable("");

    lookup.MaxSearchResults = ko.observable(4);

    lookup.FilteredNodes = ko.pureComputed(function() {
        return ko.utils.arrayFilter
        (
            lookup.Notes(), 
            function(item, index)
                { 
                    if(lookup.SearchNotesQuery() && lookup.SearchNotesQuery().trim().length > 0)
                    {
                        var result = item.text().toLowerCase().indexOf(lookup.SearchNotesQuery().trim().toLowerCase()) >= 0;
                        return result;
                    }
                    else
                    {
                        return false;
                    }
                    
                }
        );
    });
    

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
                senderPublicKey: lookup.publicCryptoKey()
            },
            success: function() {
            },
            error: function() {
                console.log("SendMessages error");
            },
            dataType: "json"
        });

    };

    lookup.ReceiveMessages = function(publicKey) {
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
                        lookup.DecryptMessage(item);
                    });
                }
                
            },
            error: function() {
                console.log("ReceiveMessages error");
            },
            dataType: "json"
        });

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


    lookup.processMessages = function() {
        var ownPublicKey = lookup.publicCryptoKey();
        var shrinkedOwnPublicKey = ownPublicKey.substring(0, 5) + '_' ;
        var messages = ko.utils.arrayMap(lookup.TrustedPublicKeysToSendTo(), function(item) 
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
                lookup.SendMessage(item);
            });
            lookup.saveTrustedPublicKeys();
        }
        var needToSavePublicKeys = false;
        ko.utils.arrayForEach(lookup.TrustedPublicKeysToSendTo(), function(publicKey) {
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
                lookup.pushToHistory({
                    action: lookup.actions.HealthCheckRequest,
                    data: { 
                        checkedIndex: undefined,
                        publicKey: publicKey.publicKey 
                    }
                });
            }
        });
        
        if(needToSavePublicKeys)
        {
            lookup.saveTrustedPublicKeys();
        }

        lookup.TrustedPublicKeysToSendTo()

        lookup.ReceiveMessages(ownPublicKey);
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
        lookup.TokenToShare("");
        $.ajax({
            type: "POST",
            url: "GetOneTimeSynchronizationToken",
            data: {
                publicKey: lookup.publicCryptoKey()
            },
            success: function(data){
                lookup.TokenToShare(data);
            },
            dataType: "json"
        });

    };

    lookup.StatisticsOnLoad = function() {
        $.ajax({
            type: "POST",
            url: "StatisticsOnLoad",
            data: {
                publicKey: lookup.publicCryptoKey()
            },
            success: function(data){
            },
            dataType: "json"
        });

    };


    lookup.SynchronizeUsingToken = function() {
        $.ajax({
            type: "POST",
            url: "GetSyncPublicKey",
            data: {
                token: lookup.SynchronizationToken().trim()
            },
            success: function(data){
                lookup.ReceivedPublicKey(data);
            },
            dataType: "json"
        });

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

    
    lookup.CreateNoteFromDestinationSearchQuery = function() {
        var obj = {
            text: ""
            , x: lookup.connectFrom().x
            , y: lookup.connectFrom().y
        };
        lookup.CreateNote(obj, function(destination) { 
            lookup.ConnectNotes(lookup.connectFrom(), destination);  
            lookup.SelectNoteToEdit(destination.id);
        });
    };


    lookup.privateCryptoPair = {};

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
        lookup.populate(data);
    }
    if(localStorage["privateCryptoPair"]){
        lookup.privateCryptoPair = JSON.parse(lookup.localStorage.getItem("privateCryptoPair"));
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

    lookup.CreateNote = function(obj, callback) {

        var selectedColorIndex = Math.floor(Math.random() * color_presets.length);
        var selectedColor = color_presets[selectedColorIndex];
        var toAdd = new model_Node(
            {
                id: lookup.getLocalIndex(),
                text: obj.text,
                x: obj.x + 100,
                y: obj.y,
                color: selectedColor.color,
                background: selectedColor.background
            });
        var added = toAdd.ConvertToJs();
        lookup.pushToHistory({
            action: lookup.actions.NoteAdded,
            data: added
        });
        if(callback && typeof(callback) === "function") {
            callback(toAdd);
        }
    };

    lookup.CreateNoteFromSearchQuery = function() {
        var obj = {
            text: lookup.SearchNotesQuery().trim()
            , x: coord.x
            , y: coord.y };
        lookup.CreateNote(obj);
        lookup.SearchNotesQuery("");
    };

    lookup.SelectFrom = function(data) {
        // prevent self-selection, because self-loops are not allowed here
        if(lookup.connectFrom() != data){
            lookup.previousConnectFrom(lookup.connectFrom());
            lookup.connectFrom(data);
        }
    };

    lookup.ConnectPreviousWithCurrent = function() {
        lookup.ConnectNotes(lookup.previousConnectFrom(), lookup.connectFrom() )
    };

    lookup.ConnectNotes = function(from, to, label, generated) {
        var connectionToAdd = new model_Connection(
            lookup.getLocalIndex(),
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
            
            lookup.pushToHistory({
                action: lookup.actions.ConnectionAdded,
                data: added
            });
        }
        
    };

    lookup.RemoveNoteUnderEdit = function() {
        var toRemove = lookup.NoteToEdit();

        lookup.Notes.remove(toRemove);
        var deleted = toRemove.ConvertToJs();
        lookup.pushToHistory({
            action: lookup.actions.NoteDeleted,
            data: deleted
        });
    };

    

    

    lookup.RemoveConnectionUnderEdit = function() {
        var toRemove = lookup.EdgeToEdit();
        lookup.Connections.remove(toRemove);
        var deleted = toRemove.ConvertToJs();
        lookup.pushToHistory({
            action: lookup.actions.ConnectionDeleted,
            data: deleted
        });
    };

    lookup.NoteToEdit = ko.observable(null);

    lookup.EdgeToEdit = ko.observable(null);

    

   
    lookup.textToEdit = ko.observable("");

    lookup.textToEdit
        .subscribe(function(changes) {
            if(changes && lookup.NoteToEdit() && changes != lookup.NoteToEdit().text())
            {
                var toSend = lookup.NoteToEdit().ConvertToJs();
                toSend.text = changes;
                
                lookup.pushToHistory({
                        action: lookup.actions.NoteUpdated,
                        data: toSend
                    }
                );
            }
            if(changes && lookup.EdgeToEdit() && changes != lookup.EdgeToEdit().label())
            {
                var toSend = lookup.EdgeToEdit().ConvertToJs();
                toSend.label = changes;
                lookup.pushToHistory({
                    action: lookup.actions.ConnectionUpdated,
                    data: toSend
                });
            }
        });


    lookup.SelectNoteToEdit = function(id) {
        
        var from = lookup.findNodeById(id);
        if(from != null) {
            lookup.NoteToEdit( from );
            lookup.textToEdit(from.text());
            lookup.SelectFrom( from );
        }
    };

    lookup.DeselectNoteToEdit = function() {
        lookup.NoteToEdit(null);
    };

    lookup.SelectEdgeToEdit = function(id) {
        
        var from = lookup.findEdgeById(id);
        if(from != null) {
            lookup.EdgeToEdit( from );
            lookup.textToEdit(from.label());
        }
    };

    lookup.DeselectEdgeToEdit = function() {
        lookup.EdgeToEdit(null);
    };

    lookup.UpdatePositionsOfNodes = function (positions){
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
                    lookup.pushToHistory({
                            action: lookup.actions.NoteUpdated,
                            data: toSend
                        }
                    );
                }

            }
        }
        ko.utils.arrayForEach(positions, function(position) {
            
        });
        lookup.pushToHistory({
            action: lookup.actions.PositionsUpdated,
            data: null
        });
    };

    lookup.ViewPortUpdated = function()
    {
        lookup.pushToHistory({
            action: lookup.actions.PositionsUpdated,
            data: null
        });
    }


    self.ApplyLookupToSelf = function()
    {
        for(var x in lookup)
        {
            self[x] = lookup[x];
        }
    };

    

};


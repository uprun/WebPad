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

function NoteModel(data)
{
    var self = this;
    self.id = data.id;
    self.text = ko.observable(data.text);
    self.x = data.x;
    self.y = data.y;
    self.ConvertToJs = function() {
        return {
            id: self.id,
            text: self.text(),
            x: self.x,
            y: self.y
        };
    };
    self.text
        .subscribe(function() {
            var temp = self.ConvertToJs();
            if(self.textChangesOccuredHandler && typeof(self.textChangesOccuredHandler) == "function") {
                self.textChangesOccuredHandler(temp);
            }
        });

    self.textChangesOccuredHandler;
    self.subscribeToTextChanges = function(callback) {
        self.textChangesOccuredHandler = callback;
    };
};

function ConnectedNotesModel(id, sourceId, destinationId, label)
{

    var self = this;
    self.id = id;
    self.SourceId = sourceId;
    self.DestinationId = destinationId;
    self.label = ko.observable(label);
    self.labelUpdateCallback;
    self.ConvertToJs = function() {
        return {
            id: self.id,
            SourceId: self.SourceId,
            DestinationId:  self.DestinationId,
            label: self.label()
        };
    };
    self.label
        .subscribe(function() {
            var temp = self.ConvertToJs();
            if(self.labelUpdateCallback && typeof(self.labelUpdateCallback) == "function") {
                self.labelUpdateCallback(temp);
            }
        });
    self.subscribeToLabelChanges = function(callback) {
        self.labelUpdateCallback = callback;
    };


};

var storageForCallBacks = {
    view: {
        getFocusCoordinates: ''
    },
    note: {
        added: '',
        updated: '',
        removed: '',
        applySelection: '',
        initialLoad: ''
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
        PositionsUpdated: 'PositionsUpdated'
    };

    
    self.freeLocalIndex = 0;
    self.localPrefix = '_local_';
    self.Notes = ko.observableArray([]);
    self.Connections = ko.observableArray([]);

    self.crypto_worker = undefined;
    
    self.crypto_worker = new Worker("js/worker-crypto.js");

    self.history = ko.observableArray([]);

    self.processMessageFromOuterSpace = function(item)
    {
        var current_action = item.action;
        var current_data = item.data;
        if(current_action == self.actions.NoteUpdated)
        {
            //storageForCallBacks.note.updated(current_data);
        }

        if(current_action == self.actions.ConnectionUpdated)
        {
            //storageForCallBacks.connection.updated(current_data);
        }

        if(current_action == self.actions.NoteAdded)
        {
            var noteToAdd = new NoteModel(current_data);
            noteToAdd.subscribeToTextChanges
            (
                function(updated) 
                {
                    self.pushToHistory
                    (
                        {
                            action: self.actions.NoteUpdated,
                            data: updated
                        }
                    );
                }  
            );
            self.Notes.push(noteToAdd);
        }

        if(current_action == self.actions.NoteDeleted)
        {
            //storageForCallBacks.note.removed(current_data);
        }

        if(current_action == self.actions.ConnectionAdded)
        {
            var connectionToAdd = new ConnectedNotesModel(current_data.id, current_data.SourceId, current_data.DestinationId, current_data.label);
            connectionToAdd.subscribeToLabelChanges
            (
                function(updated) {
                    self.pushToHistory
                    (
                        {
                            action: self.actions.ConnectionUpdated,
                            data: updated
                        }
                    );
                }
            );
            self.Connections.push(connectionToAdd)
        }

        if(current_action == self.actions.ConnectionDeleted)
        {
            //storageForCallBacks.connection.removed(current_data);
        }
        self.pushToHistory(item);
    };

    self.populate = function(data) {
        var toAdd = ko.utils.arrayMap(data.notes, function(elem) {
                var noteToAdd = new NoteModel(elem);
                noteToAdd.subscribeToTextChanges(function(updated) {
                    self.pushToHistory({
                        action: self.actions.NoteUpdated,
                        data: updated
                    }
                    );
                }  );
            return noteToAdd;
        });
        ko.utils.arrayPushAll(self.Notes, toAdd);

        storageForCallBacks.note.initialLoad(data.notes);

        var connectionsToAdd = ko.utils.arrayMap(data.connections, function(elem) {
            var connectionToAdd = new ConnectedNotesModel(elem.id, elem.SourceId, elem.DestinationId, elem.label);
            connectionToAdd.subscribeToLabelChanges(function(updated) {
                self.pushToHistory({
                    action: self.actions.ConnectionUpdated,
                    data: updated
                });
            });
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
        item.historyIndex = self.freeLocalIndex++;
        self.processCallBacks(item);        
        self.history.push(item);
    };

    self.saveTrustedPublicKeys = function() {
        localStorage.setItem("TrustedPublicKeysToSendTo", JSON.stringify(self.TrustedPublicKeysToSendTo()));
    };



    self
        .history
        .extend(
            { 
                rateLimit: 1000 
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

                        var filteredChanges = ko.utils.arrayFilter(addedChanges, function(item){ 
                                return item.value.action != self.actions.PositionsUpdated 
                                    && item.value.action != ""
                                    && !item.value.isFromOuterSpace;
                            } 
                        );



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
    self.SearchFilter = function(item, searchTerm) {
        searchTerm = searchTerm.trim().toLowerCase();
        var searchString = item.text.toLowerCase();
        return searchString.indexOf(searchTerm) > -1;
    };

    self.SearchDestinationNotesQuery = ko.observable("");

    self.SearchableNotes = ko.computed(function() {
        return ko.utils.arrayMap(self.Notes(), function(item) {
            return {text: item.text(), id: item.id};
        });
    });

    self.SendMessage = function(item) {
        self.crypto_worker.postMessage({
            action: 'encrypt'
            , PlainText: item.message
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
                ]
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

                    return {
                        receiver: item.publicKey,
                        message: JSON.stringify(itemToSend)
                    }
               

            
        
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
        }

        self.ReceiveMessages(ownPublicKey);
        setTimeout(self.processMessages, 1000);
    };

    self.publicCryptoKey = ko.observable(undefined);
    self.publicCryptoKey.subscribe(function(changes) {
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


    self.SynchronizeUsingToken = function() {
        $.ajax({
            type: "POST",
            url: "Home/GetSyncPublicKey",
            data: {
                token: self.SynchronizationToken()
            },
            success: function(data){
                self.ReceivedPublicKey(data);
            },
            dataType: "json"
        });

    };

    self.AddPublicKeyToTrusted = function(keyToAdd) {
        var filtered = ko.utils.arrayFilter(self.TrustedPublicKeysToSendTo(), function(item){ return item.publicKey == keyToAdd;} );
        var foundMaybe = filtered.length > 0 ? filtered[0] : null;
        if(foundMaybe == null) {
            var toPush = {
                status: "awaitingInitialSnapshot",
                publicKey: keyToAdd
            };
            self.TrustedPublicKeysToSendTo.push(toPush);
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


    self.saveOfKey = {};

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
        self.saveOfKey = JSON.parse(localStorage.getItem("privateCryptoPair"));
    }
    
    if(localStorage["localFreeIndex"]) {
        self.freeLocalIndex = JSON.parse(localStorage.getItem("localFreeIndex"));
    }
    else {
        self.freeLocalIndex = self.Notes().length + self.Connections().length + 1;
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



    if(localStorage["publicCryptoKey"]) {
        self.publicCryptoKey(localStorage.getItem("publicCryptoKey"));
        // trigger timer for sending changes

    }

    
    self.crypto_worker.onmessage = function(e) {
        if(e.data.action == "applySaveOfKey.Result" ) {
            if(typeof(self.saveOfKey.n) == "undefined") {
                localStorage.setItem("privateCryptoPair", JSON.stringify(e.data.data));
            }
            self.crypto_worker.postMessage({action: 'getPublicKey', data: self.saveOfKey});
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
                localStorage.setItem("publicCryptoKey", keyToUse);
            }
            
            // start receiving outer world changes from here via timer
            
        }
        if(e.data.action == "encrypt.Result") {
            self.ActualSendMessage(e.data.receiverPublicKey, e.data.encryptedText.cipher, e.data.id);   
        }
        if(e.data.action == "decrypt.Result") {
            var decrypted = e.data.decryptionResult;
            var publicKeyOfSender = decrypted.publicKeyString;
            var signatureStatus = decrypted.signature;
            //var from = de
            var plainText = decrypted.plaintext;
            console.log(plainText);
            var actionReceived = JSON.parse(plainText);
            actionReceived.isFromOuterSpace = true;
            self.processMessageFromOuterSpace(actionReceived);

            //self.ActualSendMessage(e.data.receiverPublicKey, e.data.encryptedText.cipher, e.data.id);   
        }
    };

    self.crypto_worker.postMessage({action: 'applySaveOfKey', data: self.saveOfKey});
    

    self.connectFrom = ko.observable(null);
    self.previousConnectFrom = ko.observable(null);

    self.CreateNote = function(obj, callback) {

        
        var toAdd = new NoteModel(
            {
                id: self.getLocalIndex(),
                text: obj.text,
                x: obj.x,
                y: obj.y
            });
        toAdd.subscribeToTextChanges(
            function(updated) {
                self.pushToHistory({
                        action: self.actions.NoteUpdated,
                        data: updated
                    }
                ); 
            }
        );
        self.Notes.push(toAdd);
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

    self.ConnectNotes = function(from, to) {
        var connectionToAdd = new ConnectedNotesModel(
            self.getLocalIndex(),
            from.id,
            to.id,
            ""
        );
        connectionToAdd.subscribeToLabelChanges(function(updated) {
            self.pushToHistory({
                action: self.actions.ConnectionUpdated,
                data: updated
            });
        });
        self.Connections.push(connectionToAdd);
        var added = connectionToAdd.ConvertToJs();
        self.pushToHistory({
            action: self.actions.ConnectionAdded,
            data: added
        });
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

    self.findNodeById = function(id)
    {
        var filtered = ko.utils.arrayFilter(self.Notes(), function(item){ return item.id == id;} );
        var result = filtered.length > 0 ? filtered[0] : null;
        return result;

    };
    self.findEdgeById = function(id)
    {
        var filtered = ko.utils.arrayFilter(self.Connections(), function(item){ return item.id == id;} );
        var result = filtered.length > 0 ? filtered[0] : null;
        return result;

    }

    self.SelectNoteToEdit = function(id) {
        
        var from = self.findNodeById(id);
        if(from != null) {
            self.NoteToEdit( from );
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
        }
    };

    self.DeselectEdgeToEdit = function() {
        self.EdgeToEdit(null);
    };

    self.UpdatePositionsOfNodes = function (positions){
        ko.utils.arrayForEach(self.Notes(), function(note) {
            var found = positions[note.id];
            if(found) {
                note.x = found.x;
                note.y = found.y;
            }
        });
        self.pushToHistory({
            action: self.actions.PositionsUpdated,
            data: null
        });
    };

    

};

$(document).ready(function()
{
    
    // create an array with nodes
    var nodes = new vis.DataSet([
    ]);

    // create an array with edges
    var edges = new vis.DataSet([
    ]);

    // create a network
    var container = document.getElementById('mygraph');
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {};
    var network = new vis.Network(container, data, options);

    
    

    storageForCallBacks.note.added = function (added) {
        var toAdd = {id: added.id, label: added.text, shape: 'box' };
        if(added.x && typeof(added.x) != "undefined")
        {
            toAdd.x = added.x;
        }

        if(added.y && typeof(added.y) != "undefined")
        {
            toAdd.y = added.y;
        }
        nodes.add( toAdd );
    };

    storageForCallBacks.note.updated = function(changed) {
        nodes.update({id: changed.id, label: changed.text}); 
    };

    storageForCallBacks.note.removed = function(node) {
        nodes.remove(node.id);
    };

    storageForCallBacks.note.applySelection = function(id) {
        network.selectNodes([id], true);

    };

    storageForCallBacks.note.initialLoad = function (nodesList) {
        var toAddNodes = ko.utils.arrayMap(nodesList, function(added) {
            var toAdd = {id: added.id, label: added.text, shape: 'box' };
            if(added.x && typeof(added.x) != "undefined")
            {
                toAdd.x = added.x;
            }

            if(added.y && typeof(added.y) != "undefined")
            {
                toAdd.y = added.y;
            }
            return toAdd;
        });
        
        nodes.add( toAddNodes );
    };

    storageForCallBacks.connection.added = function(connectionAdded) {
        edges.add( {
            id: connectionAdded.id,
            from: connectionAdded.SourceId,
            to: connectionAdded.DestinationId,
            arrows: 'to',
            label: connectionAdded.label,
            font: { align: 'top' } 
        });
    };

    storageForCallBacks.connection.updated = function(connectionUpdated) {
        edges.update({
            id: connectionUpdated.id,
            label: connectionUpdated.label
        });
    };

    storageForCallBacks.connection.removed = function(connection) {
        edges.remove(connection.id);
    };

    storageForCallBacks.connection.initialLoad = function(connectionsList) {
        var edgesToAdd = ko.utils.arrayMap(connectionsList, function(connectionAdded) {
            return {
            id: connectionAdded.id,
            from: connectionAdded.SourceId,
            to: connectionAdded.DestinationId,
            arrows: 'to',
            label: connectionAdded.label,
            font: { align: 'top' }
            };
        });

        edges.add(edgesToAdd);

    };

    storageForCallBacks.view.getFocusCoordinates = function() {
        return network.getViewPosition();
    };
    
    var viewModel = new ConnectedNotesViewModel();
    ko.applyBindings(viewModel);        

    network.on("selectEdge", function (params) {
        if(params 
            && params.edges 
            && params.edges.length
            && params.edges.length == 1
            && params.nodes.length == 0 )
        {
            viewModel.SelectEdgeToEdit(params.edges[0]);
            viewModel.DeselectNoteToEdit();
        }
    });
    
    network.on("deselectEdge", function (params) {
        viewModel.DeselectEdgeToEdit();
    });


    network.on("selectNode", function (params) {
        viewModel.SelectNoteToEdit(params.nodes[0]);
        viewModel.DeselectEdgeToEdit();
    });

    network.on("dragStart", function (params) {
        if(params 
            && params.edges 
            && params.edges.length
            && params.edges.length == 1
            && params.nodes.length == 0 )
        {
            viewModel.SelectEdgeToEdit(params.edges[0]);
            viewModel.DeselectNoteToEdit();
        }

        if(params 
            && params.nodes.length == 1 )
        {
            viewModel.SelectNoteToEdit(params.nodes[0]);
            viewModel.DeselectEdgeToEdit();
        }
    });

    network.on("deselectNode", function (params) {
        viewModel.DeselectNoteToEdit();
        if(params 
            && params.edges 
            && params.edges.length
            && params.edges.length == 1
            && params.nodes.length == 0 )
        {
            viewModel.SelectEdgeToEdit(params.edges[0]);
        }
    });

    network.on("stabilizationIterationsDone", function(params) {
        network.getPositions();
    });

    network.on("stabilized", function(params) {
        var positions = network.getPositions();
        viewModel.UpdatePositionsOfNodes(positions);
    });

    
    


    
});
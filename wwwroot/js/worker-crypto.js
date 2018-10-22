importScripts(
    'cryptico/jsbn.js', 
    'cryptico/random.js', 
    'cryptico/hash.js', 
    'cryptico/rsa.js', 
    'cryptico/aes.js', 
    'cryptico/api.js'); 

var GeneratePassPhrase = function(initialPhrase) {
    var prefix = "" + initialPhrase;
    for(var k = 0; k < 20; k++) {
        prefix = prefix + Math.random();
    }
    return prefix;
};

var rsaKey = cryptico.generateRSAKey(GeneratePassPhrase(), 2048);

var restoreFieldsOfObject = function(objectInstance, savedFields) {
    for( var a in objectInstance) {
        if(typeof(savedFields[a]) != "undefined") {
            if(typeof(objectInstance[a]) == "object"  ) {
                objectInstance[a] = self.restoreFieldsOfObject(objectInstance[a], savedFields[a]);
            }
            else {
                if(typeof(objectInstance[a]) != "function" ) {
                    objectInstance[a] = savedFields[a];
                }
            }
        }        
    }
    return objectInstance;
};

onmessage = function(e) {
    if(e.data.action == 'applySaveOfKey')
    {
        rsaKey = restoreFieldsOfObject(rsaKey, e.data.data);
        postMessage({ action: 'saveOfKey', data: rsaKey});
    }

    if(e.data.action == 'getPublicKey')
    {
        var publicKey = cryptico.publicKeyString(rsaKey);
        postMessage({ action: 'publicKey', data: publicKey});
    }

    if(e.data.action == 'encrypt')
    {
        var encryptedMessage = cryptico.encrypt(e.data.PlainText, e.data.ReceiverPublicKey, rsaKey);
        postMessage({ 
            action: 'encrypt.Result'
            , encryptedText: encryptedMessage
            , receiverPublicKey: e.data.ReceiverPublicKey
            , id: e.data.Id });
    }


    
};




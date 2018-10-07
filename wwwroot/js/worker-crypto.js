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
    rsaKey = restoreFieldsOfObject(rsaKey, e.data);
    postMessage(rsaKey);
};




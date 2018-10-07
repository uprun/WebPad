var GeneratePassPhrase = function(initialPhrase) {
    var prefix = "" + initialPhrase;
    for(var k = 0; k < 20; k++) {
        prefix = prefix + Math.random();
    }
    return prefix;
};

cryptico.generateRSAKey(GeneratePassPhrase(), 2048);
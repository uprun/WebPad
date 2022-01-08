lookup.define_Aliases_if_needed = function() {
    // backend-worker context
    if (typeof (lookup.Aliases) === 'undefined') {
        // [2022-01-08] in future here can be added some spelling mistakes and some pronunciation mistakes
        // for example: monthes <-> months // this mistake occured with me some times
        lookup.Aliases = {
            'example': {
                'examples': true
            },
            'month': {
                'months': true
            }
        };
    }
};

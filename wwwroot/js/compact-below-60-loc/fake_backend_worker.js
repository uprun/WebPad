function fake_backend_worker()
{
    var self = this;

    // system functions
    this.listeners = {};

    this.reply = function(eventName, eventArgs) {
        if (eventName in this.listeners)
        {
            this.listeners[eventName].forEach(function(item, index) {
                item(eventArgs);
                });
        }
    };


    this.addListener = function(eventName, func)
    {
        if (eventName in this.listeners)
        {
            this.listeners[eventName].push(func);
        }
        else
        {
            this.listeners[eventName] = [func];
        }
    }
    this.sendQuery = function(queryMethod, queryMethodArguments)
    {
        lookup[queryMethod](queryMethodArguments);
        self.reply(queryMethod + '.finished');
    };
};

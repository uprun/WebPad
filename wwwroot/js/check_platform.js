lookup.platform_is_cordova = ko.observable(false);
lookup.platform_is_cordova_electron_mac = ko.observable(false);
lookup.platform_is_cordova_android = ko.observable(false);

lookup.check_platform = function()
{
    if(typeof(window.cordova) !== 'undefined')
    {
        lookup.platform_is_cordova(true);

        if(
            typeof(navigator) !== 'undefined' && 
            (navigator.platform === "MacIntel")
        )
        {
            lookup.platform_is_cordova_electron_mac(true);
        }
        else
        {
            lookup.platform_is_cordova_android(true);
        }
    }
};
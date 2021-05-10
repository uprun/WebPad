lookup.privacy_policy_link = ko.computed(function()
{
    if(lookup.platform_is_cordova())
    {
        //&& window.cordova.platformId !== "electron"
        if(lookup.platform_is_cordova_electron_mac())
        {
            return "file:///Applications/WebPad.app/Contents/Resources/app.asar/privacy_policy_mac.html";
        }
        else
        {
            return "file:///android_asset/www/privacy_policy_android.html";
        }
        
    }
    else
    {
        return "/privacy_policy.html";
    }
});
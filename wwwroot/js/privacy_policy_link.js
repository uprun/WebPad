lookup.platform_is_mobile = ko.observable(false);

lookup.check_platform = function()
{
    if (window.cordova && cordova.platformId !== "browser") {
        lookup.platform_is_mobile(true);
    }
};



lookup.privacy_policy_link = ko.computed(function()
{
    if(lookup.platform_is_mobile())
    {
        return "file:///android_asset/www/privacy_policy.html"
    }
    else
    {
        return "/privacy_policy.html"
    }
});
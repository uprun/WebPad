lookup.bodyOnClick = function(e)
{
    //console.log(event);

    if(lookup.menuIsOpen() || lookup.optionsIsOpen())
    {
        lookup.hideMenu();
        lookup.hideOptions();
    }

    lookup.showOmniBox();
};
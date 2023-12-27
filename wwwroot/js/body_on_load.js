lookup.body_on_load = function()
{
    console.log("body_on_load");
    lookup.on_resize();
    const menu_icon = document.getElementById("menu-icon-id");
    console.log(menu_icon);
    lookup.body_anchorWidth( menu_icon.offsetHeight);
};
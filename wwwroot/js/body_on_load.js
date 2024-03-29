lookup.body_on_load = function()
{
    console.log("body_on_load");
    lookup.on_resize();
    // 2023-12-28 this is a nice feature, but it is an extra feature
    window.addEventListener("popstate", (event) => {
        console.log(
          `location: ${document.location}, state: ${JSON.stringify(event.state)}`,
        );
      });
};
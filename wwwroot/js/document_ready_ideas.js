$(document).ready(function()
{
    var viewModel = new ConnectedNotesViewModel();
    ko.applyBindings(viewModel);

    var viewportWidth = $(window).width();
    var viewportHeight = $(window).height();

    viewModel.ViewPortWidth(viewportWidth);
    viewModel.ViewPortHeight(viewportHeight);

    $(window).resize(function() {
        var viewportWidth = $(window).width();
        var viewportHeight = $(window).height();
    
        viewModel.ViewPortWidth(viewportWidth);
        viewModel.ViewPortHeight(viewportHeight);
    });


    //setTimeout(viewModel.ActualGenerateConnections, 3000);
});
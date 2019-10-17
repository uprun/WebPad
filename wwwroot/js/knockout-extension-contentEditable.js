ko.bindingHandlers.htmlLazy = {
    init: function(element, valueAccessor) {
        var $element = $(element);
        var initialValue = ko.utils.unwrapObservable(valueAccessor());
        $element.html(initialValue);
      },
    update: function (element, valueAccessor) {
        var value = ko.unwrap(valueAccessor());
        
        if (!element.isContentEditable) {
            element.innerHTML = value;
        }
    }
};
ko.bindingHandlers.contentEditable = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var value = ko.unwrap(valueAccessor()),
            htmlLazy = allBindingsAccessor().htmlLazy;
        
        $(element).on("input", function () {
            if (this.isContentEditable && ko.isWriteableObservable(htmlLazy)) {
                var data = $(this); 
                htmlLazy(data.text());
            }
        });
    },
    update: function (element, valueAccessor) {
        var value = ko.unwrap(valueAccessor());
        
        element.contentEditable = value;
        
        if (!element.isContentEditable) {
            $(element).trigger("input");
        }
    }
};
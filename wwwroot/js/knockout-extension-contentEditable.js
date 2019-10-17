ko.bindingHandlers.htmlLazy = {
    init: function(element, valueAccessor) {
        var $element = $(element);
        var initialValue = ko.utils.unwrapObservable(valueAccessor());
        $element.text(initialValue);
      },
    update: function (element, valueAccessor) {
        var value = ko.unwrap(valueAccessor());
        var $element = $(element);
        
        if (!element.isContentEditable) {
            $element.text(value);
        }
    }
};
ko.bindingHandlers.contentEditable = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var value = ko.unwrap(valueAccessor()),
            htmlLazy = allBindingsAccessor().htmlLazy;
        $(element).on('paste', function (event) {
            event.preventDefault();
            document.execCommand('inserttext', false, event.originalEvent.clipboardData.getData('text/plain'));
        });
        
        $(element).on("input", function () {
            if (this.isContentEditable && ko.isWriteableObservable(htmlLazy)) {
                var data = $(this); 
                htmlLazy(data.text());
            }
        });
        $(element).focusout(function(){
            var data = $(this);        
            if (!data.text().replace(" ", "").length) {
                data.empty();
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
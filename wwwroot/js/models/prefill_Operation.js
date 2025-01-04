lookup.prefill_Operation = function(self, abc) {

    self.color = abc.color;
    self.text = abc.text;
    if(typeof(abc.color) === 'undefined')
    {
        self.color_border = "#ff12ff";
    }
    else
    {
        var color_with_components = lookup.split_color_from_6_hex(abc.color);

        self.color_border = lookup.form_rgba_string_constant(color_with_components, '0.6')
    }
    var all_words = abc.text.split(" ");

    //added by  https://github.com/uprun/WebPad/commit/94fd9c41916641fbafc4fb8d62f639e384f31349?diff=split&w=1
    // by suggestion from https://github.com/minaph
    if (globalThis?.TinySegmenter && lookup.option_use_Japanese_tokeniser()) 
    {
        console.log("TinySegmenter for Japanese language is working")
        var segmenter = new TinySegmenter();
        var segmented_words = [];
        for (const word of all_words) 
        {
            if (word.toLowerCase().startsWith("https://")) 
            {
                segmented_words.push(word);
            } 
            else 
            {
                segmented_words.push(...segmenter.segment(word));
            }
        }
        all_words = segmented_words;
    }
    // end of https://github.com/uprun/WebPad/commit/94fd9c41916641fbafc4fb8d62f639e384f31349?diff=split&w=1

    self.textSplitted = ko.utils.arrayMap(all_words, function (item) {
        var toSearch = item
            .replace("\r", " ")
            .replace("\n", " ")
            .replace("\t", " ")
            .toLowerCase()
            .trim();
        
        // if url then do nothing
        if(!toSearch.startsWith("https://"))
        {
            if (
                toSearch.endsWith(",")
                || toSearch.endsWith(".")
                || toSearch.endsWith("?")
                || toSearch.endsWith("!")) 
            {
                toSearch = toSearch.substring(0, toSearch.length - 1);
            }

        }
        
        return {
            word: item,
            wordQuery: toSearch
        };
    }
    );
};
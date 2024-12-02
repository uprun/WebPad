function fake_backend_worker()
{
    var self = this;
var lookup = {
};
lookup.Notes = ko.observableArray([]);
lookup.ColorPresets = ko.observableArray([]);
lookup.Connections = ko.observableArray([]);
lookup.history = ko.observableArray([]); 
lookup.first_to_render_note_data_stringified = undefined;
lookup.first_to_render_note_globalBottom = 0;
lookup.cards_container_height = ko.observable(10);
lookup.data_color_presets = [ 
    { 
        background: "inherit",
        color: "#ffa26b" 
    },
    { 
        background: "inherit",
        color: "#84bfff" 
    },
    { 
        background: "inherit",
        color: "#ff94eb" 
    },
    { 
        background: "inherit",
        color: "#64e05e" 
    },
    { 
        background: "inherit",
        color: "#f8e755" 
    },
    { 
        background: "inherit",
        color: "#ffbbdc" 
    },
    { 
        background: "inherit",
        color: "#d190ff" 
    },
    { 
        background: "inherit",
        color: "#ff8f95" 
    }
];;

lookup.populateColorPresets = function()
{
    var toAddColors = ko.utils.arrayMap(lookup.data_color_presets, function(elem) 
    {
        var toReturn = new lookup.model_ColorPreset(elem);
        return toReturn;
    });

    ko.utils.arrayPushAll(lookup.ColorPresets, toAddColors);

};

lookup.model_ColorPreset = function(data)
{

    var self = this;
    self.Background = ko.observable(data.background);
    self.Color = ko.observable(data.color);
    self.ConvertToJs = function() {
        return {
            Color: self.Color(),
            Background: self.Background()
        };
    };
};
lookup.model_Operation = function(data)
{
    var self = this;
    self.id = data.id;
    self.name = data.name;
    self.data = data.data;
    self.time = data.time;

    self.bottom_anchor = ko.observable(true);
    self.offset = ko.observable(0);
    self.offset_bottom = ko.computed(() => {
        if (self.bottom_anchor()) return self.offset();
        return  lookup.cards_container_height() - self.offset() - self.offsetHeight();
    });
    
    self.offsetHeight = ko.observable(0);

    self.globalOffset = ko.computed(() => {
        if (self.bottom_anchor()) return self.offset() + lookup.globalOffsetY();
        return self.offset() - lookup.globalOffsetY();
    } );

    self.on_screen_top_measured_from_bottom = ko.computed(() => {
        if (self.bottom_anchor()) return self.globalOffset() + self.offsetHeight();
        return self.offset_bottom() + lookup.globalOffsetY() + self.offsetHeight();
    });

    self.on_screen_bottom_measured_from_bottom = ko.computed(() => {
        if (self.bottom_anchor()) return self.globalOffset();
        return self.offset_bottom() + lookup.globalOffsetY();
    });

    self.visible = ko.computed(() => {
         var top = self.on_screen_top_measured_from_bottom();
         var bottom = self.on_screen_bottom_measured_from_bottom();
         var height = lookup.cards_container_height();
         // this is basically an inverse of invisibility rules
         var visible = top >= 0 && bottom <= height;
         return visible;
        });

    self.createDate = new Date(self.time);

    var date = "" + self.createDate.getFullYear() +
        "-" + ((self.createDate.getMonth() + 1) + "").padStart(2, "0") +
        "-" + (self.createDate.getDate() + "").padStart(2, "0");
    
    var time = (self.createDate.getHours() + "").padStart(2, "0") +
    ":" + (self.createDate.getMinutes() + "").padStart(2, "0") + 
    ":" + (self.createDate.getSeconds() + "").padStart(2, "0");

    self.createDateToOrder = date + "  " +  time;

    if(self.name === 'create')
    {
        lookup.prefill_Operation(self, self.data);
    }
    if(self.name === 'quote' || self.name === 'quote-edit')
    {
        lookup.prefill_Operation(self, self.data.current);
        self.quoted = {};
        lookup.prefill_Operation(self.quoted, self.data.quoted);
    }

    self.ConvertToJs = function()
    {
        var toReturn =
        {
            id: self.id,
            name: self.name,
            data: self.data,
            time: self.time
        };
        return toReturn;
    };

    self.toolBoxVisible = ko.observable(false);
    self.switchToolBoxVisibility = function()
    {
        self.toolBoxVisible(!self.toolBoxVisible());
        return true;
    };

    self.toTupleKey = function()
    {
        var key = {name: self.name, data: self.data};
        var toReturn = JSON.stringify(key);
        return toReturn;
    };
};

lookup.split_color_from_6_hex = function(color_in_6_hex)
{
    var hex_red = '0x' + color_in_6_hex.substring(1, 3);
    var hex_green = '0x' + color_in_6_hex.substring(3, 5);
    var hex_blue = '0x' + color_in_6_hex.substring(5, 7);
    var int_red = parseInt(hex_red, 16);
    var int_green = parseInt(hex_green, 16);
    var int_blue = parseInt(hex_blue, 16);
    var colorWithIntComponents = 
    {
        red: int_red,
        green: int_green,
        blue: int_blue
    };
    return colorWithIntComponents;
};

lookup.form_rgba_string_constant = function(color_with_components, alpha)
{
    var toReturn = 'rgba(' + color_with_components.red + ', ' + color_with_components.green + ', ' + color_with_components.blue + ', ' + alpha +')' ;
    return toReturn;
};

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
}
lookup.get_Operation_Index = function() {
    var toReturn = 
    {
        is_local: true,
        prefix: "to-be-defined"
    }
    return toReturn;
};
lookup.GetRandomColor = function() {
    var selectedColorIndex = Math.floor(Math.random() * lookup.ColorPresets().length);
    var selectedColor = lookup.ColorPresets()[selectedColorIndex];
    return selectedColor;
};
lookup.SearchNotesQuery = ko.observable("");
// lookup.SearchNotesQuery
//     .extend({ rateLimit: 150 });

lookup.SearchNotesQuery
    .subscribe(function()
    {
        if(typeof(lookup.backendWorker) !== 'undefined')
        {
            lookup.backendWorker.sendQuery('SearchNotesQuery', lookup.SearchNotesQuery());

        }
        
    });
lookup.populate_Operations = function(data) {

    var buffer = [];
    
    buffer = ko.utils.arrayMap(
        data.Operations, 
        function(elem)
        {
            return new lookup.model_Operation(elem);
        }
    );

    ko.utils.arrayPushAll(lookup.Operations, buffer);

    var distinctBuffer = {};

    ko.utils.arrayForEach
    (
        lookup.Operations(), 
        function(item) 
        {
            var key = item.toTupleKey();
            if(typeof(distinctBuffer[key]) !== 'undefined')
            {
                distinctBuffer[key].push(item);
            }
            else
            {
                distinctBuffer[key] = [item];
            }
        }
    );

    const distinctKeys = Object.keys(distinctBuffer);
    var toUseArray = [];

    distinctKeys.forEach((key, index) => {
        var localGroup = distinctBuffer[key];
        var sortedLocalGroup = localGroup.sort
        (
            (first, second) => first.time - second.time
        );
        toUseArray.push(sortedLocalGroup[0]);
    });

    var sortedDistinctObjects = toUseArray.sort((first, second) => first.time - second.time);

    lookup.Operations(sortedDistinctObjects);

};

lookup.Operation_was_added = function(data) {
    // backend-worker context
    var toAdd = new lookup.model_Operation(data);
    lookup.Operations.push(toAdd);
};
lookup.demo_notes_en = [
    {
        "id": {
            "is_local": true,
            "prefix": "to-be-defined"
        },
        "name": "create",
        "data": {
            "text": "WebPad is a wiki, personal-wiki",
            "color": "#ffa26b"
        },
        "time": "2020-04-18T13:16:53.119Z"
    },
    {
        "id": {
            "is_local": true,
            "prefix": "to-be-defined"
        },
        "name": "create",
        "data": {
            "text": "actually WebPad is a non-hierarchical notes app",
            "color": "#ffbbdc"
        },
        "time": "2020-04-18T14:59:51.957Z"
    },
    {
        "id": {
            "is_local": true,
            "prefix": "to-be-defined"
        },
        "name": "create",
        "data": {
            "text": "every word is a hashtag by default, try it - click any word",
            "color": "#84bfff"
        },
        "time": "2020-04-18T14:59:54.957Z"
    },
    {
        "id": {
            "is_local": true,
            "prefix": "to-be-defined"
        },
        "name": "quote",
        "data": {
            "quoted": {
                "text": "you can quote",
                "color": "#ff94eb"
            },
            "current": {
                "text": "try to click on empty space",
                "color": "#64e05e"
            }
        },
        "time": "2020-04-18T15:04:12.836Z"
    },
    {
        "id": {
            "is_local": true,
            "prefix": "to-be-defined"
        },
        "name": "create",
        "data": {
            "text": "app for Android is here https://play.google.com/store/apps/details?id=ua.com.webpad",
            "color": "#ffbbdc"
        },
        "time": "2020-04-18T15:15:29.295Z"
    },
    {
        "id": {
            "is_local": true,
            "prefix": "to-be-defined"
        },
        "name": "create",
        "data": {
            "text": "try out a search bar at the bottom",
            "color": "#ff8f95"
        },
        "time": "2020-04-18T15:19:04.446Z"
    }
];
lookup.empty_note = 
{
    "id": {
        "is_local": true,
        "prefix": "to-be-defined"
    },
    "name": "create",
    "data": {
        "text": "",
        "color": "#ffa26b"
    },
    "time": "2023-12-15T13:16:53.119Z"
};
lookup.option_show_help_demo_notes = ko.observable(false);
lookup.set_option_show_help_demo_notes_to_true = function() 
{
    if (typeof(lookup) === "undefined") return;
    if (typeof(lookup.localStorage) === "undefined") return;
    lookup.option_show_help_demo_notes(true);
    lookup.localStorage["option_show_help_demo_notes"] = true;
    lookup.send_to_worker_update_for_option_show_help_demo_notes();
};

lookup.set_option_show_help_demo_notes_to_false = function() 
{
    if (typeof(lookup) === "undefined") return;
    if (typeof(lookup.localStorage) === "undefined") return;
    lookup.option_show_help_demo_notes(false);
    lookup.localStorage["option_show_help_demo_notes"] = false;
    lookup.send_to_worker_update_for_option_show_help_demo_notes();
};

lookup.apply_saved_option_show_help_demo_notes = function() 
{
    var stored = lookup.localStorage["option_show_help_demo_notes"] === "true";
    lookup.option_show_help_demo_notes(stored);
    lookup.send_to_worker_update_for_option_show_help_demo_notes();
};

lookup.for_worker_apply_changes_in_option_show_help_demo_notes = function(newValue)
{
    lookup.option_show_help_demo_notes(newValue);
};

lookup.send_to_worker_update_for_option_show_help_demo_notes = function()
{
    if(typeof(lookup.backendWorker) !== 'undefined')
    {
        const valueToSend = lookup.option_show_help_demo_notes();
        lookup.backendWorker.sendQuery('for_worker_apply_changes_in_option_show_help_demo_notes', valueToSend);
    }
    
};
lookup.option_use_Japanese_tokeniser = ko.observable(false);
lookup.set_option_use_Japanese_tokeniser_to_true = function() 
{
    lookup.option_use_Japanese_tokeniser(true);
    lookup.localStorage["option_use_Japanese_tokeniser"] = true;
    lookup.send_to_worker_update_for_option_use_Japanese_tokeniser();
};

lookup.set_option_use_Japanese_tokeniser_to_false = function() 
{
    lookup.option_use_Japanese_tokeniser(false);
    lookup.localStorage["option_use_Japanese_tokeniser"] = false;
    lookup.send_to_worker_update_for_option_use_Japanese_tokeniser();
};

lookup.apply_saved_option_use_Japanese_tokeniser = function() 
{
    var stored = lookup.localStorage["option_use_Japanese_tokeniser"] === "true";
    lookup.option_use_Japanese_tokeniser(stored);
    lookup.send_to_worker_update_for_option_use_Japanese_tokeniser();
};

lookup.for_worker_apply_changes_in_option_use_Japanese_tokeniser = function(newValue)
{
    lookup.option_use_Japanese_tokeniser(newValue);
};

lookup.send_to_worker_update_for_option_use_Japanese_tokeniser = function()
{
    if(typeof(lookup.backendWorker) !== 'undefined')
    {
        const valueToSend = lookup.option_use_Japanese_tokeniser();
        lookup.backendWorker.sendQuery('for_worker_apply_changes_in_option_use_Japanese_tokeniser', valueToSend);
    }
    
};
lookup.find_aliases = function(query)
    {
        // backend-worker context
        if ("Aliases" in lookup)
        {}
        else
        {
            lookup.Aliases = {};
        }
        query = query.trim().toLowerCase();
        const found_aliases = lookup.Aliases[query];
        if(typeof(found_aliases) === 'undefined')
        {
            return [];
        }
        else
        {
            return Object.getOwnPropertyNames(found_aliases).filter(element => found_aliases[element]);
        }
    };
lookup.import_Operations = function(data) {
    // needed in order to know when to call 'regenerate_Aliases'

    lookup.populate_Operations(data);

};
lookup.remove_Alias = function(left, right)
{
    // backend-worker context
    if( typeof(lookup.Aliases[left]) === 'undefined')
    {
        lookup.Aliases[left] = {};
    }
    lookup.Aliases[left][right] = false;
};
lookup.globalOffsetY = ko.observable(0);
lookup.globalOffsetX = ko.observable(0);
lookup.globalMaxY = ko.observable(800);
lookup.globalMinY = ko.observable(800);
lookup.globalScreenHeight = ko.observable(800);



lookup.resetGlobalOffsetY = function()
{
    lookup.globalOffsetY(0);
};

lookup.update_global_scroll_limits = function()
{
    
    lookup.globalScreenHeight(window.innerHeight);

    //lookup.globalMaxY(-total_scrollable_height + window.innerHeight * 0.05);
    //lookup.globalMinY(window.innerHeight * 0.6);
    
    //console.log("height scroll limits:", lookup.globalMinY(), lookup.globalMaxY());
};





lookup.actions = 
{
    NoteUpdated: 'NoteUpdated',
    ConnectionUpdated: 'ConnectionUpdated',
    NoteAdded: 'NoteAdded',
    NoteDeleted: 'NoteDeleted',
    ConnectionAdded: 'ConnectionAdded',
    ConnectionDeleted: 'ConnectionDeleted',
    PositionsUpdated: 'PositionsUpdated',
    HealthCheckRequest: 'HealthCheckRequest',
    HealthCheckIdsProposal: 'HealthCheckIdsProposal'

};

lookup.hashCards = {};

lookup.populateColorPresets();

lookup.CurrentResultLimit = ko.observable(45);


// in Operations fisrt ones are the oldest one, or at least they will be after first save
lookup.Operations = ko.observableArray([]);

lookup
    .Operations
    .extend(
        { 
            rateLimit: 500 
        }
    )
    .subscribe(
        on_operations_changed,
        null, 
        "arrayChange"
    );

    lookup.Operations_And_Options = ko.pureComputed(
        function()
        {
            const show_demo_notes = lookup.option_show_help_demo_notes();
            const use_Japanese_tokeniser = lookup.option_use_Japanese_tokeniser(); // fictional use of option to refresh observable on change of the option
            if(lookup.Operations().length == 0 || show_demo_notes)
            {
                var demo_operations = ko.utils.arrayMap(
                    lookup.demo_notes_en,
                    function(item)
                    {
                        return new lookup.model_Operation(item);
                    }
                );
                var combined_result = [].concat(demo_operations, lookup.Operations());
                return combined_result;
            }
            if (use_Japanese_tokeniser)
            {
                var combined_result = [].concat([new lookup.model_Operation(lookup.empty_note)], lookup.Operations()); // combining with empty note, hope it will refresh set
                return combined_result;
            }
            
            return lookup.Operations();
        }
    );

    

    lookup.FilteredOperations = ko.pureComputed
        (
            function()
            {                
                var search_query = lookup.SearchNotesQuery().trim().toLowerCase();
                var operationsToWorkWith = lookup.Operations_And_Options();
                if(search_query.length === 0)
                {
                    return operationsToWorkWith;
                }
                else
                {
                    const first_jump = lookup.find_aliases(search_query);
                    const second_jump = first_jump.flatMap(first => lookup.find_aliases(first));
                    // [2022-01-09] Aliases should search only by backward-index (from word to note)
                    // [2022-01-09] if search query matches any present word then it should search by word-backward-index
                    var aliases = [].concat([search_query], first_jump, second_jump)
                        .filter(query => query.length > 0);
                    var reduced = aliases.reduce((ac, elem) => { ac[elem] = true; return ac;}, {});
                    aliases = Object.getOwnPropertyNames(reduced);
                    console.log(aliases);
                    // classic search approach
                    const filtered_operations = ko.utils.arrayFilter
                    (
                        operationsToWorkWith,
                        function(item, index)
                        {
                            if(item.name === 'create')
                            {
                                var searchResult =  aliases.some( query => item.data.text.toLowerCase().indexOf(query) >= 0);
                                return searchResult;
                            }
                            else
                            {
                                if(item.name === 'quote' || item.name === 'quote-edit')
                                {
                                    var searchResult1 = aliases.some( query => item.data.quoted.text.toLowerCase().indexOf(query) >= 0);
                                    var searchResult2 = aliases.some( query => item.data.current.text.toLowerCase().indexOf(query) >= 0);
                                    return searchResult1 || searchResult2;
                                }
                                else
                                {
                                    return false;
                                }
                            }
                        }
              
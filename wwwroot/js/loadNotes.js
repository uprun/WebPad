
lookup.loadNotes = function()
    {
        var data = {};
        if(typeof(lookup.localStorage["Operations"]) !== 'undefined')
        {
            data.Operations = JSON.parse(lookup.localStorage.getItem("Operations"));
            data.free_Operation_Index = JSON.parse(lookup.localStorage.getItem("free_Operation_Index"));
            lookup.backendWorker.sendQuery('populate_Operations', data);
        }
        else
        {
            if(lookup.localStorage["Notes"]){
            
            
                data.notes = JSON.parse(lookup.localStorage.getItem("Notes"));
                data.connections = JSON.parse(lookup.localStorage.getItem("Connections"));
                //lookup.populate(data);
                lookup.backendWorker.addListener('populate.finished', function()
                {
                    console.log('populate.finished');
                    lookup.backendWorker.sendQuery('migrate_to_Operations', data);
                });
                lookup.backendWorker.sendQuery('populate', data);
            }
            else
            {
                // demo notes
                data.notes = [{"id":"_local_1","text":"WebPad","color":"#84bfff","background":"inherit","createDate":"2020-04-18T14:58:45.862Z","isDone":false},{"id":"_local_3","text":"wiki","color":"#ff8f95","background":"inherit","createDate":"2020-04-18T14:58:56.207Z","isDone":false},{"id":"_local_7","text":"notes taking app","color":"#64e05e","background":"inherit","createDate":"2020-04-18T14:59:07.373Z","isDone":false},{"id":"_local_11","text":"you can have a task like this saved in WebPad","color":"#ff94eb","background":"inherit","createDate":"2020-04-18T14:59:50.517Z","isDone":false},{"id":"_local_13","text":"task","color":"#84bfff","background":"inherit","createDate":"2020-04-18T14:59:54.957Z","isDone":false},{"id":"_local_17","text":"you can find additional tools if you click [..]","color":"#64e05e","background":"inherit","createDate":"2020-04-18T15:00:50.676Z","isDone":false},{"id":"_local_19","text":"task can be marked as done if you click [o]","color":"#ffbbdc","background":"inherit","createDate":"2020-04-18T15:01:29.956Z","isDone":true},{"id":"_local_21","text":"task","color":"#ff8f95","background":"inherit","createDate":"2020-04-18T15:01:35.353Z","isDone":false},{"id":"_local_26","text":"you can add either tag either quote it depends on length of text","color":"#ff94eb","background":"inherit","createDate":"2020-04-18T15:03:36.195Z","isDone":false},{"id":"_local_30","text":"quote example","color":"#64e05e","background":"inherit","createDate":"2020-04-18T15:04:12.836Z","isDone":false},{"id":"_local_34","text":"wiki","color":"#64e05e","background":"inherit","createDate":"2020-04-18T15:12:28.569Z","isDone":false},{"id":"_local_36","text":"entity","color":"#ffa26b","background":"inherit","createDate":"2020-04-18T15:12:39.088Z","isDone":false},{"id":"_local_42","text":"mobile system","color":"#ff94eb","background":"inherit","createDate":"2020-04-18T15:14:43.135Z","isDone":false},{"id":"_local_46","text":"operating system","color":"#ffa26b","background":"inherit","createDate":"2020-04-18T15:14:54.136Z","isDone":false},{"id":"_local_51","text":"you can find Android app here https://play.google.com/store/apps/details?id=ua.com.webpad","color":"#ffbbdc","background":"inherit","createDate":"2020-04-18T15:15:29.295Z","isDone":false},{"id":"_local_53","text":"personal-wiki","color":"#64e05e","background":"inherit","createDate":"2020-04-18T15:16:07.127Z","isDone":false},{"id":"_local_55","text":"personal-wiki allows you to create inter-connected notes","color":"#ff8f95","background":"inherit","createDate":"2020-04-18T15:16:33.118Z","isDone":false},{"id":"_local_57","text":"WebPad is a personal-wiki","color":"#ff94eb","background":"inherit","createDate":"2020-04-18T15:16:53.119Z","isDone":false},{"id":"_local_59","text":"try out search bar at bottom of the page you can create notes through it","color":"#ff8f95","background":"inherit","createDate":"2020-04-18T15:19:04.446Z","isDone":false}];
                data.connections = [{"id":"_local_5","SourceId":"_local_1","DestinationId":"_local_3","label":""},{"id":"_local_9","SourceId":"_local_1","DestinationId":"_local_7","label":""},{"id":"_local_15","SourceId":"_local_11","DestinationId":"_local_13","label":""},{"id":"_local_23","SourceId":"_local_19","DestinationId":"_local_21","label":""},{"id":"_local_28","SourceId":"_local_1","DestinationId":"_local_26","label":""},{"id":"_local_32","SourceId":"_local_26","DestinationId":"_local_30","label":""},{"id":"_local_38","SourceId":"_local_34","DestinationId":"_local_36","label":""},{"id":"_local_44","SourceId":"_local_40","DestinationId":"_local_42","label":""},{"id":"_local_48","SourceId":"_local_40","DestinationId":"_local_46","label":""}];
                lookup.populate(data);
            }

        }
        
        lookup.scrollToCard_processQueue();
    };
$(document).ready(function()
{
    
    // create an array with nodes
    var nodes = new vis.DataSet([
    ]);

    // create an array with edges
    var edges = new vis.DataSet([
    ]);

    // create a network
    var container = document.getElementById('mygraph');
    var data = {
        nodes: nodes,
        edges: edges
    };
    //#2b7ce9
    var options = 
    {
        edges: 
            {
                "smooth": {
                    "type": "continuous",
                    "forceDirection": "none"
                  },
                font:
                    {
                        color: '#ffa500',
                        background: 'none',
                        strokeWidth: 0, //px
                    }

            },
        nodes: 
            {
                chosen:
                {
                    node: false
                },

            },
        
        "physics": {
            "enabled": false,
            "minVelocity": 0.75
        }

    };

    var network = new vis.Network(container, data, options);

    storageForCallBacks.note.added = function (added) {
        console.log('storageForCallBacks.note.added');
        var color_to_apply_background = added.background;
        if(typeof(color_to_apply_background) == "undefined" || color_to_apply_background == null)
        {
            color_to_apply_background = '#97c2fc';
        }
        var color_to_apply_font = added.color;
        if(typeof(color_to_apply_font) == "undefined" || color_to_apply_font == null)
        {
            color_to_apply_font = '#333333';
        }

        var toAdd = {
            id: added.id,
            label: added.text,
            shape: 'box',
            color: 
            {
                background: color_to_apply_background,
                border:'#4385de'
            },
            font:
                {
                    color: color_to_apply_font
                } 
         };
        if(typeof(added.x) != "undefined")
        {
            toAdd.x = added.x;
        }

        if(typeof(added.y) != "undefined")
        {
            toAdd.y = added.y;
        }
        nodes.add( toAdd );
    };

    storageForCallBacks.note.updated = function(changed) {
        console.log('storageForCallBacks.note.updated');
        var color_to_apply_background = changed.background;
        if(typeof(color_to_apply_background) == "undefined" || color_to_apply_background == null)
        {
            color_to_apply_background = '#97c2fc';
        }
        var color_to_apply_font = changed.color;
        if(typeof(color_to_apply_font) == "undefined" || color_to_apply_font == null)
        {
            color_to_apply_font = '#333333';
        }
        nodes.update(
            {
                id: changed.id, 
                label: changed.text,
                color: 
                    {
                        background: color_to_apply_background,
                        border:'#4385de'
                    },
                font:
                    {
                        color: color_to_apply_font
                    },
                x: changed.x,
                y: changed.y
            }
        ); 
    };

    storageForCallBacks.note.highlight = function(node, level) {
        console.log('storageForCallBacks.note.highlight');
        if(level == 0)  
        {
            var color_to_apply_background = node.background;
            if(typeof(color_to_apply_background) == "undefined" || color_to_apply_background == null)
            {
                color_to_apply_background = '#97c2fc';
            }
            var color_to_apply_font = node.color;
            if(typeof(color_to_apply_font) == "undefined" || color_to_apply_font == null)
            {
                color_to_apply_font = '#333333';
            }
            nodes.update(
                {
                    id: node.id,
                    color: 
                    {
                        background: color_to_apply_background,
                        border:'#4385de'
                    },
                    font:
                        {
                            color: color_to_apply_font
                        }
                }
            );
        }
        if(level == 1)  
        {
            nodes.update(
                {
                    id: node.id,
                    color: 
                    {
                        background: 'rgb(255,168,7)',
                        border:'#4385de'
                    },
                    font:
                        {
                            color: '#333333'
                        }
                }
            );
        }
        if(level == 2)
        {
            nodes.update(
                {
                    id: node.id,
                    color: 
                    {
                        background: 'rgb(255,168,7)',
                        border:'#4385de'
                    },
                    font:
                        {
                            color: '#333333'
                        }
                }
            );
        }
        
    };

    

    storageForCallBacks.note.removed = function(node) {
        console.log('storageForCallBacks.note.removed');
        nodes.remove(node.id);
    };

    storageForCallBacks.note.applySelection = function(id) {
        console.log('storageForCallBacks.note.applySelection');
        network.selectNodes([id], true);

    };

    storageForCallBacks.note.initialLoad = function (nodesList) {
        console.log('storageForCallBacks.note.initialLoad');
        var toAddNodes = ko.utils.arrayMap(nodesList, function(added) {
            var color_to_apply_background = added.background;
            if(typeof(color_to_apply_background) == "undefined" || color_to_apply_background == null)
            {
                color_to_apply_background = '#97c2fc';
            }
            var color_to_apply_font = added.color;
            if(typeof(color_to_apply_font) == "undefined" || color_to_apply_font == null)
            {
                color_to_apply_font = '#333333';
            }
            var toAdd = {
                id: added.id, 
                label: added.text, 
                shape: 'box',
                color: 
                    {
                        background: color_to_apply_background,
                        border:'#4385de'
                    },
                font:
                    {
                        color: color_to_apply_font
                    }
             };
            if(typeof(added.x) != "undefined")
            {
                toAdd.x = added.x;
            }

            if(typeof(added.y) != "undefined")
            {
                toAdd.y = added.y;
            }
            return toAdd;
        });
        
        nodes.add( toAddNodes );
    };

    storageForCallBacks.connection.added = function(connectionAdded) {
        var config = {
            id: connectionAdded.id,
            from: connectionAdded.SourceId,
            to: connectionAdded.DestinationId,
            arrows: 'to',
            label: connectionAdded.label,
            font: { align: 'top' } 
        };
        if(connectionAdded.generated)
        {
            config.font.color = '#19bd11';
        }
        edges.add(config);
    };

    storageForCallBacks.connection.updated = function(connectionUpdated) {
        edges.update({
            id: connectionUpdated.id,
            label: connectionUpdated.label
        });
    };

    storageForCallBacks.connection.removed = function(connection) {
        edges.remove(connection.id);
    };

    storageForCallBacks.connection.initialLoad = function(connectionsList) {
        var edgesToAdd = ko.utils.arrayMap(connectionsList, function(connectionAdded) {
            var config = {
                id: connectionAdded.id,
                from: connectionAdded.SourceId,
                to: connectionAdded.DestinationId,
                arrows: 'to',
                label: connectionAdded.label,
                font: { align: 'top' }
                };
            if(connectionAdded.generated)
            {
                config.font.color = '#19bd11';
            }
            return config;
        });

        edges.add(edgesToAdd);

    };

    storageForCallBacks.view.getFocusCoordinates = function() {
        var result = network.getViewPosition();
        result.scale = network.getScale();
        return result;
    };

    storageForCallBacks.view.setFocusCoordinates = function(viewPosition) {
        return network.moveTo(
            {
                position: 
                    {
                        x: viewPosition.x,
                        y: viewPosition.y
                    },
                scale: viewPosition.scale,
                animation: 
                    {
                        duration: 500,
                        easingFunction: 'easeOutCubic'
                    }
            }
        );
    };

    storageForCallBacks.view.setFocusOnNode = function(id) {
        var nodesPositions = network.getPositions([id]);
        return network.moveTo(
            {
                position: nodesPositions[id],
                scale: 1.2,
                animation: 
                    {
                        duration: 500,
                        easingFunction: 'easeOutCubic'
                    }
            }
        );
    };
    
    var viewModel = new ConnectedNotesViewModel();
    ko.applyBindings(viewModel);

    network.on("selectEdge", function (params) {
        if(params 
            && params.edges 
            && params.edges.length
            && params.edges.length == 1
            && params.nodes.length == 0 )
        {
            viewModel.DeselectNoteToEdit();
            viewModel.SelectEdgeToEdit(params.edges[0]);
        }
    });
    
    network.on("deselectEdge", function (params) {
        viewModel.DeselectEdgeToEdit();
    });


    network.on("selectNode", function (params) {
        viewModel.DeselectEdgeToEdit();
        viewModel.SelectNoteToEdit(params.nodes[0]);
    });

    network.on("dragStart", function (params) {
        if(params 
            && params.edges 
            && params.edges.length
            && params.edges.length == 1
            && params.nodes.length == 0 )
        {
            viewModel.DeselectNoteToEdit();
            viewModel.SelectEdgeToEdit(params.edges[0]);
        }

        if(params 
            && params.nodes.length == 1 )
        {
            viewModel.DeselectEdgeToEdit();
            viewModel.SelectNoteToEdit(params.nodes[0]);
        }
    });

    network.on("deselectNode", function (params) {
        viewModel.DeselectNoteToEdit();
        if(params 
            && params.edges 
            && params.edges.length
            && params.edges.length == 1
            && params.nodes.length == 0 )
        {
            viewModel.SelectEdgeToEdit(params.edges[0]);
        }
    });

    network.on("stabilizationIterationsDone", function(params) {
        //network.getPositions();
    });

    network.on("stabilized", function(params) {
        //var positions = network.getPositions();
        //viewModel.UpdatePositionsOfNodes(positions);
    });

    network.on("dragEnd", function (params) {
        if(params.nodes.length > 0)
        {
            var positions = network.getPositions(params.nodes);
            viewModel.UpdatePositionsOfNodes(positions);
        }
    });

    network.on("release", function(params) {
        
        viewModel.ViewPortUpdated();
    });
    network.on("zoom", function(params) {
        viewModel.ViewPortUpdated();
    });

    network.on("animationFinished", function(params) {
        viewModel.ViewPortUpdated();
    });

    setTimeout(viewModel.ActualGenerateConnections, 3000);
    


    
});
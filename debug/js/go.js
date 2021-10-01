(function () {
  Object.assign(document.currentScript, {
    modelDigraph(data){
      const schemas = $().schemas();
      (async () => {
        const element = this.elem;
        function init() {
          if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
          var $ = go.GraphObject.make;  // for conciseness in defining templates
          var make = $;
          myDiagram =
          $(go.Diagram, element,  // must be the ID or reference to div
            {
              initialAutoScale: go.Diagram.UniformToFill,
              initialContentAlignment : go.Spot.Center,
              "commandHandler.zoomFactor": 1.01,
              layout: $(go.LayeredDigraphLayout)
              // other Layout properties are set by the layout function, defined below
            });
            // define the Node template
            myDiagram.nodeTemplate =
            $(
              go.Node,
              "Spot",
              {
                locationSpot: go.Spot.Center
              },
              $(
                go.Shape,
                "Rectangle",
                {
                  fill: "lightgray",  // the initial value, but data binding may provide different value
                  stroke: null,
                  desiredSize: new go.Size(120, 30)
                },
                new go.Binding("fill", "fill")
              ),
              $(
                go.TextBlock,
                new go.Binding("text", "text")
              )
            );
            // define the Link template to be minimal
            myDiagram.linkTemplate =
            $(go.Link,
              { selectable: false },
              $(go.Shape,
                {
                  strokeWidth: 3,
                  // stroke: "#333",
                  // stroke: "red",
                },
                new go.Binding("stroke", "stroke"),
              )
            );
            fill = make(go.Brush, "Radial", { 0: "rgb(240, 240, 240)", 0.3: "rgb(240, 240, 240)", 1: "rgba(240, 240, 240, 0)" } );
            shape = make(go.Shape, { fill: fill, stroke: null } );
            textBlock = make(go.TextBlock, { textAlign: "center", font: "10pt helvetica, arial, sans-serif", stroke: "#555555", margin: 4 }, new go.Binding("text", "text") );
            let link = make(go.Panel, "Auto", shape, textBlock );
            let linkFrom = make(go.Shape, { stroke: "color" });
            let linkTo = make(go.Shape, { toArrow: "standard", stroke: null });
            // replace the default Link template in the linkTemplateMap
            myDiagram.linkTemplate = make(go.Link, linkFrom, linkTo, link);
            // generate a tree with the default values
            // nodeArray = [
            //   {key:1, text:'1', fill:go.Brush.randomColor()},
            //   {key:2, text:'1', fill:go.Brush.randomColor()},
            // ];
            // linkArray = [
            //   { from: 1, to: 2 }
            // ];
            //console.log(data.items);
            function getSchema(schemaPath) {
              // console.log(schemaPath, schemas.get(schemaPath));
              // , $().schemas().has(schemaPath));
              // console.log($().schemas().get(schemaPath));
              return schemas.get(schemaPath) || {};
              // return schemaPath.split(':').filter(schemaName => $().schemas().has(schemaName)).map(schemaName => $().schemas().get(schemaName)).shift() || {};
            }
            // data.items.forEach(item => item.fill = go.Brush.randomColor());
            // data.items.forEach(item => item.fill = 'blue');
            data.items.forEach(item => item.fill = getSchema(item.schemaPath).color || 'red');
            // data.items.forEach(item => {
            //   console.log(item);
            //   item.fill = 'red';
            // });
            colors = {
              link: 'red',
              parent: 'green',
              copyfrom: 'blue',
            };
            data.links.forEach(link => link.stroke = colors[link.category] );
            myDiagram.model.nodeDataArray = data.items;//nodeArray;
            myDiagram.model.linkDataArray = data.links;//linkArray;
            layout();
          }
          function layout() {
            myDiagram.startTransaction("change Layout");
            var lay = myDiagram.layout;
            lay.direction = 180;
            lay.direction = 0;
            lay.direction = 90;
            lay.direction = 270;
            lay.layerSpacing = 25;
            lay.columnSpacing = 25;
            lay.cycleRemoveOption = go.LayeredDigraphLayout.CycleDepthFirst;
            lay.cycleRemoveOption = go.LayeredDigraphLayout.CycleGreedy;
            lay.layeringOption = go.LayeredDigraphLayout.LayerLongestPathSource;
            lay.layeringOption = go.LayeredDigraphLayout.LayerLongestPathSink;
            lay.layeringOption = go.LayeredDigraphLayout.LayerOptimalLinkLength;
            lay.initializeOption = go.LayeredDigraphLayout.InitDepthFirstOut;
            lay.initializeOption = go.LayeredDigraphLayout.InitDepthFirstIn;
            lay.initializeOption = go.LayeredDigraphLayout.InitNaive;
            lay.aggressiveOption = go.LayeredDigraphLayout.AggressiveNone;
            lay.aggressiveOption = go.LayeredDigraphLayout.AggressiveMore;
            lay.aggressiveOption = go.LayeredDigraphLayout.AggressiveLess;
            lay.packOption = parseInt(0, 10);
            // lay.packOption |= parseInt(1, 10);
            // lay.packOption |= parseInt(2, 10);
            lay.packOption |= parseInt(4, 10);
            lay.setsPortSpots = false;
            myDiagram.commitTransaction("change Layout");
            myDiagram.alignDocument(go.Spot.Center, go.Spot.Center);
            // return;
            //
            // var direction = getRadioValue("direction");
            // direction = parseFloat(direction, 10);
            // lay.direction = direction;
            //
            // var layerSpacing = document.getElementById("layerSpacing").value;
            // layerSpacing = parseFloat(layerSpacing, 10);
            // lay.layerSpacing = layerSpacing;
            //
            // var columnSpacing = document.getElementById("columnSpacing").value;
            // columnSpacing = parseFloat(columnSpacing, 10);
            // lay.columnSpacing = columnSpacing;
            //
            // var cycleRemove = getRadioValue("cycleRemove");
            // if (cycleRemove === "CycleDepthFirst") lay.cycleRemoveOption = go.LayeredDigraphLayout.CycleDepthFirst;
            // else if (cycleRemove === "CycleGreedy") lay.cycleRemoveOption = go.LayeredDigraphLayout.CycleGreedy;
            //
            // var layering = getRadioValue("layering");
            // if (layering === "LayerOptimalLinkLength") lay.layeringOption = go.LayeredDigraphLayout.LayerOptimalLinkLength;
            // else if (layering === "LayerLongestPathSource") lay.layeringOption = go.LayeredDigraphLayout.LayerLongestPathSource;
            // else if (layering === "LayerLongestPathSink") lay.layeringOption = go.LayeredDigraphLayout.LayerLongestPathSink;
            //
            // var initialize = getRadioValue("initialize");
            // if (initialize === "InitDepthFirstOut") lay.initializeOption = go.LayeredDigraphLayout.InitDepthFirstOut;
            // else if (initialize === "InitDepthFirstIn") lay.initializeOption = go.LayeredDigraphLayout.InitDepthFirstIn;
            // else if (initialize === "InitNaive") lay.initializeOption = go.LayeredDigraphLayout.InitNaive;
            //
            // var aggressive = getRadioValue("aggressive");
            // if (aggressive === "AggressiveLess") lay.aggressiveOption = go.LayeredDigraphLayout.AggressiveLess;
            // else if (aggressive === "AggressiveNone") lay.aggressiveOption = go.LayeredDigraphLayout.AggressiveNone;
            // else if (aggressive === "AggressiveMore") lay.aggressiveOption = go.LayeredDigraphLayout.AggressiveMore;
            //
            // //TODO implement pack option
            // var pack = document.getElementsByName("pack");
            // var packing = 0;
            // for (var i = 0; i < pack.length; i++) {
            //   if (pack[i].checked) packing = packing | parseInt(pack[i].value, 10);
            // }
            // lay.packOption = packing;
            //
            // var setsPortSpots = document.getElementById("setsPortSpots");
            // lay.setsPortSpots = setsPortSpots.checked;
            //
            // myDiagram.commitTransaction("change Layout");
          }
          init();
        })();
        return this;
      },
    modelLinks(data){
      (async () => {
        // $.amcharts4core = $.amcharts4core = await this.script('/api/lib/amcharts4/core.js');
        await importScript('graph.js');
        // $.importGraph = $.importGraph = await this.script('https://aliconnect.nl/v1/api/js/graph.js');
        // return;
        const make = go.GraphObject.make;  // for conciseness in defining templates
        const diagram = make(go.Diagram, this.elem, {
          initialAutoScale: go.Diagram.Uniform,  // an initial automatic zoom-to-fit
          contentAlignment: go.Spot.Center,  // align document to the center of the viewport
          layout: make(go.ForceDirectedLayout, {
            maxIterations: 200,
            defaultSpringLength: 30,
            defaultElectricalCharge: 100
          })
        });
        // define each Node's appearance
        let fill = make(go.Brush, "Linear", { 0: "rgb(254, 201, 0)", 1: "rgb(254, 162, 0)" } );
        let shape = make(go.Shape, "RoundedRectangle", { fill: fill, stroke: "black" }, new go.Binding("fill", "fill") );
        let textBlock = make(go.TextBlock, { font: "bold 10pt helvetica, bold arial, sans-serif", margin: 4 }, new go.Binding("text", "text") );
        diagram.nodeTemplate = make(go.Node, "Auto", { locationSpot: go.Spot.Center }, shape, textBlock);
        fill = make(go.Brush, "Radial", { 0: "rgb(240, 240, 240)", 0.3: "rgb(240, 240, 240)", 1: "rgba(240, 240, 240, 0)" } );
        shape = make(go.Shape, { fill: fill, stroke: null } );
        textBlock = make(go.TextBlock, { textAlign: "center", font: "10pt helvetica, arial, sans-serif", stroke: "#555555", margin: 4 }, new go.Binding("text", "text") );
        let link = make(go.Panel, "Auto", shape, textBlock );
        let linkFrom = make(go.Shape, { stroke: "color" });
        let linkTo = make(go.Shape, { toArrow: "standard", stroke: null });
        // replace the default Link template in the linkTemplateMap
        diagram.linkTemplate = make(go.Link, linkFrom, linkTo, link);
        diagram.toolManager.clickSelectingTool.standardMouseSelect = function(e) {
          //// //console.log('CLICK', e, this);
          var diagram = this.diagram;
          if (diagram === null || !diagram.allowSelect) return;
          var e = diagram.lastInput;
          var count = diagram.selection.count;
          var curobj = diagram.findPartAt(e.documentPoint, false);
          // //console.log('CLICK', e, this, e, count, curobj);
          if (curobj !== null) {
            // //console.log('standardMouseSelect', curobj);
            // $().request(curobj.Cg.item.$id);
          } else if (e.left && !(e.control || e.meta) && !e.shift) {
            // left click on background with no modifier: clear selection
            diagram.clearSelection();
          }
        };
        diagram.model = new go.GraphLinksModel(data.items, data.links);
      })();
      return this;
    },
    modelTraverse(data){
      (async () => {
        var names = {}; // hash to keep track of what names have been used
        const element = this.elem;
        function init() {
          if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
          var $ = go.GraphObject.make;  // for conciseness in defining templates
          myDiagram =
          $(go.Diagram, element,
            {
              initialAutoScale: go.Diagram.UniformToFill,
              // define the layout for the diagram
              layout: $(go.TreeLayout, { nodeSpacing: 5, layerSpacing: 30 })
            });
            // Define a simple node template consisting of text followed by an expand/collapse button
            myDiagram.nodeTemplate =
            $(go.Node, "Horizontal",
            { selectionChanged: nodeSelectionChanged },  // this e handler is defined below
            $(go.Panel, "Auto",
            $(go.Shape, { fill: "#1F4963", stroke: null }),
            $(go.TextBlock,
              {
                font: "bold 13px Helvetica, bold Arial, sans-serif",
                stroke: "white", margin: 3
              },
              new go.Binding("text", "text"))
            ),
            $("TreeExpanderButton")
          );
          // Define a trivial link template with no arrowhead.
          myDiagram.linkTemplate =
          $(go.Link,
            { selectable: false },
            $(go.Shape));  // the link shape
            // create the model for the DOM tree
            //console.log(data, data.items)
            myDiagram.model =
            $(go.TreeModel, {
              isReadOnly: true,  // don't allow the user to delete or copy nodes
              // build up the tree in an Array of node data
              nodeDataArray: data.links,
              // [
              //   {key:'a', name:'aasfa', },
              //   {key:'c', name:'aasfa', parent: 'a'},
              //   {key:'a1', name:'basdfa', parent: 'a'},
              //   {key:'c1', name:'basdfa', parent: 'c'},
              //   {key:'c1', name:'basdfa', parent: 'a'},
              // ],//traverseDom(document.activeElement)
            });
          }
          // Walk the DOM, starting at document, and return an Array of node data objects representing the DOM tree
          // Typical usage: traverseDom(document.activeElement)
          // The second and third arguments are internal, used when recursing through the DOM
          function traverseDom(node, parentName, dataArray) {
            if (parentName === undefined) parentName = null;
            if (dataArray === undefined) dataArray = [];
            // skip everything but HTML Elements
            if (!(node instanceof Element)) return;
            // Ignore the navigation menus
            if (node.id === "navindex" || node.id === "navtop") return;
            // add this node to the nodeDataArray
            var name = getName(node);
            var data = { key: name, name: name };
            dataArray.push(data);
            // add a link to its parent
            if (parentName !== null) {
              data.parent = parentName;
            }
            // find all children
            var l = node.childNodes.length;
            for (var i = 0; i < l; i++) {
              traverseDom(node.childNodes[i], name, dataArray);
            }
            return dataArray;
          }
          // Give every node a unique name
          function getName(node) {
            var n = node.nodeName;
            if (node.id) n = n + " (" + node.id + ")";
            var namenum = n;  // make sure the name is unique
            var i = 1;
            while (names[namenum] !== undefined) {
              namenum = n + i;
              i++;
            }
            names[namenum] = node;
            return namenum;
          }
          // When a Node is selected, highlight the corresponding HTML element.
          function nodeSelectionChanged(node) {
            if (node.isSelected) {
              names[node.data.name].style.backgroundColor = "lightblue";
            } else {
              names[node.data.name].style.backgroundColor = "";
            }
          }
          init();
        })();
        return this;
      },
  });
})()

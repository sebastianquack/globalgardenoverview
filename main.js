minSize = 20
sizeFactor = 0.5

updateSize = function(jsonObject) {
  var nodes = jsonObject.Goals.concat(jsonObject.Policies)
  var index = 0
  
  nodes.forEach(function(node) {    
    var cyNode = cy.getElementById(node.Id)

    // calculates leak
    var amountAfterLeak = node.WaterAmount - ((node.WaterLeakagePercentage / 100.0) * node.WaterAmount)
    
    // removes activation amount
    var availableAmount = amountAfterLeak - node.ActivationAmount    

    var size = minSize + availableAmount * sizeFactor        
    cyNode.data("size", size)

  })
  
}

// translates json data from playfab into cytoscape model
graphElements = function(jsonObject) {

  var elements = {nodes: [], edges: []}  
  var nodes = jsonObject.Goals.concat(jsonObject.Policies)
  var index = 0
  
  nodes.forEach(function(node) {    
    elements.nodes.push({
      data: {
        id: node.Id, 
        title: node.Name,
        type: index < jsonObject.Goals.length ? "goal" : "policy",
        color: index < jsonObject.Goals.length ? "blue" : "green",
        size: 25
      }
    })
    node.Connections.forEach(function(connection) {    
      elements.edges.push({
        data: {
          source: node.Id,
          target: connection.TargetId,
          color: "#000"
        }
      })
    })
    index++
  })
  
  return elements
}

cy = null
updatePolicyGraph = function(jsonObject) {
  
  var elements = graphElements(jsonObject)
  
  // assemble policy graph
  cy = cytoscape({
    container: document.getElementById('cy'),
    zoomingEnabled: true,
    userZoomingEnabled: true,
    panningEnabled: true,
    userPanningEnabled: true,
    elements: elements,
    layout: {
      name: 'cose-bilkent',
      fit: true
    },
    ready: function(){
      window.cy = this;
    },
    style: cytoscape.stylesheet()
      .selector('node')
        .css({
          'shape': 'circle',
          'background-color': '#fff',
          'border-color': 'data(color)',
          'border-style': 'solid',
          'border-width': '1.0',
          'width': 'data(size)',
          'height': 'data(size)',
          'text-valign': "top",
          'color': '#444',
          'text-margin-y': "-5",
          'font-family': "sans-serif",
          'font-weight': "100",
          'font-size': "25",
          'content': 'data(title)'
        })
      .selector('edge')
        .css({
            'curve-style': 'bezier',
            'width': '0.6',
            'target-arrow-shape': 'triangle',
            'line-color': 'data(color)',
            'source-arrow-color': '#000',
            'target-arrow-color': '#000'
        })
  })  

}

$('document').ready(function(){

  $.ajaxSetup({beforeSend: function(xhr) {
    if(xhr.overrideMimeType) {
      xhr.overrideMimeType("application/json");
    }
  }})

  var testData = null

  $.getJSON("testData.json", function(jsonObject) {
    testData = jsonObject
    updatePolicyGraph(jsonObject)    
  })
  
  $('#refresh').click(function() {
    updateSize(testData)
  })
  
  
})


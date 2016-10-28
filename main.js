minSize = 20
sizeFactor = 0.5

updateNodeProperties = function(jsonObject) {
  var nodes = jsonObject.Goals.concat(jsonObject.Policies)
  var index = 0
  
  nodes.forEach(function(node) {    
    var cyNode = cy.getElementById(node.Id)
    
    if(node.type == "goal") {

      var size = node.WaterAmount * sizeFactor
      cyNode.data("size", size)
      
    } else {

      // calculates leak
      var amountAfterLeak = node.WaterAmount - ((node.Leakage / 100.0) * node.WaterAmount)
    
      // removes activation amount
      var availableAmount = amountAfterLeak - node.ActivationAmount    

      var size = minSize + availableAmount * sizeFactor        
      cyNode.data("size", size)
      

      if(node.WaterAmount < node.ActivationAmount) {
        node.addClass("inactiveNode")
      } else {
        node.removeClass("inactiveNode")
      }
    
    }

  })
  
}

// translates json data from playfab into cytoscape model
graphElements = function(jsonObject) {
  
  console.log(jsonObject)

  var elements = {nodes: [], edges: []}  
  var nodes = jsonObject.Goals.concat(jsonObject.Policies)
  var index = 0
  
  console.log(nodes)
  
  nodes.forEach(function(node) {    
    elements.nodes.push({
      data: {
        id: node.Id, 
        title: (index < jsonObject.Goals.length ? "G: " : "P: ") + node.Name,
        type: index < jsonObject.Goals.length ? "goal" : "policy",
        color: index < jsonObject.Goals.length ? "blue" : "green",
        size: 25
      }
    })
    node.Connections.forEach(function(connection) {    
      elements.edges.push({
        data: {
          target: node.Id,
          source: connection.FromId,
          color: "#000"
        }
      })
    })
    index++
  })
  
  console.log(elements)
  
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
      updateNodeProperties(jsonObject)
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
      .selector('.inactiveEdge')
        .css({'line-color': "#aaa", "source-arrow-color": "#aaa", "target-arrow-color": "#aaa"})          
      .selector('.inactiveNode')
        .css({'border-color': "#aaa", "color": "#aaa"})          
        
        
  })  

}

refreshGraph = function() {
  GetGardenData.execute(function(jsonObject) {
    console.log(jsonObject)
    updateNodeProperties(jsonObject)      
  })  
}

$('document').ready(function(){
  
  GetGardenData.execute(function(jsonObject) {
    updatePolicyGraph(jsonObject)        
  })

  setInterval(refreshGraph, 5000)
  
})


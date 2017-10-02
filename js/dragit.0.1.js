(function(){

  var dragit = window.dragit || {};
  window.dragit = dragit;

  dragit.version = "0.1";

   var vars = {
      "dev": false // Verbose mode for debugging
    };

  dragit.statemachine = {current_state:"idle", current_id:-1};
  dragit.time = {min:0, max:0, current:0, step:1}
  dragit.utils = {};
  dragit.mouse = {dragging:"closest"};
  dragit.object = {update: function() {}, accesor: function() {}, offsetX:0, offsetY:0}
  dragit.partition = {};
  dragit.data = [];

  dragit.evt = {};                // List of events binded to states
  dragit.evt.dragstart = [];        // dragstart: end of dragging
  dragit.evt.drag = [];        // dragend: end of dragging
  dragit.evt.dragend = [];        // dragend: end of dragging

  dragit.guide = {};

  dragit.trajectory = {interpolate: "linear"};

dragit.trajectory.init = function(tc) {  this.tc = tc;

}

dragit.trajectory.display = function(d, i) {

  // Making sure we do not display twice the same trajectory.
  if(dragit.statemachine.current_state == "drag" && dragit.statemachine.current_id == i)
    return;

  if(vars.dev)
    console.log("display", dragit.statemachine.current_state, dragit.statemachine.current_id, i)

  dragit.statemachine.current_id = i;

  var svgLine = d3.svg.line()
                      .x(function(d) {return d[0]; })
                      .y(function(d) { return d[1]; })
                      .interpolate(dragit.trajectory.interpolate);

  gDragit = svg.insert("g").attr("class", "gDragit")

  dragit.lineGraph = gDragit.selectAll(".lineTrail")
                  .data([dragit.data[i]])
                .enter().append("path")
                  .attr("d", svgLine)
                  .attr("stroke", "blue")
                  .style("stroke", "black")
                  .attr("stroke-width", 2)                            
                  .attr("fill", "none")
                  .attr("class", "lineTrail")
                  .style("pointer-events", "none")

  dragit.pointsGraph  = gDragit.selectAll(".pointsTrail")
                    .data(dragit.data[i].filter(function(e, j) { 
                      return e!==dragit.data[i][dragit.time.current-dragit.time.min]; 
                    }))
                  .enter().append("svg:circle")
                    .attr("class", "pointsTrail")
                    .attr('cx', function(d) { return d[0]; })
                    .attr('cy', function(d) { return d[1]; })
                    .attr('r', 10)
                    .style("pointer-events", "none")

  dragit.lineSimple = gDragit.selectAll(".lineSimple")
                  .data([dragit.data[i]])
                .enter().append("path")
                  .attr("d", svgLine.interpolate("basis"))
                  .attr("stroke-width", 10)                            
                  .attr("fill", "none")
                  .attr("class", "lineSimple")
                  .style("pointer-events", "none")
                  .attr({stroke: "lightgray", "stroke-dasharray": "10,10"})

}

dragit.trajectory.toggle = function() {

  // Test if already visible or not

  // Test if dragit object exists

}

dragit.trajectory.displayAll = function() { 
  dragit.data.map(function(d, i) {
    dragit.trajectory.display({}, i)    
  })
} 

dragit.trajectory.remove = function(d, i) {
  if(dragit.statemachine.current_state != "drag")
    d3.select(".gDragit").remove();
}

dragit.trajectory.removeAll = function() { 
  dragit.data.map(function(d, i) {
    //d3.selectAll(".gDragit").remove();
  });
}

// Creates a slider to navigate in the timecube
// TODO: <input type="range" name="points" min="0" max="20" step="1" value="0" id="slider-time" oninput="update(this.value, 100)"> <span id="max-time">0</span>
dragit.utils.slider = function(el) {

  d3.select(el).append("p").style("clear", "both");
  d3.select(el).append("span").attr("id", "min-time").text(dragit.time.min);
  d3.select(el).append("input").attr("type", "range")
  d3.select(el).append("span").attr("id", "max-time").text(dragit.time.max);

}

// Calculate the centroif of a given SVG element
dragit.utils.centroid = function(s) {
  var e = s.node(),
  bbox = e.getBBox();
  return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
}

// Main function that binds drag callbacks to the current element
dragit.object.activate = function(d, i) {

  if (vars.dev) 
    console.log("Activate", d, i)

  d.call(d3.behavior.drag()
    .on("dragstart", function(d, i) {

      // Init coordinates for the dragged object of interest
      d.x = 0;
      d.y = 0;

      // Create elements for trajectories
      dragit.lineGuide = gDragit.append("line").classed('lineGuide', true).style("display", "block")
      dragit.valueGuide = gDragit.append("line").classed('valueGuide', true).style({opacity: 1}).style("display", "block")
      dragit.pointGuide = gDragit.append("circle").classed('pointGuide', true).attr({cx: -10, cy: -10, r: 3.5}).style("display", "block")

      dragit.statemachine.current_state = "drag";

      // Call dragend events
      dragit.evt.dragstart.forEach(function(e, j) {
      //  console.log("dragstart", d, i)
        if(typeof(e) != "undefined")
          e(d, i)
          //setTimeout(e(d, i), 100) 
      });

    })
    .on("drag", function(d,i) {

      switch(dragit.mouse.dragging) {

        case "free":

          d.x += d3.event.dx
          d.y += d3.event.dy

          d3.select(this).attr("transform", function(d,i){
            return "translate(" + [ d.x,d.y ] + ")"
          })  

      }

      list_distances = [], list_times = [], list_lines = []

      list_p = []; // List of points
      list_q = []; // List of times

      // Current mouse position
      var m = [d3.event.x+dragit.object.offsetX, d3.event.y+dragit.object.offsetY];

      // Browse all the highlighted placeholders
      // ".gBracket > .gGame"
      d3.selectAll(".rect_trail")[0].forEach(function(e, j) { 

        // TODO: find better index than j

         var cur_game = d3.select(d3.select(e)[0][0]).data()[0].game;
        // console.log("Current game", cur_game)
        // Position of the current destination

        // We take the sume of the two nodes above the currently highligthed rectangle
        var p1 = d3.transform(d3.select(d3.select(d3.select(e).node().parentNode).node().parentNode).attr('transform')).translate;
        var p2 = d3.transform(d3.select(d3.select(e).node().parentNode).attr('transform')).translate;

        var p = [p1[0] + p2[0], p1[1] + p2[1]];

        if(typeof dragit.data[j] === "undefined") {
          console.log("NO DATA")
          return;
        }

        closest = Utils.prototype.closestValue(m, dragit.data[j]);

        // List of correspondi
        //var q = dragit.data[j][[closest.indexOf(Math.min.apply(Math, closest))]];

        // Add the destination to the list
        list_p.push(p);

        //list_q.push(q);

        // Store all the distances to the final destination
        list_distances.push(Math.sqrt( (p[0] - m[0]) * (p[0] - m[0]) + (p[1] - m[1]) * (p[1] - m[1]) ));

        var new_time = closest.indexOf(Math.min.apply(Math, closest)) + dragit.time.min;

        // Store the closest time
        list_times.push(new_time);

        // Store the current line
        list_lines.push(j);
      })

/*
      // Browse all the .lineTrail trajectories
      d3.selectAll(".lineTrail")[0].forEach(function(e, j) {
        dragit.lineGraph = d3.select(e);

        var  p = Utils.prototype.closestPoint(dragit.lineGraph.node(), m);
        closest = Utils.prototype.closestValue(m, dragit.data[j]);

        var q = dragit.data[j][[closest.indexOf(Math.min.apply(Math, closest))]];

        list_p.push(p);
        list_q.push(q);

        // Store all the distances
        list_distances.push(Math.sqrt( (p[0] - m[0]) * (p[0] - m[0]) + (p[1] - m[1]) * (p[1] - m[1]) ));

        var new_time = closest.indexOf(Math.min.apply(Math, closest)) + dragit.time.min;

        // Store the closest time
        list_times.push(new_time);

        // Store the current line
        list_lines.push(j);
      })
*/
      // Find the index for the shortest distance
      var index_min = list_distances.indexOf(d3.min(list_distances));

      var new_time = list_times[index_min];

      // Draw guides
      dragit.lineGuide.attr("x1", list_p[index_min][0]+25/2).attr("y1", list_p[index_min][1]+10/2).attr("x2", m[0]).attr("y2", m[1]);
      dragit.pointGuide.attr("cx", list_p[index_min][0]).attr("cy", list_p[index_min][1]);
      // dragit.valueGuide.attr("x1", list_q[index_min][0]).attr("y1", list_q[index_min][1]).attr("x2", m[0]).attr("y2", m[1]);

     
      // dragit.lineGuide.style("opacity", 1)
      // dragit.lineGuide.style("visible", "block")

      // Update to the closest snapshot
      // dragit.trajectory.index_min contains the index for the final destination
      if(dragit.time.current != new_time || dragit.trajectory.index_min != index_min) {

        dragit.trajectory.index_min = index_min;
        dragit.time.current = new_time;

        d3.selectAll(".rect_trail")[0].filter(function(e, j) {

          var cur_game = d3.select(d3.select(e)[0][0]).data()[0].team;

          if(j == index_min) {
           
            dragit.trajectory.cur_game = cur_game;

          }

        })

        dragit.object.update();
      }

      // Trigger events
      dragit.evt.drag.forEach(function(e, j) {
        if(typeof(e) != "undefined") {
          e(d, i);
        }
      });

    })
    .on("dragend", function(d,i) {

      dragit.lineGuide.remove();
      dragit.valueGuide.remove();
      dragit.pointGuide.remove();
      // Remove trajectory

      d3.selectAll(".gDragit").selectAll("*").remove();
      //gDragit.remove();

      // Snapping
      switch(dragit.mouse.dragging) {

        case "free":
          d.x = 0;
          d.y = 0;

          d3.select(this).transition().duration(1000).attr("transform", function(d,i){
              return "translate(" + [ d.x, d.y ] + ")"
          })
          //.attr("cx", q[0])
          //.attr("cy", q[1])

      }

      // Call dragend events
      dragit.evt.dragend.forEach(function(e, j) {
      //  console.log("dragstart", d, i)
        if(typeof(e) != "undefined") {
          e(d, i);
        }
          //setTimeout(e(d, i), 100) 
      });

      dragit.statemachine.current_state = "idle";
      dragit.statemachine.current_id = -1;
    })
  )
  } 
  
})()


function Utils() {

}

// Credits: http://bl.ocks.org/mbostock/8027637
Utils.prototype.closestPoint  = function(pathNode, point) {

  var pathLength = pathNode.getTotalLength(),
      precision = pathLength / pathNode.pathSegList.numberOfItems * .125,
      best = {x:0, y:0},
      bestLength,
      bestDistance = Infinity;

  // linear scan for coarse approximation
  for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
    if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
      best = scan, bestLength = scanLength, bestDistance = scanDistance;
    }
  }

  // binary search for precise estimate
  precision *= .5;
  while (precision > .5) {
    var before,
        after,
        beforeLength,
        afterLength,
        beforeDistance,
        afterDistance;
    if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
      best = before, bestLength = beforeLength, bestDistance = beforeDistance;
    } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
      best = after, bestLength = afterLength, bestDistance = afterDistance;
    } else {
      precision *= .5;
    }
  }

  best = [best.x, best.y];
  best.distance = Math.sqrt(bestDistance);
  return best;

  function distance2(p) {
    var dx = p.x - point[0],
        dy = p.y - point[1];
    return dx * dx + dy * dy;
  }
}


Utils.prototype.closestValue  = function(p, points) {
  //console.log("closest", points)
  var distances = points.map(function(d, i) { 
    var dx = d[0]-p[0];
    var dy = d[1]-p[1];
    return Math.sqrt(dx*dx + dy*dy);
  })
  return distances;
}

// Credits:
// http://bl.ocks.org/mbostock/8027835
// http://bl.ocks.org/njvack/1405439
// http://bl.ocks.org/mbostock/9078690
Utils.prototype.closestValueVoronoi  = function(points) {

  var voronoi = d3.geom.voronoi()
      .clipExtent([[-2, -2], [width + 2, height + 2]]);

  var cell = gDragit.append("g")
      .attr("class", "voronoi")
    .selectAll("g");

  var output = d3.select("output");

  var input = d3.select("input")
      .on("change", function() { resample(+this.value); })
      .each(function() { resample(+this.value); });

  function resample() {
   // console.log(voronoi(points))
    cell = cell.data(voronoi(points));
  //  cell.exit().remove();
  //  var cellEnter = cell.enter().append("g");
  //  cellEnter.append("circle").attr("r", 3.5);
  //  cellEnter.append("path");
  //  cell.select("circle").attr("transform", function(d) { return "translate(" + d.point + ")"; });
  //  cell.select("path").attr("d", function(d) { return "M" + d.join("L") + "Z"; });
  }


};


var unique_groups = d3.set(data.teams.map(function(d) { return d.group;})).values();

function team_in_teams(team, teams) {
  var index_team = data.teams.map(function(d) { return d.team; }).indexOf(team);
  return teams[index_team] > 0;
}

function find_team_alias(t) {
  return data.teams.filter(function(d) { return d.team == t })[0].alias;
}

function find_team_data_by_alias(t) {
  return data.teams.filter(function(d) { return d.alias == t })[0];
}

// Extends paths to rankings

var list_extensions = [];

all_paths.forEach(function(d, i) {
  d.forEach(function(e, j) {
    unique_groups.forEach(function(g) {

      // If contains the current group
      if(e.indexOf(g)!=-1) {


       // Pre-pending "ESP3", "ESP2", "ESP1", "ESP0"
        var a = find_teams_by_group(g).map(function(a, n) {
          return d3.range(4).map(function(b, c) {
            return a.alias + (3-b);
          })
        })

        var group_1 = d.map(function(c) { return c; });
        a[0].map(function(f) { group_1.push(f) });
        list_extensions.push(group_1);


        var group_2 = d.map(function(c) { return c; });
        a[1].map(function(f) { group_2.push(f) });
        list_extensions.push(group_2);

        var group_3 = d.map(function(c) { return c; });
        a[2].map(function(f) { group_3.push(f) });
        list_extensions.push(group_3);

        var group_4 = d.map(function(c) { return c; });
        a[3].map(function(f) { group_4.push(f) });
        list_extensions.push(group_4);

      //  a[0].map(function(f) { d.push(f) });

      }
    })
  });
})

function create_elimination(start, end, x, y) {

  // Filter to games between stard and end
  data.games.filter(function(d, i) { return i >= start && i < end ? d: false;}).map(function(d, i) {

    // Append a gGame node
    var gGames = svg.append("g")
                    .data([{"game": d.id}])
                    .attr("id", function() { return "game_"+d.id; })
                    .attr("class", "gGame")
                    .attr("transform", function(e) { return "translate("+x+", "+(20*(i%16*2)+80 + y)+")"; });

    gGames.append("svg:text")
          .attr("dx", 17)
          .attr("dy", 15)
          .attr("text-anchor", "middle")
          .text(function(d) { return d.game; })

    // Bind the data to the gGame to create two gTeam nodes
    var gTeams = gGames.selectAll(".gTeam")
      .data([{"team": d.home, "type":"home", "score": d.scoreHome, "game": d.id},
            {"team": d.away, "type":"away", "score": d.scoreAway, "game": d.id}])
    .enter()
      .append("g")
      .attr("class", "gTeam")
      .attr("id", function(d) { return "game_"+d.team; })
      .attr("transform", function(e) { return e.type=="home" ? "translate(0, 0)" : "translate(20, 0)"; });

    gTeams.append("svg:rect")
        .attr({"width": game_width-5, "height": game_height, "y":10, "x": 0})
        .attr("class", function(d, i) { return "team"; })
        .style("display", "none")  // Does not display the games in between

    // Useful to dev
    // gTeams.append("svg:text")
    //       .attr("dx", 10)
    //       .attr("dy",10)
    //       .attr("text-anchor", function(d) { return d.type=="home" ? "end" : "start"; })
    //       .text(function(d) { return d.team; })
//
    // gTeams.append("svg:text")
    //       .attr("dx", 7)
    //       .attr("dy",25)
    //       .attr("text-anchor", "middle")
    //       .text(function(d) {
    //         if(!d.score)
    //           return 0;
    //         else
    //           return d.score;
    //       })
    //
  });

}

//var flat_all_paths = [];
//all_paths.map(function(d) { flat_all_paths = flat_all_paths.concat(d); });


/*
// Remove the XXX placeholders
all_end_games = all_end_games.filter(function(d) { return d != "XXX"; });

var all_end_games = all_end_games.filter(function(d){
  //return test(d);
});
*/

// Merge other groups with all paths + group 1
all_paths = list_extensions; //all_paths.concat(list_extensions);


var all_end_games = all_paths.map(function(d, i) {

  return find_latest_game_path(d);

})

// Unique
var all_end_games = all_end_games.filter(function(d,i,a){
  return i==a.indexOf(d);
});

var current_prediction = []// ["W62", "FRA"],  ["W61", "BRA"] ];

current_prediction.forEach(function(d) {

  if(d[1] != "") { // If we made a prediction for the given team

    all_paths = all_paths.filter(function(e) {

      // All the paths with the current country
      if(e.indexOf(d[1]+"0") != -1) {   // Select team
        if(e.indexOf(d[0]) == -1) {     // Select the right place
         console.log("remove team paths", e, d[1], d[0])
        } else {
          return e;
        }

      } else if(e.indexOf(d[0]) != -1) {

        if(e.indexOf(d[1]+"0") == -1) {
         console.log("remove others paths", e, d[1], d[0])
        } else {
          return e;
        }

      } else {
        return e;
      }

    })

  }
})


// Only return data for the given paths
function filter_dragit_data_by_team(team) {

  nonoccupied_paths_index = [];

  // Find data for the given team
  dragit.data = all_paths.filter(function(d, i) {

    var last_game = find_latest_game_path(d);
    // console.log(last_game, find_team_by_game_predictions(last_game, current_prediction))

    if(find_path_by_team(team.alias, d)) {// && find_team_by_game_predictions(last_game, current_prediction) == false) {
      return d;
    }

  })
  .map(function(d, i) {

   var last_game = find_latest_game_path(d);

    if(find_team_by_game_predictions(last_game, current_prediction)==false) {
      nonoccupied_paths_index.push(i)
    }

    return d.filter(function(d) { return d != "XXX"; }).map(function(d) {

      var t = get_team_coordinates(d);
      return  t;
    });
  })

}

function update() {

  var coords = dragit.data[dragit.trajectory.index_min][dragit.time.current];

  var current_end_games = [];

  // Find all the paths for the current team
  team_paths = all_paths.filter(function(d) {

    var latest_game = find_latest_game_path(d);

    if((current_end_games.indexOf(latest_game) < 0) && find_path_by_team(current_team, d)) {
      current_end_games = current_end_games.concat(latest_game);
      return d;
    }

  });

  // Find current game
  // Find path with current game and current team

  var c_path = team_paths.filter(function(d) {

    if(find_latest_game_path(d) == dragit.trajectory.cur_game || find_latest_game_path(d) == "r"+dragit.trajectory.cur_game) {
      current_path = all_paths.indexOf(d);
    }

  })

  // PB2
  //current_path = all_paths.indexOf(team_paths[team_paths.length - dragit.trajectory.index_min]);

  if(typeof all_paths[current_path] == 'undefined') {
    console.warn("Can't find path!!!")
    return;
  }

  // The current game is the latest one in the path
  current_game = find_latest_game_path(all_paths[current_path]);

  update_paths("FROM_UPDATE");

}

function drag_update() {

  // TODO: drag a group including images and circles, not just image element  //  .attr("transform", function(e, j) { return "translate(" + (parseInt(dragit.pointGuide.attr("cx"))+60) + "," + (parseInt(dragit.pointGuide.attr("cy"))+40) + ")" });

// TODO: do we still need this??
 // d3.select(".gFlag_"+current_team)
 //   .transition().duration(0).delay(0)
 //   //.attr("transform", "translate(17, 0)")
 //   .attr("transform", function(e, j) {
 //     return "translate(" + (parseInt(dragit.pointGuide.attr("cx"))+60) + ", " + (parseInt(dragit.pointGuide.attr("cy"))+40) + ")";
 //   });

}

function end_update() {

  if(dev) {
    console.log("end_update")
  }

 // svg.selectAll(".team").style("fill", "white")

  setTimeout(function() {

    d3.select("#background").transition().style("opacity", background_opacity)
    // TODO: update all paths
  //  update_paths("END_UPDATE");

      // Reset the path to the overview with no highlight
      current_path = -1;

      updateTwitterValues();

  }, 1500);

}

// % Complete text
function update_complete(duration) {

  if(typeof duration === 'undefined') {
    duration = 1000;
  }

  if(d3.select("#percentage-completed").text() == "NaN") {
    d3.select("#percentage-completed").text(0);
  }

  // Make the text bigger when its updated
  d3.select("#display-completed")
    .style({'font-size': '30px'})
    .transition()
    .duration(2000)
    .style({'font-size': '20px'});

  var percentage = Math.round(100 * current_prediction.length / data.teams.length);

  // Nothing has has changed? Don't interpolate
  if(percentage == +d3.select("#percentage-completed").text()) {
    return;
  }

  d3.select("#percentage-completed")
    .data([percentage])
    .text(function(d) {
      return d;
    })

  // If duation is -1, don't show the modal
  if(percentage == 100 && duration > 0) {
    $('.alert-success').show();
  } else {
    $('.alert-success').hide();
  }

  // Mysterious NaN appear for some reason
  // d3.select("#percentage-completed")
  // data([percentage])
  //  .transition()
  //  .duration(duration)
  //  .tween("text", function(d) {

  //    var this_content = 1;

  //    if(this.textContent != "0") {
  //      this_content = +this.textContent;
  //    }

  //    var i = d3.interpolate(this_content, d),
  //        //prec = (d + "").split("."),
  //        round = 1; //(prec.length > 1) ? Math.pow(10, prec[1].length) : 1;

  //    return function(t) {
  //      console.log(Math.round(i(t) * round) / round, round, i(t), t, this_content, d)
  //        this.textContent = Math.round(i(t) * round) / round;
  //    };
  //  });
  //  //  dragit.evt.dragend.push(end_update);

  d3.select("#remaining-teams").text(data.teams.length - current_prediction.length);
}

var svgLine = d3.svg.line()
                    .x(function(d) {return d[0]; })
                    .y(function(d) { return d[1] + 15*Math.random(); })
                    .interpolate("basis"); // basis

function create_paths(canvas) {


  if (typeof canvas === 'undefined') {
    canvas = svg;
  }

  states_paths = d3.range(all_paths.length).map(function() { return 0; });

  // Required for dragit
  gDragit = svg.insert("g").attr("class", "gDragit")

  all_paths.map(function(d, i) {


    var list_coordinates = all_paths[i].map(function(d) { return get_team_coordinates(d); })
                                       .filter(function(d) { return d == null ? false: true;})


    dragit.lineGraph = gPaths.selectAll("#path_"+i)
                    .data([list_coordinates])
                  .enter().append("path")
                    .attr("d", svgLine)
                    .style("stroke", "#000")
                    .attr("stroke-width", 1)
                    .style("opacity", .1)
                    .attr("id", "path_"+i)
                    .style("display", "none")


   })

  update_paths("CREATE_PATHS");
}

// 0 - Not visible (when 2, 3 or 4)
// 1 - Occupied by a team
// 2 - Visible lines (SHOW_GAME, SHOW_TEAM)
// 3 - Trail line (DRAG)
// 4 - Trail Focus line (DRAG CURRENT) -> RED
// 5 - Show all paths (to generate the background)
// 6 - Occupied path by team from same group
 prevent_second_round = false;

function update_paths(opt, canvas) {

  if(opt == "SHOW_TEAM") {
    var current_game_hover = find_game_by_team_predictions(current_team, current_prediction)[0];
    if(typeof current_game_hover == 'undefined') {
      current_game_hover = current_team + "0";
    }

    logging('hover', 'team', {team: current_team, game: current_game_hover});
  }

  if(opt == "SHOW_GAME") {
    logging('hover', 'game', {current_game: current_game});
  }

  if(dev) {
    console.log("Update paths", opt)
  }

  if (typeof opt === 'undefined') {
    opt = "";
  }

  if (typeof canvas === 'undefined') {
    canvas = svg;
  }

  // Show with trail the one related to the current selection
  states_paths = d3.range(all_paths.length).map(function() { return 0; });

  if(opt == "SHOW_GAME") {

    var current_game_paths = filter_paths_by_game(current_game, all_paths);

    current_game_paths.map(function(d) {
      states_paths[all_paths.indexOf(d)] = 1;
    })
    // Highlight all the paths for current_team

  }

  if(dragit.statemachine.current_state != "drag" && opt != "SHOW_TEAM" && opt != "SHOW_GAME") {
    //Show all selected paths
    current_prediction.map(function(d) {

      var game_paths = filter_paths_by_game(d[0], all_paths);
      var current_paths = filter_paths_by_team(d[1], game_paths);

      current_paths.map(function(d) {
        states_paths[all_paths.indexOf(d)] = 1;
      })

    })

    d3.selectAll(".description.team").style('opacity', 1);
    d3.selectAll(".description.team").style('font-size', '12px');

  }

  // Show focus for the currently selected path
  if(dragit.statemachine.current_state == "drag" || opt == "SHOW_TEAM" || opt == "SHOW_PATH") {

    prevent_second_round = false;
    current_team_paths = filter_paths_by_team(current_team, all_paths);

    // Remove the paths that cannot be taken because of team from same group
    var current_group = find_team_group(current_team);

    var group_teams = find_teams_by_group(current_group);

    var selected_teams = group_teams.filter(function(d) {
      return test_team_in_prediction(d.alias, current_prediction);
    });

    // To make sure we have 2 group stages
    // Lest than 2 teams have been selected, no worries
    // At lease two teams have been selected
    // -Either the current one is not in group, then don't bother

    current_team_paths.map(function(d) {

      if(all_paths.indexOf(d) == current_path) {

        if(test_occupied_game(current_game, current_prediction)) { // ??? && find_game_team_in_prediction(current_team, backup_prediction)[0] != current_game) {

          // Todo: if occupied by current team, make it a 4
          states_paths[all_paths.indexOf(d)] = 6;

        } else {

          states_paths[all_paths.indexOf(d)] = 4;

        }

      } else {

        states_paths[all_paths.indexOf(d)] = 3;

      }
    });


//if(dragit.statemachine.current_state == "drag") {
//
//  if(dragit.statemachine.current_state != "drag") {
//    tmp_game = find_game_team_in_prediction(current_team, current_prediction)[0];
//  } else {
//    tmp_game = current_team;
//  }
//
//  console.log("CURRERERNT GAMEEeeeeeeee", tmp_game)
//
//   // If more than 2 teams have been selected
//   if(selected_teams.length>=2 && (tmp_game == 'r3A' || tmp_game == 'r4A')) {
//
//     var max_second_round = 0;
//
//     selected_teams.forEach(function(t) {
//
//       predict_game = find_game_by_team_predictions(t.alias, current_prediction)[0];
//
//       if(predict_game != "r3"+current_group && predict_game != "r4"+current_group) {
//         max_second_round++;
//       }
//
//     });
//
//     console.log("---------------------max_second_round", max_second_round, current_team);
//
//     if(max_second_round >= 2) {
//       console.log("--------------------------------PREVENT SECOND ROUND")
//       prevent_second_round = true;
//
//     }
//
//   }
//  }
//   current_team_paths.map(function(d) {
//
//       if(all_paths.indexOf(d) == current_path) {
//
//         console.log("CURRET PATH", current_path)
//         // if(max_second_round && d[3] != "XXX")
//         //   states_paths[all_paths.indexOf(d)] = 4;
//         // else
//           states_paths[all_paths.indexOf(d)] = 4;
//
//
//       }  else {
//
//         if(max_second_round && d[3] != "XXX") {
//         //  states_paths[all_paths.indexOf(d)] = 6;
//         } else {
//           states_paths[all_paths.indexOf(d)] = 3;
//         }
//
//     }
//
//
//   })
//

  //  // Fixes to highlight games on hover
  //  var current_game_hover = find_game_by_team_predictions(current_team, current_prediction)[0];
  //  var current_path_full = find_path_by_lastest_game(current_game_hover, current_team_paths);
  //  var current_path_hover = all_paths.indexOf(current_path_full);
//
  //  current_team_paths.map(function(d) {
//
  //    if(all_paths.indexOf(d) == current_path_hover) {
//
  //      states_paths[all_paths.indexOf(d)] = 4;
//
  //    }
  //
  //  });


    // Highlight all the paths for current_team

    d3.selectAll(".description.team").style('opacity', .3);

    // TODO: fix the selector
    d3.selectAll(".description.team").filter(function(d) {
      return d.alias == current_team;
    })
    .style('font-size', '12px')
    .style('opacity', 1);

  }





  // Show with focus the currently selected path
  if(opt == "SHOW_ALL_PATH") {

    all_paths.map(function(d) {

      states_paths[all_paths.indexOf(d)] = 5;

    });

    // Highlight all the paths for current_team

  }

  // Calculate state of each game
  state_games = d3.range(all_end_games.length).map(function() { return 0; });

  // Highlight the focus line from all paths
  all_paths.map(function(d, i) {

    var end_game = find_latest_game_path(all_paths[i]);

    if(states_paths[i] > 0) { // Apply style to the paths

      if(states_paths[i]==4 || states_paths[i]==3) {
        state_games[all_end_games.indexOf(end_game)] = Math.max(state_games[all_end_games.indexOf(end_game)], states_paths[i]);
      }

      canvas.selectAll("#path_"+i)
            .attr("stroke-width", function() {
              if(states_paths[i]==4 || states_paths[i]==6)
                return 10;
              else if(states_paths[i]==5)
                return 4;
              else
                return 4;
            })
            .style("opacity", function() {
              if(states_paths[i]==3 || states_paths[i]==5) {
                return .4;
              } else if(states_paths[i]==1)
                return .4
              else if(states_paths[i]==4)
                return 1;
              else if(states_paths[i]==6)
                return 1;
              else
                return .2;
            })
            .style("display", "block")
            .attr("class", function() {
              if(states_paths[i]==4 || states_paths[i]== 3 || states_paths[i]==6) {
                return "lineTrail";
              } else {
                return "";
              }
            })
            .style("stroke", function() {

              if(states_paths[i]==4) {
                this.parentNode.appendChild(this);
                return "green";
              } else if(states_paths[i]==5)
                return "gray";
              else if(states_paths[i]==6) {
                this.parentNode.appendChild(this);
                return "red";
              } else
                return "white"
            })

    } else { // Hide no related paths

      canvas.selectAll("#path_"+i)
            .style("display", "none")
            .attr("class", "")

    }

  });

  // el.parentNode.appendChild(el.parentNode.removeChild(el));

  // Reset all the team placeholders to default styles
  svg.selectAll(".team")
     .style("fill", "black")
     .style("stroke", "lightgray")
     .style("stroke-width", 1)
     .classed("rect_trail", false);

  state_games.forEach(function(d, i) {

    if(d==1 || d==2) {

      svg.select("#game_"+all_end_games[i]).select("rect").style("fill", "yellow")

    } else if(d==3) {

      svg.select("#game_"+all_end_games[i]).select("rect")
        .style("stroke", "gold").style("stroke-width", 4)
        .classed("rect_trail", true);

    } else if(d==4) {

     svg.select("#game_"+all_end_games[i]).select("rect").style("fill", "green")
        .classed("rect_trail", true); // This can be a candidate for the drop

    } else if(d == 6) {

     svg.select("#game_"+all_end_games[i]).select("rect").style("fill", "red")
        .classed("rect_trail", true); // This can be a candidate for the drop

    }

  });

}

function draw_path(path_id, team, duration, delay) {

  var list_coordinates = all_paths[path_id].map(function(d) { return get_team_coordinates(d); })
                                           .filter(function(d) { return d == null ? false: true;})

  // Required for dragit
  //gDragit = svg.insert("g").attr("class", "gDragit")

  dragit.lineGraph = gPaths.selectAll("path_"+team)
                  .data([list_coordinates])
                .enter().append("path")
                  .attr("d", svgLine)
                  .attr("fill", "none")
                  //.transition().delay(delay)

                  .style("stroke", "#000")

                  .attr("stroke-width", 1)
                  .style("opacity", 0)
                  .attr("id", "path_"+team)
                  .attr("gid", "game_"+find_latest_game_path(all_paths[path_id]))
                  .style("display", "none")
                 // .attr("class", "path_"+team)
                  .style("pointer-events", "none")
                 // .call(transition);

}

// Return the #game_ node position as coordinate
function get_team_coordinates(team_id) {

  if(team_id == "XXX" || d3.select("#game_"+team_id)[0][0] == null) {
    return null;
  }


  // Game node
  var game_coords = d3.transform(d3.select(d3.select("#game_"+team_id).node().parentNode).attr("transform")).translate;

  // Team node
  var team_coords = d3.transform(d3.select("#game_"+team_id).attr("transform")).translate;

  return [game_coords[0] + team_coords[0], game_coords[1] + team_coords[1]];
}

function find_team_group(team) {
  return data.teams.filter(function(d) { return d.alias == team ? true : false; })[0].group;
}

function find_teams_by_group(group) {
  return data.teams.filter(function(d) { return d.group == group ? true : false; })
}

// Return the paths containing a specific game
function filter_paths_by_game(g, paths) {
  return paths.filter(function(d) { return d.indexOf(g) != -1 ? d : false });
}

function filter_paths_by_team(t, paths) {
  return paths.filter(function(d) { return d.indexOf(t+"0") != -1 ? d : false });
}

function find_game_by_team_predictions(team, prediction) {
  return prediction.filter(function(d) { return d[1] == team; })[0] || false;
}

function find_team_by_game_predictions(game, prediction) {
  return prediction.filter(function(d) { return d[0] == game; })[0] || false;
}

// Return true if team can play this game
function test_team_play_game(team, game) {
    var game_paths = filter_paths_by_game(game, all_paths);
    var current_paths = filter_paths_by_team(team, game_paths);
    return current_paths.length > 0;
}

function test_occupied_game(game, prediction) {
  return prediction.filter(function(d) {
    return d[0] == game;
  }).length > 0;
}


function highlight_team(team, duration, delay) {

//  if(reset)
//    svg.selectAll(".lineTrail").remove();

  all_paths.filter(function(d, i) {

    d.filter(function(e, j) {
      if(e==team) {
         draw_path(i, team, duration, delay);
    //     move_team_flag(d[0].slice(0, 3), find_latest_game_path(d));
      }

    })

  })
}

function find_path_by_team(team, path) {

  return path.filter(function(d) {
    if(team + "0" == d) {
      return d;
    }
  }).length > 0;

}

function find_path_by_lastest_game(game, path) {

  var p = path.filter(function(d) {
    return find_latest_game_path(d) == game;
  });

  return p[0];

}

function find_latest_game_path(path) {

  if(typeof path == 'undefined') {
    console.log("[find_latest_game_path] Error", path)
  }

  var index = 0;

  while(path[index]=="XXX" && index < path.length-1) {
    index++;
  }

  return path[index];

}

// Can a team play the given game?
function test_team_game(team, game) {

  var list_paths = [];

  all_paths.forEach(function(d, i) {

    if(d[0].slice(0, 3) == team) {

      // Is there any path
      var latest_game = find_latest_game_path(d);
      if(latest_game == game) {
        list_paths.push(i);
      }

    }

  })

  return list_paths;

}

function move_team_flag(team, game, duration, delay, ghost) {


  if (typeof delay === 'undefined') {
    delay = 100;
  }

  if (typeof ghost === 'undefined') {
    ghost = false;
  }

  if (typeof duration == 'undefined') {
    delay = 500;
  }

  var coords = get_team_coordinates(game);


  d3.select(".gFlag_" + team.toLowerCase())
    .transition().duration(duration).delay(delay+100)
    .ease('cubic-in-out')
    //.attr({"x": function(e, j) { return coords[0]+80; }, "y": function(e, j) { return coords[1]+40; }})
    .attr("transform", function(e, j) {
      return "translate(" + (coords[0]+80)  + "," + (coords[1]+40) + ")";
    })


  if(ghost) {//} && team !=current_team) {

    d3.select("#flag2_"+team)
      .transition().duration(100).delay(delay) // Make the ghost move faster than the original
      .attr({"x": function(e, j) { return coords[0]+80; }, "y": function(e, j) { return coords[1]+40; }})
       .attr("transform", "translate(0, 0)")

  }

}

function display_ghost() {
   d3.select("#flag2_"+current_team).style("opacity", .5)
}

function update_flags(d, i) {

  // Move to the final point of the path

  // Error
  if(typeof dragit.data[dragit.trajectory.index_min] == "undefined") {
    console.log("Error updating flags", dragit.trajectory.index_min);
    return;
  }

  var coords = dragit.data[dragit.trajectory.index_min][0];

  d3.select("#flag2_"+d.alias)
    .transition().duration(0).delay(0)
     .attr("transform", "translate(0, 0)")
    .attr({
      "x": function(e, j) { return coords[0]+80; },
      "y": function(e, j) { return coords[1]+45; }
    }).style("opacity", 0);

  // Check if game already occupied in prediction

  if(!test_occupied_game(current_game, current_prediction)) {

    if(prevent_second_round && current_game[0] != "r") { // Can only reach a first round spot

      if(dev) {
        console.log("Back to home", current_team+"0", current_path, d, current_game)
      }

      // Move back to its original place
      move_team_flag(current_team, current_team+"0", 1000, 0, true);

    } else {

//    move_team_flag_path_anim(current_team, current_path, 100, false);

      move_team_flag(current_team, current_game, 1000, 0, true);

      current_prediction = remove_team_prediction(current_team, current_prediction);
      current_prediction = add_team_game_prediction(current_team, current_game, current_prediction, false);

    }


   // display_prediction(current_prediction, []);
  } else {

    // Move back to origin
    ///move_team_flag_path_anim(current_team, current_path, 100, true);
    console.log("Back to home", current_team+"0", "occupied", current_game)
    // Move back to original place
    move_team_flag(current_team, current_team+"0", 100, 0, true);

  }

}

// Create a random prediction and displays it
// Activated after click on AUTO-COMPLETE BUTTON
function simulate_tournament() {

  reversed_all_end_games = duplicate_array(all_end_games);
  reversed_all_end_games.reverse();

  list_teams = data.teams.map(function(d) {
    return d.alias;
  })

  // If tournament started, keep it
  if(current_prediction.length < data.teams.length) {

    list_teams = list_teams.filter(function(d) {
      if(!test_team_in_prediction(d, current_prediction))
        return d;
    })

    reversed_all_end_games = reversed_all_end_games.filter(function(d) {
      if(!test_game_in_prediction(d, current_prediction))
        return d;
    })

  } else {
    current_prediction = [];
  }


  // Randomize array
  list_teams.sort(function() {
    return Math.random() - 0.5;
  });

  var simulated_prediction = []

  // Fill the non-qualified teams first
  while(reversed_all_end_games.length > 0) {

    var candidate_game = reversed_all_end_games.shift();
    var candidate_team = list_teams.shift();
    var nb_try = 100;

    while(!test_team_play_game(candidate_team, candidate_game) && !test_team_in_prediction(candidate_team, simulated_prediction.concat(current_prediction)) && nb_try > 0) {

      // Put back the team
      list_teams.push(candidate_team);

      if(dev) {
        console.log(list_teams, simulated_prediction.length, nb_try)
      }

      candidate_team = list_teams.shift();

      nb_try--;
    }

    if(nb_try<= 0) {
      if(dev) {
        console.log("--------------GAVE UP", candidate_team, candidate_game)
      }
    //  reversed_all_end_games.push(candidate_game);
    //  list_teams.push(candidate_team);
    } else {

      simulated_prediction.push([candidate_game, candidate_team]);
      if(dev) {
        console.log(candidate_team, "--->", candidate_game)
      }

    }

  }

  if(dev) {
    console.log("ended simulation with nb game left", reversed_all_end_games)
  }

  simulated_prediction = simulated_prediction.concat(current_prediction);
  display_prediction(simulated_prediction, current_prediction)
  current_prediction = simulated_prediction;
  update_url('simulate-tournament');
  update_paths();
  update_complete(6000);
}

function find_teams_by_group(group) {
  return data.teams.filter(function(d) { return d.group == group})
}

function test_team_in_prediction(team, prediction) {
  return prediction.filter(function(d, i) {
      if(d[1] == team)
        return d;
    }).length > 0;
}

function find_game_team_in_prediction(team, prediction) {
  if(dev) {
    console.log("FIBND", team, prediction)
  }
  return prediction.filter(function(d, i) {
      if(d[1] == team)
        return d;
    })[0];
}

function test_game_in_prediction(game, prediction) {
  return prediction.filter(function(d, i) {
      if(d[0] == game)
        return d;
    }).length > 0;
}

function reset_tournament() {

  var reset_duration = 2000, reset_delay = 1000;

  display_prediction([], current_prediction);
  current_prediction = [];

  data.teams.forEach(function(t) {

    move_team_flag(t.alias, t.alias+"0", reset_duration* Math.random(), reset_delay, true);

  })

  update_url('reset-tournament');
  update_paths();
  update_complete(reset_duration + reset_delay);
}

function reset_team(team, _duration) {

  var duration = _duration;

  if(dev) {
    console.log("[reset_team]", team)
  }

  if(typeof _duration == 'undefined') {
    duration = _duration;
  }

  move_team_flag(team, team+"0", duration, 0, true);

  current_prediction = remove_team_prediction(team, current_prediction);

  update_url('reset-team');
  update_paths();
  update_complete(duration);
}

// Predictions look like that: var predictions = [ ["W62", "FRA"],  ["W61", "BRA"] ];
function display_prediction(new_prediction, old_prediction) {

  // Put back the teams which are not in the prediction anymore..
  var diff_teams = diff_prediction(new_prediction, old_prediction);

////// TOFIX
  data.teams.forEach(function(d, i) {

  //  move_team_flag(d.alias, d.alias+"0", 400, 400, true);
  })

  new_prediction.forEach(function(d, i) {

    var game_paths = filter_paths_by_game(d[0], all_paths);
    var current_paths = filter_paths_by_team(d[1], game_paths);

    var index_path = all_paths.indexOf(current_paths[0])


    //move_team_flag_path_anim(d[1], index_path, i*100, false)
    move_team_flag(d[1], d[0], 5000*Math.random(), 1000, true);

   var coords = get_team_coordinates(d[0]);

     d3.select("#flag2_"+d[1])
      .transition().duration(100).delay(100)
      .attr({"x": function(e, j) { return coords[0]+80; }, "y": function(e, j) { return coords[1]+45; }})
      .attr("transform", "translate(0, 0)")
      .each("start", function() {
        d3.select(this).style("opacity", 0)
      })
  })

}

function add_team_game_prediction(team, game, prediction, replace) {

  remove_team_prediction(team, prediction);
  prediction.push([game, team]);

  // Remove the team that using the current game position
  if(replace) {

  }

  return prediction;
}

// Make sure not already in it, if it is then remove it
function remove_team_prediction(team, prediction) {

  return prediction.filter(function(d, i) {
    if(d[1] != team)
      return d;
  })

}

// Return the one in 1 but not in 2
function diff_prediction(prediction1, prediction2) {
 return prediction1.filter(function(d) { return prediction2.indexOf(d) < 0;});

}

function store_current_team(d, i) {
  current_team = d.alias;
  current_prediction = remove_team_prediction(current_team, current_prediction);
}

function duplicate_trajectory(t) {
  return t.map(function(d, i) { return d; });
}

function duplicate_array(a) {
  return a.map(function(d, i) { return d; });
}

function decode_url() {
  var queryParameters = [];
      // Creates a map with the query string parameters
  while (m = re.exec(queryString)) {
    queryParameters.push([decodeURIComponent(m[1]), decodeURIComponent(m[2])]);
  }

  // If we have some query parameter, likely to have a uuid
  if(queryParameters.length > 0 && queryParameters[0][0] == "uuid") {
    uuid = queryParameters[0][1];
    queryParameters.shift();
  } else if(queryParameters.length > 0 && queryParameters[0][0] == "ref") {
    ref = queryParameters[0][1];
    queryParameters.shift();
  }

  // If we have some query parameter, likely to have a uuid
  if(queryParameters.length > 0 && queryParameters[0][0] == "uuid") {
    uuid = queryParameters[0][1];
    queryParameters.shift();
  } else if(queryParameters.length > 0 && queryParameters[0][0] == "ref") {
    ref = queryParameters[0][1];
    queryParameters.shift();
  }


  return queryParameters;
}

function update_url(origin) {

  var queryParameters = "";

  // Adding unique ID to the URL
  queryParameters = queryParameters.concat("uuid=" + uuid).concat("&ref=" + ref);

  // Appending the current selection
  current_prediction.map(function(d) { queryParameters += "&" + d[0]+ "=" + d[1]; });

  var new_url = window.location.origin+window.location.pathname+"?"+queryParameters;

  logging('auto', 'update-url', {origin: origin, current_prediction: current_prediction});

  history.replaceState({}, "Title", new_url);
  d3.select("#new-url").attr("href", new_url)

  return queryParameters;
}

// function get_details(state) {
//
//   d3.text("php/details.php?state="+state+"&"+update_url(false), function() {})
//
// }

// Credits: http://bl.ocks.org/mbostock/5649592
function transition(path) {
  path.transition()
      //.delay(70500*Math.random())
      //.duration(7500*Math.random())
      .attrTween("stroke-dasharray", tweenDash)
      .style("opacity", .1)
      .each("end", function() { d3.select(this).call(transition); });
}

function tweenDash() {
  var l = this.getTotalLength(),
      i = d3.interpolateString("0," + l, l + "," + l);
  return function(t) { return i(t); };
}


function closestPoint(pathNode, point) {
  var pathLength = pathNode.getTotalLength(),
      precision = pathLength / pathNode.pathSegList.numberOfItems * .125,
      best,
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
  best.pathlength = bestLength;
  return best;

  function distance2(p) {
    var dx = p.x - point[0],
        dy = p.y - point[1];
    return dx * dx + dy * dy;
  }
}

// Credits: http://bl.ocks.org/mbostock/1705868
function move_team_flag_path_anim(team, which_path, delay, go_back) {

  if (typeof go_back == 'undefined') {
    go_back = true;
  }

  if (typeof delay == 'undefined') {
    delay = 0;
  }

  var path = d3.select("#path_"+which_path)//.attr("transform", "translate(" + 0 + ", " + 0+")");;

  var marker = d3.select("#gFlag_"+team)// svg.append("circle");

  // TODO: turn into transforms
  var flag_x = parseInt(d3.select("#flag_"+team).attr("x"))-100;
  var flag_y = parseInt(d3.select("#flag_"+team).attr("y"))-50;

  var flag_point = [flag_x, flag_y];
  var progress = 0;
//  var path_point = path.node().getPointAtLength(progress);

  //  .attr("transform", function(e, j) {
  //    return "translate(" + (coords[0]+80)  + "," + (coords[1]+40) + ")";
  //  })

  var path_point =  closestPoint(path.node(), flag_point);


  path_transition();

  if(go_back) {
    if(dev) {
      console.log("Reversed")
    }
  }

  function path_transition() {

    marker.transition()
        .duration(path_point.pathlength)
        .delay(delay)
        .ease("linear")
        .attrTween("transform", function() {
          return "translate(" + translateAlong_x(path.node()) + "," + translateAlong_y(path.node()) + ")";
        });

     //   .each("end", path_transition);// infinite loop
     //TODO: move to exact positions
  }

  function translateAlong_x(path) {
    var l = path_point.pathlength; //path.getTotalLength(); // should be remaining path
     if(go_back)
      l = path.getTotalLength() - l;; // should be remaining path
    return function(i) {
      return function(t) {
        var p = path.getPointAtLength(l - t * l);
        if(go_back)
          p = path.getPointAtLength(t * l);
        return p.x+80;
      }
    }
  }

  function translateAlong_y(path) {
    var l = path_point.pathlength;
    if(go_back)
      l = path.getTotalLength() - l;; // should be remaining path
    return function(i) {
      return function(t) {
        var p = path.getPointAtLength(l - t * l);
        if(go_back)
          p = path.getPointAtLength(t * l);
        return p.y+40;
      }
    }
  }

}

// Credits: https://dev.twitter.com/discussions/890
function updateTwitterValues() {
  var share_url = window.location.href;
  var title = "My predictions for the UEFA Champions League #ucl";
  var original_url = "http://www.predict.re/ucl/";
// clear out the <a> tag that's currently there...probably don't really need this since you're replacing whatever is in there already.
  d3.select(".twitter-share-container").html('&nbsp;');
  d3.select(".twitter-share-container").html('<a href="https://twitter.com/share" class="twitter-share-button" data-url="' + share_url +'" data-via="predictgy" data-size="small" data-counturl="' + original_url + '" data-text="' + title + '" >Tweet</a>');

  setTimeout(function() {twttr.widgets.load();}, 500);
}

function logging(interaction, type, value) {

  if(dev) {
    console.log("[logging]", interaction, type, value);
  }

}

// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4()+s4()+s4();
}

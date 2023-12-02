var width_n2 = 1400,
    height_n2 = 1200;

var svg_n2 = d3.select("body").append("svg")
    .attr("width", "100%")
    .attr("height", height_n2);

const radius_n2 = Math.min(width_n2, height_n2) / 2 - 50;

var force_n2 = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(100))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width_n2 / 2, height_n2 / 2))
    .force("x", d3.forceX(width / 2).strength(0.1))
.force("y", d3.forceY(height / 2).strength(0.1));

d3.json("./data/graphFile_data.json").then(function(json_n2) {
    force_n2
        .nodes(json_n2.nodes)
        .force("link").links(json_n2.links);


        var countryContainer_n2 = d3.select("#country-checkbox-container_n2");
        var clubContainer_n2 = d3.select("#club-checkbox-container_n2");
        
    
        populateCheckboxes_n2(json_n2, countryContainer_n2, "country", "nationality");
        populateCheckboxes_n2(json_n2, clubContainer_n2, "club", "club");

        countryContainer_n2.selectAll("input").on("change", function() {
            updateVisualization_n2(node_n2, link_n2, getSelectedValues_n2(countryContainer_n2), "nationality");
        });
    
        clubContainer_n2.selectAll("input").on("change", function() {
            updateVisualization_n2(node_n2, link_n2, getSelectedValues_n2(clubContainer_n2), "club");
        });

    var link_n2 = svg_n2.selectAll(".link")
        .data(json_n2.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke", function(d) { 
            return d.weight > 4 ? "#B31312" : "green";
        })
        .style("stroke-width", function(d) { return Math.sqrt(d.weight); });

    var node_n2 = svg_n2.selectAll(".node")
        .data(json_n2.nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted_n2)
            .on("drag", dragged_n2)
            .on("end", dragended_n2));

        addTooltip_n2(node_n2, json_n2);

    node_n2.append("circle")
        .attr("r", function(d) {
            var negativeInteractions_n2 = json_n2.links.filter(function(link) {
                return (link.source === d || link.target === d) && link.weight > 4;
            }).length;
            var positiveInteractions_n2 = json_n2.links.filter(function(link) {
                return (link.source === d || link.target === d) && link.weight <= 4;
            }).length;

            if(negativeInteractions_n2 < positiveInteractions_n2)
            return 10 + negativeInteractions_n2 * 3 + positiveInteractions_n2 * 5;

          // Scale radius based on the number of high-weight connections
          return 10 + negativeInteractions_n2 * 9; 
        })
        .style("fill", function(d) {
            var negativeInteractions_n2 = json_n2.links.filter(function(link) {
                return (link.source === d || link.target === d) && link.weight > 4;
            }).length;
            var positiveInteractions_n2 = json_n2.links.filter(function(link) {
                return (link.source === d || link.target === d) && link.weight <= 4;
            }).length;
            if (negativeInteractions_n2 > positiveInteractions_n2) {
                return "#B31312";
            } else if (negativeInteractions_n2 > 0) {
                return "grey";
            } else {
                return "green";
            }
        });

    node_n2.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; })
        .style("fill", "white");


    force_n2.on("tick", function() {
        // Define the radius of the circle
        const radius = Math.min(width_n2, height_n2) / 2 - 50; 
    
        // Constrain nodes within the circle
        json_n2.nodes.forEach((node) => {
            const distance = Math.sqrt(
                Math.pow(node.x - width_n2 / 2, 2) + Math.pow(node.y - height_n2 / 2, 2)
            );
            const angle = Math.atan2(node.y - height_n2 / 2, node.x - width_n2 / 2);
            if (distance > radius) {
                node.x = width_n2 / 2 + radius * Math.cos(angle);
                node.y = height_n2 / 2 + radius * Math.sin(angle);
            }
        });
    
        // Update the positions of the links and nodes
        link_n2
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
    
        node_n2
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
    
});



  
    function dragstarted_n2(event, d) {
      if (!event.active) force_n2.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
  
    function dragged_n2(event, d) {
      d.fx = event.x;
      d.fy = event.y;
  
      // Update the positions of connected nodes
      links.forEach((link) => {
        if (link.source === d.id) {
          const targetNode = nodes.find((node) => node.id === link.target);
          if (targetNode) {
            targetNode.fx = event.x;
            targetNode.fy = event.y;
          }
        } else if (link.target === d.id) {
          const sourceNode = nodes.find((node) => node.id === link.source);
          if (sourceNode) {
            sourceNode.fx = event.x;
            sourceNode.fy = event.y;
          }
        }
      });
    }
  
    function dragended_n2(event, d) {
      if (!event.active) force_n2.alphaTarget(0);
      d.fx = null;
      d.fy = null;
  
      // Release connected node positions
      nodes.forEach((node) => {
        if (node.fx === event.x && node.fy === event.y) {
          node.fx = null;
          node.fy = null;
        }
      });
    }
  
function populateCheckboxes_n2(data, container, containerId, key) {
    var items = Array.from(new Set(data.nodes.map(node => node[key])));
    items.sort();

    items.forEach(function(item) {
        var label = container.append("label");
        label.append("input")
            .attr("type", "checkbox")
            .attr("value", item)
            .attr("id", containerId + "-" + item);
        label.append("span").text(item);
    });
}

function updateVisualization_n2(node, link, selectedValues, key) {
    node.style("display", function(d) {
        return selectedValues.includes(d[key]) ? "block" : "none";
    });
    link.style("display", function(d) {
        return selectedValues.includes(d.source[key]) && selectedValues.includes(d.target[key]) ? "block" : "none";
    });
}

function addTooltip_n2(node, json) {
    var tooltip = d3.select("#tooltip_n2");

    node.on("mouseover", function(event, d) {
        var redEdgesCount = json.links.filter(function(link) {
            return (link.source === d || link.target === d) && link.weight > 4;
        }).length;
        var greenEdgesCount = json.links.filter(function(link) {
            return (link.source === d || link.target === d) && link.weight <= 4;
        }).length;

        var totalWeight = json.links
            .filter(function(link) { return link.source === d || link.target === d; })
            .reduce(function(weight, link) { return weight + link.weight; }, 0);

        var tooltipHtml = "<strong>Name:</strong> " + d.name + "<br/>" +
                          "<strong>Nationality:</strong> " + d.nationality + "<br/>" +
                          "<strong>Club:</strong> " + d.club + "<br/>" +
                          "<strong>Negative Interactions:</strong> " + redEdgesCount + "<br/>" +
                          "<strong>Goals Involved:</strong> " + totalWeight + "<br/>";

        // Determine the observation based on the node's edges count
        var observation;
        if (redEdgesCount === 0) {
            observation = "<span class=\"highlight_green_n2\">Good performer</span>";
        } else if (redEdgesCount > greenEdgesCount) {
           //observation = "Match fixing risk";
           observation = "<span class=\"highlight_red_n2\">Match fixing risk</span>";
        } else {
            observation = "<span class=\"highlight_neutral_n2\">Neutral</span>";
        }

        // Add the observation to the tooltip HTML
        tooltipHtml += "<strong>status:</strong> " + observation;

        tooltip.html(tooltipHtml)
               .style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 10) + "px")
               .style("opacity", 1);
    })
    .on("mouseout", function() {
        tooltip.style("opacity", 0);
    });
}


function getSelectedValues_n2(container) {
  var checkedValues_n2 = [];
  container.selectAll("input:checked").each(function() {
    checkedValues_n2.push(this.value);
  });
  return checkedValues_n2;
}


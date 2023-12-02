function generateGraph(data, defaultSelectedCountries) {
    // Create SVG container
    const width = 1400;
    const height = 1100;
    const svg = d3.select("#graph_n").attr("width", width).attr("height", height);
    const filteredData = data.filter((player) =>
      defaultSelectedCountries.includes(player.nationality_name)
    );
  
    // Clear previous graph elements
    svg.selectAll("*").remove();
  
    const nationalityNodes = {};
    const clubNodes = {};
    const nodes = [];
    const links = [];
  
    // Process filtered data to create nodes and links
    filteredData.forEach((d) => {
      // Add player node
      nodes.push({
        id: d.sofifa_id,
        label: d.short_name,
        node_type: "player",
        club_team_id: d.club_team_id,
        nationality_id: d.nationality_id,
      });
  
      // Check if nationality node exists, if not, create it
      if (!nationalityNodes[d.nationality_id]) {
        nationalityNodes[d.nationality_id] = {
          id: `nationality_${d.nationality_id}`,
          label: d.nationality_name,
          node_type: "nationality",
          nationality_id: d.nationality_id,
          count: 1, // Initialize the count
        };
  
        nodes.push(nationalityNodes[d.nationality_id]);
      } else {
        nationalityNodes[d.nationality_id].count += 1; // Increment the count for existing nationality nodes
      }
  
      // Check if club node exists, if not, create it
      if (!clubNodes[d.club_team_id]) {
        clubNodes[d.club_team_id] = {
          id: `club_${d.club_team_id}`,
          label: d.club_name,
          node_type: "club",
          club_team_id: d.club_team_id,
          count: 1,
        };
  
        nodes.push(clubNodes[d.club_team_id]);
      } else {
        clubNodes[d.club_team_id].count += 1; // Increment the count for existing nationality nodes
      }
  
      // Add links between player and club
      links.push({
        source: d.sofifa_id,
        target: `club_${d.club_team_id}`,
      });
  
      // Add links between player and nationality
      links.push({
        source: d.sofifa_id,
        target: `nationality_${d.nationality_id}`,
      });
    });
   
  

    svg.selectAll("circle").data(nodes).enter().append("circle");
  
    // Create lines for links
    svg.selectAll("line").data(links).enter().append("line");
  
    // simulation for forces
    const simulation = d3
      .forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1));
  
    // Create links
    const link = svg
      .selectAll(".link")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "black")
      .attr("stroke-width", 1);
  
    // Create nodes
    const node = svg
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", (d) => `node ${d.node_type}`);
  
    node
      .append("circle")
      .attr("r", (d) => {
        if (d.node_type === "player") return 15;
        else if (d.node_type === "club") {
          // Calculate radius based on count
          if (d.count > 1) return Math.max(40, 40 + d.count * 5);
          else return 35;
        } else if (d.node_type === "nationality") {
          // Calculate radius based on count
          if (d.count > 1) return Math.max(40, 40 + d.count * 2);
          else return 30;
        }
        return 40;
      })
      .attr("fill", (d) => {
        if (d.node_type === "player") return "orange";
        else if (d.node_type === "club") return "#2ecc71";
        else return "#B31312";
      })
      .attr("class", (d) => {
        return `node ${d.node_type}`; 
      });
  
    const nationalityNode = node.filter((d) => d.node_type === "nationality");
  
    nationalityNode
      .append("text")
      .attr("class", "label")
      .attr("dy", 5)
      .text((d) => d.label);
  
    const clubNode = node.filter((d) => d.node_type === "club");
  
    clubNode
      .append("text")
      .attr("class", "label")
      .attr("dy", 5)
      .text((d) => {
        const labelWords = d.label.split(" ");
        return labelWords.length > 1 ? labelWords[0] : d.label;
      });
  
    // Add event listeners for tooltips
    node.on("mouseover", handleMouseOver).on("mouseout", handleMouseOut);
  
    function handleMouseOver(event, d) {
      const tooltip = d3.select("#tooltip_n");
  
      // Define tooltip content based on node type
      let tooltipContent = `<strong>${d.label}</strong>`;
      
      // If the hovered node is a nationality, include the count of players
      if (d.node_type === "club" || d.node_type === "nationality") {
        tooltipContent += `<br/>Players: ${d.count}`;
      }

      if (
        d.node_type === "club" ||
        d.node_type === "nationality" ||
        d.node_type === "player"
      ) {
        tooltip
          .html(tooltipContent)
          .style("left", event.pageX + 10 + "px") 
          .style("top", event.pageY - 20 + "px")
          .style("opacity", 1) 
          .style("display", "block"); 
      }
    }
  
    function handleMouseOut() {
      const tooltip = d3.select("#tooltip_n");
      tooltip
        .style("opacity", 0) 
        .style("display", "none"); 
    }
  
    // Implement tick function for simulation
    simulation.on("tick", () => {
      const radius = 700;
      nodes.forEach((node) => {
        const distance = Math.sqrt(
          Math.pow(node.x - width / 2, 2) + Math.pow(node.y - height / 2, 2)
        );
        const angle = Math.atan2(node.y - height / 2, node.x - width / 2);
  
        if (distance > radius) {
          node.x = width / 2 + radius * Math.cos(angle);
          node.y = height / 2 + radius * Math.sin(angle);
        }
      });
  
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
  
      link
        .attr("x1", (d) => {
          const sourceNode = nodes.find((node) => node.id === d.source);
          return sourceNode ? sourceNode.x : 0; 
        })
        .attr("y1", (d) => {
          const sourceNode = nodes.find((node) => node.id === d.source);
          return sourceNode ? sourceNode.y : 0; 
        })
        .attr("x2", (d) => {
          const targetNode = nodes.find((node) => node.id === d.target);
          return targetNode ? targetNode.x : 0; 
        })
        .attr("y2", (d) => {
          const targetNode = nodes.find((node) => node.id === d.target);
          return targetNode ? targetNode.y : 0; 
        });
    });
  
    const dragHandler = d3
      .drag()
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded);
  
    dragHandler(node);
  
    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
  
    function dragged(event, d) {
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
  
    function dragEnded(event, d) {
      if (!event.active) simulation.alphaTarget(0);
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
  }

  // List of important countries
  var importantCountries = [
    "Brazil",
    "Germany",
    "Italy",
    "Argentina",
    "France",
    "England",
    "Netherlands",
    "Portugal",
    "Algeria",
    "Uruguay",
    "Croatia",
    "Mexico",
    "Sweden",
    "Russia",
    "Poland",
    "Denmark",
    "Switzerland",
    "Turkey",
    "Colombia",
  ];
  
  fetch("../data/network_data.json") 
    .then((response) => response.json()) 
    .then((data) => {
      const countries = new Set();
      data.forEach((item) => countries.add(item.nationality_name));
      const uniqueCountries = Array.from(countries);
      importantCountries = uniqueCountries;
    })
    .catch((error) => console.error("Error fetching data:", error));
  
  importantCountries.sort();
  
  fetch("../data/network_data.json")
    .then((response) => response.json())
    .then((data) => {
      const checkboxContainer = document.getElementById("countryCheckboxes");
  
      importantCountries.forEach((country) => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = country;
        checkbox.value = country;
        checkbox.name = "country";
  
        const label = document.createElement("label");
        label.htmlFor = country;
        label.appendChild(document.createTextNode(country));
  
        const checkboxItem = document.createElement("div");
        checkboxItem.className = "checkbox-item";
        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(label);
  
        checkboxContainer.appendChild(checkboxItem);
      });
  
      // Default selected countries
      const defaultSelectedCountries = ["Brazil", "Algeria", "Argentina"];
      defaultSelectedCountries.forEach((country) => {
        const checkbox = document.getElementById(country);
        if (checkbox) {
          checkbox.checked = true;
        }
      });
  
      generateGraph(data, defaultSelectedCountries);
    })
    .catch((error) => {
      console.log("Error fetching the data:", error);
    });
  
  // Event Listener for Checkbox Changes
  const checkboxContainer = document.getElementById("countryCheckboxes");
  checkboxContainer.addEventListener("change", function () {
    const selectedCountries = Array.from(
      checkboxContainer.querySelectorAll('input[type="checkbox"]:checked')
    ).map((cb) => cb.value);
    fetch("../data/network_data.json")
      .then((response) => response.json())
      .then((data) => {
        generateGraph(data, selectedCountries);
      });
  });
  
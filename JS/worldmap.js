// Define the SVG and projection
const width = 1000;
const height = 620;
const svg = d3.select('#map-chart-container').append('svg')
               .attr('width', width)
               .attr('height', height);
const projection = d3.geoMercator().scale(150).translate([width / 2, height / 1.4]);
const path = d3.geoPath().projection(projection);
const g = svg.append('g');

let selectedCountry;


function randomPosition() {
    // Get the dimensions of the viewport
    var vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    
    // Calculate random positions within the viewport
    var randomX = Math.floor(Math.random() * vw);
    var randomY = Math.floor(Math.random() * vh);
    
    // Move the football to the random position
    var football1 = document.getElementById('football1');
    football1.style.left = randomX + 'px';
    football1.style.bottom = randomY + 'px';
    // Calculate random positions within the viewport
    var randomX = Math.floor(Math.random() * vw);
    var randomY = Math.floor(Math.random() * vh);
    
    // Move the football to the random position
    var football2 = document.getElementById('football2');
    football2.style.left = randomX + 'px';
    football2.style.bottom = randomY + 'px';
  }
  
  // Start moving the football every 0.5 seconds
  var moveInterval = setInterval(randomPosition, 100);
  
  // Stop the animation after 5 seconds
  setTimeout(function() {
    clearInterval(moveInterval);
    var football1 = document.getElementById('football1');
    football1.style.display = 'none';
    var football2 = document.getElementById('football2');
    football2.style.display = 'none';
  }, 5000);

// Initialize data structures
let playerData = [];
let countriesWithPlayers = new Set();
const tooltip = d3.select("body").append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

// Function to process player data
function processPlayerData(data) {
    playerData = data;
    data.forEach(player => countriesWithPlayers.add(player.nationality_name));
    renderMap();
}

// Function to handle mouseover on countries
function handleCountryMouseover(event, d) {
    const countryName = d.properties.name;
    const players = playerData.filter(player => player.nationality_name === countryName);
    tooltip.transition().duration(200).style("opacity", .9);
    tooltip.html(players.length > 0 ? 
        (`<strong>${countryName}</strong><br/>Players: ${players.length}`) :
        (`<strong>${countryName}</strong><br/>No players`)
    )
    .style("left", (event.pageX) + "px")
    .style("top", (event.pageY - 28) + "px");
}

// Function to render the world map
function renderMap() {
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
        .then(data => {
            const countries = topojson.feature(data, data.objects.countries);
            g.selectAll('path')
                .data(countries.features)
                .enter()
                .append('path')
                .attr('class', 'country')
                .attr('d', path)
                .attr('fill', d => countriesWithPlayers.has(d.properties.name) ? '#4c8c4a' : '#a5d6a7')
                .on('mouseover', handleCountryMouseover)
                .on('mouseout', () => tooltip.transition().duration(500).style("opacity", 0))
                .on('click', (event, d) => {
                    if (countriesWithPlayers.has(d.properties.name)) {
                        fetchTopPlayers(d.properties.name);
                    }
                });
        })
        .catch(error => console.error("Error loading the map data: ", error));
}

// Load player data and then render the map
d3.csv('/data/players_data.csv').then(processPlayerData).catch(error => {
    console.error("Error loading the player data: ", error);
});



function displayPlayers(players, skill) {
    const playerList = d3.select('#playerList');
    playerList.html(''); // Clear previous data

    players.forEach(player => {
        const card = playerList.append('div').attr('class', 'player-card');

        // Player Image
        card.append('img')
            .attr('src', player.player_face_url)
            .attr('class', 'player-image');

        // Player Name
        card.append('div').text(player.short_name);

        // Player Skill Value
        //card.append('p').text(skill.charAt(0).toUpperCase() + skill.slice(1) + ": " + player[skill]);
        card.append('div').text( player[skill]).attr('class', 'player-score');

        // Club Logo
        card.append('img')
            .attr('src', player.club_logo_url)
            .attr('class', 'club-logo');

        // National Flag
        card.append('img')
            .attr('src', player.nation_flag_url)
            .attr('class', 'nation-flag');

        // More details link
        card.append('a')
            .attr('href', player.player_url)
            .attr('target', '_blank')
            .text('Details');
    });
}

// Skill Dropdown
const dropdownWidth = 200;
const dropdownHeight = 50;
const foreignObject = svg.append("foreignObject")
    .attr("width", dropdownWidth)
    .attr("height", dropdownHeight)
    .attr("x", 10)
    .attr("y", 10);

const div = foreignObject.append("xhtml:div");

div.append("select")
    .attr("id", "skillSelector")
    .attr("class", "form-control")
    .style("width", "100%")
    .selectAll("option")
    .data(["shooting", "passing", "dribbling", "defending", "physic"])
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d.charAt(0).toUpperCase() + d.slice(1));

// Assuming you have already declared selectedCountry at a higher scope and initialized it with an empty string or null

function fetchTopPlayers(country) {
    // No need to declare selectedCountry here; use the global variable
    const selectedSkill = d3.select("#skillSelector").node().value;

    const playersFromCountry = playerData.filter(player => player.nationality_name === country);
    const topPlayers = playersFromCountry.sort((a, b) => b[selectedSkill] - a[selectedSkill]).slice(0, 5);

    displayPlayers(topPlayers, selectedSkill);
}

d3.select("#skillSelector").on("change", () => {
    selectedCountry = d3.select(this).node().value;
    console.log("here....");
    if (selectedCountry!="") {
        console.log(selectedCountry);
        fetchTopPlayers(selectedCountry);
    }
    console.log("here333....");
    
});

d3.select("#countrySelector").on("change", function() {
    selectedCountry = d3.select(this).node().value;
    if (selectedCountry) {
        const selectedSkill = d3.select("#skillSelector").node().value;
        fetchTopPlayers(selectedCountry, selectedSkill);
    }
});

d3.select('#viewTreeChart').on('click', function() {
    window.location.href = 'treechart.html';
});

d3.select('#viewBarChart').on('click', function() {
    window.location.href = './SKILLS/index.html';
});

function toggleSidebar() {
    var sidebar = document.getElementById("sidebar");
    var mainContent = document.getElementById("main-content");
  
    // Check if sidebar is open and toggle class
    if (sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      mainContent.classList.remove("sidebar-open");
    } else {
      sidebar.classList.add("open");
      mainContent.classList.add("sidebar-open");
    }
}

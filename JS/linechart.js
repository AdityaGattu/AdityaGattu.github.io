// linechart.js
// Line Chart Code Start

const barMetrics = { top: 22, right: 25, bottom: 130, left: 60 };
const barWidth = 620 - barMetrics.left - barMetrics.right;
const barHeight = 510 - barMetrics.top - barMetrics.bottom;
    
const lineMetrics = { top: 22, right: 70, bottom: 105, left: 120 };
const lineWidth = 700 - lineMetrics.left - lineMetrics.right;
const lineHeight = 510 - lineMetrics.top - lineMetrics.bottom;

const lineChartSVG = d3.select("#chart-area_lc").append("svg")
    .attr("width", lineWidth + lineMetrics.left + lineMetrics.right)
    .attr("height", lineHeight + lineMetrics.top + lineMetrics.bottom)
  .append("g")
    .attr("transform", `translate(${lineMetrics.left},${lineMetrics.top})`);

lineChartSVG.append("text")
  .attr("text-anchor", "end")
  .attr("x", lineWidth / 2 + lineMetrics.left - 100)
  .attr("y", lineHeight + lineMetrics.bottom - 50)
  .text("Year") 
  .attr("fill", "#fff"); 


fetchData();
let worldCupData;

function fetchData() {
  d3.csv("/data/Fifa_Summary.csv").then( dataset => {

    dataset.forEach(entry => {
  
      entry.YearConverted = Number(entry.WORLD_CUP_YEAR);
      entry.TeamsCount = Number(entry.TEAMS_COUNT);
      entry.MatchesCount = Number(entry.MATCHES_COUNT); 
      entry.GoalsTotal = Number(entry.GOALS_COUNT); 
      entry.AverageGoals = Number(entry.AVERAGE_GOALS_PER_GAME); 
      entry.TeamsQualified = Number(entry.QUALIFIED_TEAMS_COUNT);
      entry.TotalAttendance = Number(entry.ATTENDANCE_STRENGTH);
    });
    
    worldCupData = dataset;

    lineChartSVG.append("text")
                .attr("text-anchor", "end")
                .attr("id", "yaxis-label")
                .attr("transform", "rotate(-90)")
                .attr("y", -lineMetrics.left + 70)
                .attr("x", -lineHeight / 2)
                .text("Goals Total") 
                .attr("fill", "#fff"); 

    updateMetricLineChart("GoalsTotal", 1910, 2030, 0);
  });
}

function updateMetricLineChart(metric,startYear,endYear,timeOut) {
  console.log(metric, startYear, endYear, timeOut);
endYear = Number(endYear);
startYear = Number(startYear);

let dataWithinRange = worldCupData.filter((item) => item.YearConverted > startYear && item.YearConverted < endYear);

dataWithinRange.sort((first, second) => first.YearConverted - second.YearConverted);

let earliestYear = d3.min(dataWithinRange, entry => entry.YearConverted);
let latestYear = d3.max(dataWithinRange, entry => entry.YearConverted);
console.log(earliestYear, latestYear);

let scaleX = d3.scaleLinear().range([0, lineWidth]);
let scaleY = d3.scaleLinear().range([lineHeight, 0]);

let lineGenerator = d3.line();

scaleX.domain([earliestYear, latestYear]);

scaleY.domain([
  0,
  d3.max(dataWithinRange, entry => entry[metric])
]);

lineGenerator.x(dataPoint => scaleX(dataPoint.YearConverted));

let dataCircles = lineChartSVG.selectAll("circle").data(dataWithinRange);

dataCircles.exit().remove();

const tooltipLineChart = d3.select('.tooltip');

dataCircles.enter()
           .append("circle")
           .attr("r", 7)
           .attr("cy", dataPoint => scaleY(dataPoint[metric]))
           .attr("cx", dataPoint => scaleX(dataPoint.YearConverted))
           .attr("fill", "#FF6666")
          .on("mouseover", function (event, d) {
            d3.select(event.target).classed('hovered_lc', true);
            tooltipLineChart.transition()
              .duration(200)
              .style("opacity", 0.9);
              
              tooltipLineChart.html(`<strong>Year:</strong> ${d.YearConverted}<br>
              <strong>${metric}:</strong> ${d[metric]}`)
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function (event, d) {
            d3.select(event.target).classed('hovered_lc', false);
            tooltipLineChart.transition()
              .duration(500)
              .style("opacity", 0);
          });

lineGenerator.y(dataPoint => scaleY(dataPoint[metric]));

dataCircles
  .transition()
  .duration(900)
  .attr("cy", dataPoint => scaleY(dataPoint[metric]))
  .attr("cx", dataPoint => scaleX(dataPoint.YearConverted));

dataCircles
  .on("mouseover", function (event, d) {
    d3.select(event.target).classed('hovered_lc', true);
    tooltipLineChart.transition()
      .duration(200)
      .style("opacity", 0.9);
      tooltipLineChart.html(`<strong>Year:</strong> ${d.YearConverted}<br>
      <strong>${metric}:</strong> ${d[metric]}`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", function (event, d) {
    d3.select(event.target).classed('hovered_lc', false);
    tooltipLineChart.transition()
      .duration(500)
      .style("opacity", 0);
  });

let horizontalAxis = d3.axisBottom(scaleX)
  .tickFormat(d3.format("d"))
  .ticks(9);

let verticalAxis = d3.axisLeft(scaleY);

let groupForVerticalAxis = lineChartSVG.append("g")
  .classed("y-axis axis", true);

let groupForHorizontalAxis = lineChartSVG.append("g")
  .classed("x-axis axis", true)
  .attr("transform", `translate(0,${lineHeight})`);

let axisTransition = d3.transition().duration(790);

lineChartSVG.select(".y-axis").transition(axisTransition).call(verticalAxis);
lineChartSVG.select(".x-axis").transition(axisTransition).call(horizontalAxis);

lineChartSVG.selectAll('.line_lc').transition().remove();

function delayedLineUpdate() {
  drawLine();
}

window.setTimeout(delayedLineUpdate, timeOut);

function drawLine() {
  let linePath = lineChartSVG.append("path")
    .attr("class", "line_lc")
    .style("stroke", "#FF6666");

  linePath.transition()
    .attr("d", lineGenerator(dataWithinRange))
    .duration(800)
    .attr("interpolate", "linear");
}

}

function updateChartBasedOnSelection() {
  let dataTypeDropdown = document.getElementById("data-type");
  let selectedMetric = dataTypeDropdown.options[dataTypeDropdown.selectedIndex];
  let minimumYear = document.querySelector("#From").value;
  let maximumYear = document.querySelector("#To").value;


  const ylabel = document.querySelector("#yaxis-label");
  ylabel.innerHTML = selectedMetric.innerHTML;

  let defaultMinYear = "1910";
  let defaultMaxYear = "2030";
  let defaultMetricValue = 550;

  let isYearRangeProvided = minimumYear !== "" && maximumYear !== "";

  return isYearRangeProvided ?
    updateMetricLineChart(selectedMetric.value, minimumYear, maximumYear, defaultMetricValue) :
    updateMetricLineChart(selectedMetric.value, defaultMinYear, defaultMaxYear, defaultMetricValue);
}

// Line Chart Code End



// Bar Chart Code Start

const svgBar = d3.select("#chart-container_lc")
  .append("svg")
  .attr("width", barWidth + barMetrics.left + barMetrics.right)
  .attr("height", barHeight + barMetrics.top + barMetrics.bottom)
  .append("g")
  .attr("transform", `translate(${barMetrics.left},${barMetrics.top})`);

d3.csv("/data/Bar_Graph_Skill.csv").then(function(data) {
  const countries = Array.from(new Set(data.map(d => d.nationality_name))).sort();
  const skills = Object.keys(data[0]).slice(2).sort();

  const countryDropdown = d3.select("#country-dropdown_lc");
  countries.forEach(country => {
    countryDropdown.append("option").attr("value", country).text(country);
  });

svgBar.append("text")
.attr("text-anchor", "end")
.attr("x", barWidth / 2 + barMetrics.left - 70)
.attr("y", barHeight + barMetrics.bottom - 55)
.text("Players")
.attr("fill", "#fff"); 

svgBar.append("text")
.attr("text-anchor", "end")
.attr("transform", "rotate(-90)")
.attr("y", -barMetrics.left + 20)
.attr("x", -barHeight / 2)
.text("Skill Value") 
.attr("fill", "#fff"); 


  const skillDropdown = d3.select("#skill-dropdown");
  skills.forEach(skill => {
    skillDropdown.append("option").attr("value", skill).text(skill.charAt(0).toUpperCase() + skill.slice(1));
  });

  const tooltip = d3.select("#chart-container_lc")
    .append("div")
    .attr("class", "tooltip_lc")
    .style("opacity", 0);



  function updateChart(selectedCountry, selectedSkill) {
    const filteredData = data.filter(d => d.nationality_name === selectedCountry);

    const sortedData = filteredData.sort((a, b) => {
      const aValue = parseFloat(a[selectedSkill]) || 0;
      const bValue = parseFloat(b[selectedSkill]) || 0;
      return bValue - aValue;
    }).slice(0, 10);


    const chartData = sortedData.map(d => ({
      player: d.short_name,
      value: parseFloat(d[selectedSkill]) || 0
    }));
    
    const xScale = d3.scaleBand()
      .domain(chartData.map(d => d.player))
      .range([0, barWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.value)])
      .nice()
      .range([barHeight, 0]);

      

    svgBar.selectAll(".x-axis").remove();
    svgBar.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${barHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "13px");

      svgBar.selectAll(".y-axis").remove();
      svgBar.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale))
      .style("font-size", "13px");

    const bars = svgBar.selectAll(".bar_lc")
                    .data(chartData);
    
    bars.exit()
    .transition()
    .duration(2)
    .attr('width', 0)
    .attr('height', 0)
    .remove();

    bars.enter()
      .append("rect")
      .attr("class", "bar_lc")
      .attr("x", d => xScale(d.player))
      .attr("y", d => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", d => barHeight - yScale(d.value))
      .merge(bars)
      .on("mouseover", function (event, d) {
        d3.select(event.target).classed('hovered_lc', true);
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
          
        tooltip.html(`<strong>Player:</strong> ${d.player}<br><strong>Value:</strong> ${d.value}`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function (event, d) {
        d3.select(event.target).classed('hovered_lc', false);
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      })
      .transition()
      .duration(1200)
      .attr("x", d => xScale(d.player))
      .attr("y", d => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", d => barHeight - yScale(d.value));

  }

  d3.select("#country-dropdown_lc").on("change", function() {
    const selectedCountry = d3.select("#country-dropdown_lc").node().value;
    const selectedSkill = d3.select("#skill-dropdown").node().value;
    updateChart(selectedCountry, selectedSkill)
  });

  d3.select("#skill-dropdown").on("change", function() {
    const selectedCountry = d3.select("#country-dropdown_lc").node().value;
    const selectedSkill = d3.select("#skill-dropdown").node().value;
    updateChart(selectedCountry, selectedSkill);
  });

  
const initialCountry = countries[85];
const initialSkill = skills[2];
document.getElementById("country-dropdown_lc").value = initialCountry;


updateChart(initialCountry, initialSkill);

});

// Bar Chart Code End


// Goals and Ranking Running Charts Code Start 

//Goals Running Chart Code Start

const marginGoals = { top: 30, right: 30, bottom: 120, left: 60 },
      widthGoals = 620 - marginGoals.left - marginGoals.right,
      heightGoals = 470 - marginGoals.top - marginGoals.bottom;

      const marginRanking = { top: 30, right: 70, bottom: 120, left: 120 },
      widthRanking = 800 - marginRanking.left - marginRanking.right,
      heightRanking = 470 - marginRanking.top - marginRanking.bottom;

const parseTime = d3.timeParse("%Y");

const x = d3.scaleTime().range([0, widthGoals]);
const y = d3.scaleLinear().range([heightGoals, 0]);
const yRank = d3.scaleLinear().range([heightGoals, 0]);

const valueline = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.goals));

const valuelineRank = d3.line()
  .x(d => x(d.year))
  .y(d => yRank(d.ranking));

const svgGoals = d3.select("#chart")
    .append("svg")
        .attr("width", widthGoals + marginGoals.left + marginGoals.right)
        .attr("height", heightGoals + marginGoals.top + marginGoals.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + marginGoals.left + "," + marginGoals.top + ")");

const svgRanking = d3.select("#ranking-chart")
      .append("svg")
          .attr("width", widthRanking + marginRanking.left + marginRanking.right)
          .attr("height", heightRanking + marginRanking.top + marginRanking.bottom)
      .append("g")
          .attr("transform", 
                "translate(" + marginRanking.left + "," + marginRanking.top + ")");   

svgGoals.append("text")
  .attr("text-anchor", "end")
  .attr("x", widthGoals / 2 + marginGoals.left - 30)
  .attr("y", heightGoals + marginGoals.bottom - 70)
  .text("Year") 
  .attr("fill", "#fff"); 

svgGoals.append("text")
  .attr("text-anchor", "end")
  .attr("transform", "rotate(-90)")
  .attr("y", -marginRanking.left + 80)
  .attr("x", -heightRanking / 2)
  .text("Goals") 
  .attr("fill", "#fff"); 


svgRanking.append("text")
  .attr("text-anchor", "end")
  .attr("x", widthRanking / 2 + marginRanking.left - 150)
  .attr("y", heightRanking + marginRanking.bottom - 70)
  .text("Year") 
  .attr("fill", "#fff");


svgRanking.append("text")
  .attr("text-anchor", "end")
  .attr("transform", "rotate(-90)")
  .attr("y", -marginRanking.left + 80)
  .attr("x", (-heightRanking / 2))
  .text("Ranking") 
  .attr("fill", "#fff");


const tip = d3.select("#goals-tip")
  .append("div")
  .attr('class', 'tooltip_lc')
  .style("opacity", 0);


const tipRanking = d3.select("#ranking-tip")
  .append("div")
  .attr('class', 'tooltip_lc')
  .style("opacity", 0);

let allData; 
d3.csv("/data/FIFA_GOALS_RANKING.csv").then(data => {
  allData = data.map(d => ({
    year: parseTime(d.year),
    goals: +d.goals,
    ranking: +d.ranking,
    country: d.country
  }));

  const distinctCountries = Array.from(new Set(allData.map(d => d.country))).sort();

  appendCountriesToDropdown('country1_lc', distinctCountries);
  appendCountriesToDropdown('country2_lc', distinctCountries);

  
  document.getElementById('country1_lc').value = distinctCountries[1];
  document.getElementById('country2_lc').value = distinctCountries[3];

  x.domain(d3.extent(allData, d => d.year));
  y.domain([0, d3.max(allData, d => d.goals)]);
  yRank.domain([0, d3.max(allData, d => d.ranking)]);

  svgGoals.append("g")
      .attr("transform", "translate(0," + heightGoals + ")")
      .call(d3.axisBottom(x))
      .style("font-size", "13px");
  svgGoals.append("g")
      .call(d3.axisLeft(y))
      .style("font-size", "13px");


  svgRanking.append("g")
      .attr("transform", "translate(0," + heightRanking + ")")
      .call(d3.axisBottom(x))
      .style("font-size", "13px");
  svgRanking.append("g")
      .call(d3.axisLeft(yRank))
      .style("font-size", "13px");

  if (distinctCountries.length >= 2) {
    updateLineChart(allData, distinctCountries[1], "#2FA4FF", 'country1-line');
    updateLineChart(allData, distinctCountries[3], "#FA7070", 'country2-line');

    updateRankingChart(allData, distinctCountries[1], "#2FA4FF", 'country1-line');
    updateRankingChart(allData, distinctCountries[3], "#FA7070", 'country2-line');
  }
});

function appendCountriesToDropdown(dropdownId, countries) {
  const select = document.getElementById(dropdownId);
  select.innerHTML = '';
  countries.forEach((country, index) => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    select.appendChild(option);
  });
}

function updateLineChart(data, selectedCountry, color, lineClass) {
  const countryData = data.filter(d => d.country === selectedCountry);
  svgGoals.selectAll(`.${lineClass}`).remove();
  svgGoals.selectAll(`circle.${lineClass}`).remove();

  const path = svgGoals.append("path")
    .datum(countryData)
    .attr("class", `line_lc ${lineClass}`)
    .style("stroke", color)
    .attr("d", valueline);

  const totalLength = path.node().getTotalLength();
  path.attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(4000)
    .attr("stroke-dashoffset", 0);

  svgGoals.selectAll(`circle.${lineClass}`)
    .data(countryData)
    .enter()
    .append("circle")
    .attr("class", `circle ${lineClass}`)
    .attr("r", 5.5)
    .attr("cx", d => x(d.year))
    .attr("cy", d => y(d.goals))
    .style("fill", color)
    .on('mouseover', function (event, d) {
      d3.select(event.target).classed('hovered_lc', true);
      tip.transition()
        .duration(500)
        .style("opacity", 0.9);
        var dateObject = new Date(d.year);
        var year = dateObject.getFullYear();
      
      tip.html(`<strong>Year:</strong> ${year}<br><strong>Goals:</strong> ${d.goals}<br><strong>Country:</strong> ${d.country}`
      )
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY) + "px");
    })
    .on('mouseout', function (event, d) {
      d3.select(event.target).classed('hovered_lc', false);
      tip.transition()
        .duration(500)
        .style("opacity", 0);
    });
}

document.getElementById('country1_lc').addEventListener('change', function() {
  var selectElement1 = document.getElementById('country1_lc');
  var selectedValue1 = selectElement1.value;

  var selectElement2 = document.getElementById('country2_lc');
  var selectedValue2 = selectElement2.value;

  updateLineChart(allData, selectedValue1, "#2FA4FF" ,'country1-line');
  updateRankingChart(allData, selectedValue1, "#2FA4FF", 'country1-line');
  updateLineChart(allData, selectedValue2, "#FA7070", 'country2-line');
  updateRankingChart(allData, selectedValue2, "#FA7070", 'country2-line');

});

document.getElementById('country2_lc').addEventListener('change', function() {
  var selectElement1 = document.getElementById('country1_lc');
  var selectedValue1 = selectElement1.value;

  var selectElement2 = document.getElementById('country2_lc');
  var selectedValue2 = selectElement2.value;

  updateLineChart(allData, selectedValue1, "#2FA4FF" ,'country1-line');
  updateRankingChart(allData, selectedValue1, "#2FA4FF", 'country1-line');
  updateLineChart(allData, selectedValue2, "#FA7070", 'country2-line');
  updateRankingChart(allData, selectedValue2, "#FA7070", 'country2-line');
});

//Goals Running Chart Code End


//Line Chart for Ranking

// Ranking Running Chart Code Start 


function updateRankingChart(data, selectedCountry, color, lineClass) {
  
  const countryData = data.filter(d => d.country === selectedCountry);
  svgRanking.selectAll(`.${lineClass}`).remove();
  svgRanking.selectAll(`circle.${lineClass}`).remove();

  
  const path = svgRanking.append("path")
    .datum(countryData)
    .attr("class", `line_lc ${lineClass}`)
    .style("stroke", color)
    .attr("d", valuelineRank);

  const totalLength = path.node().getTotalLength();
  path.attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(4000)
    .attr("stroke-dashoffset", 0);

  svgRanking.selectAll(`circle.${lineClass}`)
    .data(countryData)
    .enter()
    .append("circle")
    .attr("class", `circle ${lineClass}`)
    .attr("r", 5.5)
    .attr("cx", d => x(d.year))
    .attr("cy", d => yRank(d.ranking))
    .style("fill", color)
    .on('mouseover', function (event, d) {
      console.log(event, d);
      d3.select(event.target).classed('hovered_lc', true);
      tipRanking.transition()
        .duration(500)
        .style("opacity", 0.9);
        var dateObject = new Date(d.year);
        var year = dateObject.getFullYear();
        
      tipRanking.html(`<strong>Year:</strong> ${year}<br><strong>Ranking:</strong> ${d.ranking}<br><strong>Country:</strong> ${d.country}`)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on('mouseout', function (event, d) {
      d3.select(event.target).classed('hovered_lc', false);
      tipRanking.transition()
        .duration(500)
        .style("opacity", 0);
      });
}

// Ranking Running Chart Code End





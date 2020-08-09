var data = JSON.parse('{{ output | tojson | safe }}');

var parseYear = d3.timeParse("%Y");
data.forEach(function(d){d.Year = parseYear(d.Year)})

console.log(data);
d3.select("#results-table")
    .selectAll("tr")
    .data(data)
    .enter().append("tr")
    .html(function(d){
        return '<td><strong>' + d.Year.getFullYear() + '</strong></td><td>' + d.Regular.toLocaleString() + '</td><td>' + d.Overtime.toLocaleString() + '</td><td>' + d.Total.toLocaleString() + '</td>'
    }).exit();

var margin = {top: 50, right: 500, bottom: 50, left: 75}
  , width = window.innerWidth - margin.left - margin.right // Use the window's width 
  , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height

var xScale = d3.scaleTime()
    .domain([data[0].Year, data[data.length-1].Year]) // input
    .range([0, width]); // output

var yScale = d3.scaleLinear()
    .domain([0, 500000000]) // input 
    .range([height, 0]); // output 

var svg = d3.select("#viz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 3. Call the x axis in a group tag
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

// 4. Call the y axis in a group tag
svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

svg.append("path")
    .datum(data)
    .attr("class", "regular")
    .attr("d", d3.area()
        .x(function(d, i){return xScale(d.Year)})
        .y0(height)
        .y1(function(d, i){return yScale(d.Regular)})
        .curve(d3.curveMonotoneX));

svg.append("path")
.datum(data)
.attr("class", "regular")
.attr("d", d3.line()
    .x(function(d, i){return xScale(d.Year)})
    .y(function(d, i){return yScale(d.Regular)})
    .curve(d3.curveMonotoneX));

svg.append("path")
    .datum(data)
    .attr("class", "overtime")
    .attr("d",d3.area()
        .x(function(d, i){return xScale(d.Year)})
        .y0(function(d, i){return yScale(d.Regular)})
        .y1(function(d, i){return yScale(d.Overtime + d.Regular)})
        .curve(d3.curveMonotoneX));

svg.append("path")
    .datum(data)
    .attr("class", "total")
    .attr("d", d3.line()
        .x(function(d, i){return xScale(d.Year)})
        .y(function(d, i){return yScale(d.Total)})
        .curve(d3.curveMonotoneX));

svg.selectAll(".regularPoints")
    .data(data).enter().append("circle")
    .attr("class","regularPoints")
    .attr("cx", function(d, i){return xScale(d.Year)})
    .attr("cy", function(d, i){return yScale(d.Regular)})
    .attr("r", 5);

svg.selectAll(".overtimePoints")
    .data(data).enter().append("circle")
    .attr("class","overtimePoints")
    .attr("cx", function(d, i){return xScale(d.Year)})
    .attr("cy", function(d, i){return yScale(d.Overtime + d.Regular)})
    .attr("r", 5);

svg.selectAll(".totalPoints")
    .data(data).enter().append("circle")
    .attr("class","totalPoints")
    .attr("cx", function(d, i){return xScale(d.Year)})
    .attr("cy", function(d, i){return yScale(d.Total)})
    .attr("r", 5);
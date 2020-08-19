var data = JSON.parse('{{ output | tojson | safe }}');
var avgs = JSON.parse('{{ avgs | tojson | safe }}');

var parseYear = d3.timeParse("%Y");
data.forEach(function (d) { d.Year = parseYear(d.Year) });
avgs.forEach(function (d) { d.Year = parseYear(d.Year) });
console.log(data);
console.log(avgs);
d3.select("#results-table")
    .selectAll("tr")
    .data(data)
    .enter().append("tr")
    .html(function (d) {
        return '<td><strong>' + d.Year.getFullYear() + '</strong></td><td>' + d.Regular.toLocaleString() + '</td><td>' + d.Overtime.toLocaleString() + '</td><td>' + d.Total.toLocaleString() + '</td>'
    }).exit();

var chart = timeserieschart()
    .width(800).height(400);
d3.select("#viz")
    .datum(data)
    .call(chart);

var avg_chart = timeserieschart()
    .width(800).height(400);
d3.select("#viz2")
    .datum(avgs)
    .call(avg_chart);

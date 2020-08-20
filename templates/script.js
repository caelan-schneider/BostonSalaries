var data = JSON.parse('{{ output | tojson | safe }}');
var avgs = JSON.parse('{{ avgs | tojson | safe }}');

var parseYear = d3.timeParse("%Y");
data.forEach(function (d) { d.Year = parseYear(d.Year) });
avgs.forEach(function (d) { d.Year = parseYear(d.Year) });
console.log(data);
console.log(avgs);
// d3.select("#results-table")
//     .selectAll("tr")
//     .data(data)
//     .enter().append("tr")
//     .html(function (d) {
//         return '<td><strong>' + d.Year.getFullYear() + '</strong></td><td>' + d.Regular.toLocaleString() + '</td><td>' + d.Overtime.toLocaleString() + '</td><td>' + d.Total.toLocaleString() + '</td>'
//     }).exit();

var sum_table = timeseriestable()
    .caption('{{org}} - TOTAL');
d3.select("#sumtable")
    .datum(data)
    .call(sum_table);

var sum_chart = timeserieschart()
    .width(800).height(400);
d3.select("#sumchart")
    .datum(data)
    .call(sum_chart);

var avg_table = timeseriestable()
    .caption('{{org}} - AVERAGE');
d3.select("#avgtable")
    .datum(avgs)
    .call(avg_table);

var avg_chart = timeserieschart()
    .width(800).height(400);
d3.select("#avgchart")
    .datum(avgs)
    .call(avg_chart);

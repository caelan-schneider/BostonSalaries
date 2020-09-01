var data = JSON.parse('{{ sums | tojson | safe }}');
var avgs = JSON.parse('{{ avgs | tojson | safe }}');
var injuries = JSON.parse('{{ injuries | tojson | safe }}');
var numEmployees = JSON.parse('{{ numEmployees | tojson | safe }}');
var topFiveEmployees = JSON.parse('{{ topFiveEmployees | tojson | safe }}')

console.log(data);
console.log(avgs);
console.log(injuries);
console.log(numEmployees);
console.log(topFiveEmployees);

var sum_table = timeseriestable()
    .title("TOTAL SALARIES PAID BY YEAR");
d3.select("#sumtable")
    .datum(data)
    .call(sum_table);

var sum_chart = timeserieschart()
    .width(800).height(400);
d3.select("#sumchart")
    .datum(data)
    .call(sum_chart);

d3.select("#avgtable")
    .datum(avgs)
    .call(timeseriestable()
        .title("AVERAGE PAY BY YEAR"));


d3.select("#avgchart")
    .datum(avgs)
    .call(timeserieschart()
        .width(800).height(400));

d3.select("#countschart")
    .datum(numEmployees)
    .call(timeserieslinechart()
        .width(800).height(200).title("TOTAL NUMBER OF EMPLOYEES BY YEAR"));

d3.select("#injurychart")
    .datum(injuries)
    .call(timeserieslinechart()
        .width(800).height(200).title("NUMBER OF INJURIES BY YEAR").min(0));



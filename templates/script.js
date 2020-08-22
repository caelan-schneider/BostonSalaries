var data = JSON.parse('{{ sums | tojson | safe }}');
var avgs = JSON.parse('{{ avgs | tojson | safe }}');

console.log(data);
console.log(avgs);

var sum_table = timeseriestable()
    .title("{{org}} - TOTAL SALARIES PAID BY YEAR");
d3.select("#sumtable")
    .datum(data)
    .call(sum_table);

var sum_chart = timeserieschart()
    .width(800).height(400);
d3.select("#sumchart")
    .datum(data)
    .call(sum_chart);

var avg_table = timeseriestable()
    .title("{{org}} - AVERAGE PAY BY YEAR");
d3.select("#avgtable")
    .datum(avgs)
    .call(avg_table);

var avg_chart = timeserieschart()
    .width(800).height(400);
d3.select("#avgchart")
    .datum(avgs)
    .call(avg_chart);

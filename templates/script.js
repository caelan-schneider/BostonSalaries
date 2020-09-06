var data = JSON.parse('{{ sums | tojson | safe }}');
var avgs = JSON.parse('{{ avgs | tojson | safe }}');
var injuries = JSON.parse('{{ injuries | tojson | safe }}');
var numEmployees = JSON.parse('{{ numEmployees | tojson | safe }}');
var topTenEmployees = JSON.parse('{{ topTenEmployees | tojson | safe }}')

console.log(data);
console.log(avgs);
console.log(injuries);
console.log(numEmployees);
console.log(topTenEmployees);

d3.select("#sumtable")
    .datum(data)
    .call(datatable()
        .title("TOTAL SALARIES PAID BY YEAR")
        .formatFirstColumn(true)
        .formatLastColumn(true));

d3.select("#sumchart")
    .datum(data)
    .call(areachart()
        .width(800).height(400));

d3.select("#avgtable")
    .datum(avgs)
    .call(datatable()
        .title("AVERAGE PAY BY YEAR")
        .formatFirstColumn(true)
        .formatLastColumn(true));

d3.select("#avgchart")
    .datum(avgs)
    .call(areachart()
        .width(800).height(400));

d3.select("#countschart")
    .datum(numEmployees)
    .call(timeserieslinechart()
        .xVal("Year")
        .yVals(["count"])
        .min(0)
        .width(800).height(200).title("TOTAL NUMBER OF EMPLOYEES BY YEAR"));

d3.select("#injurychart")
    .datum(injuries)
    .call(timeserieslinechart()
        .xVal("Year")
        .yVals(["count"])
        .width(800).height(200).title("NUMBER OF INJURIES BY YEAR").min(0));

d3.select("#mostPaidEmployees")
    .datum(topTenEmployees)
    .call(datatable()
    .title("TOP TEN MOST PAID EMPLOYEES")
    .columns(["Name", "Title", "Program", "Regular", "Retro", "Overtime", "Injury", "Other", "Total"])
    .formatFirstColumn(false)
    .formatLastColumn(true));


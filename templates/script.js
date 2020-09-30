var sums = JSON.parse('{{ sums | tojson | safe }}');
var avgs = JSON.parse('{{ avgs | tojson | safe }}');
var injuries = JSON.parse('{{ injuries | tojson | safe }}');
var numEmployees = JSON.parse('{{ numEmployees | tojson | safe }}');
var topTenEmployees = JSON.parse('{{ topTenEmployees | tojson | safe }}');
var totalsForYear = JSON.parse('{{ totalsForYear | tojson | safe }}');

console.log(sums);
console.log(avgs);
console.log(injuries);
console.log(numEmployees);
console.log(topTenEmployees);
console.log(totalsForYear[0]);

d3.select("#sumtable")
    .datum(sums)
    .call(datatable()
        .title("TOTAL SALARIES PAID BY YEAR")
        .width(1100)
        .formatFirstColumn(true)
        .formatLastColumn(true));

d3.select("#sumchart")
    .datum(sums)
    .call(areachart()
        .width(1100)
        .height(400));

d3.select("#avgtable")
    .datum(avgs)
    .call(datatable()
        .title("AVERAGE PAY BY YEAR")
        .formatFirstColumn(true)
        .formatLastColumn(true)
        .width(1100));

d3.select("#avgchart")
    .datum(avgs)
    .call(areachart()
        .width(1100)
        .height(400));

d3.select("#countschart")
    .datum(numEmployees)
    .call(timeserieslinechart()
        .xVal("Year")
        .yVals(["count"])
        .min(0)
        .width(1100)
        .height(200)
        .title("TOTAL NUMBER OF EMPLOYEES BY YEAR"));

d3.select("#injurychart")
    .datum(injuries)
    .call(timeserieslinechart()
        .xVal("Year")
        .yVals(["count"])
        .width(1100)
        .height(200)
        .title("NUMBER OF INJURED EMPLOYEES BY YEAR")
        .min(0));

d3.select("#mostPaidEmployees")
    .datum(topTenEmployees)
    .call(datatable()
        .title("TOP TEN MOST PAID EMPLOYEES IN 2019")
        .dimensions(["Last", "Title", "Program"])
        .measures(["Regular", "Retro", "Overtime", "Injury", "Other", "Total"])
        .width(1100)
        .formatFirstColumn(false)
        .formatLastColumn(true));

d3.select("#histogram")
    .datum(totalsForYear)
    .call(histogram()
        .title("TOTAL PAY DISTRIBUTION IN 2019")
        .xVal("Total")
        .width(1100)
        .height(400));


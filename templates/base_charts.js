var sums = JSON.parse('{{ sums_by_year | tojson | safe }}');
var avgs = JSON.parse('{{ avgs_by_year | tojson | safe }}');
var injuries = JSON.parse('{{ injured_employees_by_year | tojson | safe }}');
var numEmployees = JSON.parse('{{ employees_by_year | tojson | safe }}');
var value = "{{value}}";
var pathRoot = "{{pathRoot}}";

d3.select("#sumtable")
    .datum(sums)
    .call(datatable()
        .title("Total Salaries Paid by Year")
        .width(1100)
        .dimensions(["Year"])
        .measures(["Regular", "Retro", "Overtime", "Injury", "Other", "Total"])
        .formatFirstColumn(true)
        .formatLastColumn(true));

d3.select("#sumchart")
    .datum(sums)
    .call(areachart()
        .title("Total Salaries Paid by Year")
        .measures(["Regular", "Retro", "Injury", "Overtime", "Other"])
        .width(1100)
        .height(350));

d3.select("#avgtable")
    .datum(avgs)
    .call(datatable()
        .title("Average Pay by Year")
        .dimensions(["Year"])
        .measures(["Regular", "Retro", "Overtime", "Injury", "Other", "Total"])
        .formatFirstColumn(true)
        .formatLastColumn(true)
        .width(1100));

d3.select("#avgchart")
    .datum(avgs)
    .call(areachart()
        .title("Average Pay by Year")
        .measures(["Regular", "Retro", "Injury", "Overtime", "Other"])
        .width(1100)
        .height(350));

d3.select("#countschart")
    .datum(numEmployees)
    .call(timeserieslinechart()
        .dimension("Year")
        .measures(["count"])
        .min(0)
        .width(1100)
        .height(200)
        .title("Total Number of Employees by Year"));

d3.select("#injurychart")
    .datum(injuries)
    .call(timeserieslinechart()
        .dimension("Year")
        .measures(["count"])
        .width(1100)
        .height(200)
        .title("Number of Injured Employees by Year")
        .min(0));

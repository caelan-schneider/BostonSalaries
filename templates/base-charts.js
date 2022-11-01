var sums = JSON.parse('{{ sums_by_year | tojson | safe }}');
var avgs = JSON.parse('{{ avgs_by_year | tojson | safe }}');
var injuries = JSON.parse('{{ injured_employees_by_year | tojson | safe }}');
var numEmployees = JSON.parse('{{ employees_by_year | tojson | safe }}');
var divisionValue = "{{division_value}}";
var pathRoot = "{{path_root}}";

d3.select("#total-pay-table")
    .datum(sums)
    .call(dataTable()
        .title("Total Salaries Paid by Year")
        .width(1100)
        .dimensions(["Year"])
        .measures(["Regular", "Retro", "Overtime", "Injury", "Other", "Total"])
        .formatFirstColumn(true)
        .formatLastColumn(true));

d3.select("#total-pay-chart")
    .datum(sums)
    .call(areaChart()
        .title("Total Salaries Paid by Year")
        .measures(["Regular", "Retro", "Injury", "Overtime", "Other"])
        .width(1100)
        .height(350));

d3.select("#avg-pay-table")
    .datum(avgs)
    .call(dataTable()
        .title("Average Pay by Year")
        .dimensions(["Year"])
        .measures(["Regular", "Retro", "Overtime", "Injury", "Other", "Total"])
        .formatFirstColumn(true)
        .formatLastColumn(true)
        .width(1100));

d3.select("#avg-pay-chart")
    .datum(avgs)
    .call(areaChart()
        .title("Average Pay by Year")
        .measures(["Regular", "Retro", "Injury", "Overtime", "Other"])
        .width(1100)
        .height(350));

d3.select("#employees-chart")
    .datum(numEmployees)
    .call(timeSeriesLineChart()
        .dimension("Year")
        .measures(["count"])
        .min(0)
        .width(1100)
        .height(200)
        .title("Total Number of Employees by Year"));

d3.select("#injuries-chart")
    .datum(injuries)
    .call(timeSeriesLineChart()
        .dimension("Year")
        .measures(["count"])
        .width(1100)
        .height(200)
        .title("Number of Injured Employees by Year")
        .min(0));

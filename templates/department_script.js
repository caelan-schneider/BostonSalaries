var sums = JSON.parse('{{ sums | tojson | safe }}');
var avgs = JSON.parse('{{ avgs | tojson | safe }}');
var injuries = JSON.parse('{{ injuries | tojson | safe }}');
var numEmployees = JSON.parse('{{ numEmployees | tojson | safe }}');
var years = JSON.parse('{{ allYears }}');
var topTenEmployees = JSON.parse('{{ topTenEmployees | tojson | safe }}');
var totalsForYear = JSON.parse('{{ totalsForYear | tojson | safe }}');

d3.select("#sumtable")
    .datum(sums)
    .call(datatable()
        .title("TOTAL SALARIES PAID BY YEAR")
        .dimensions(["Year"])
        .measures(["Regular", "Retro", "Overtime", "Injury", "Other", "Total"])
        .width(1100)
        .formatFirstColumn(true)
        .formatLastColumn(true));

d3.select("#sumchart")
    .datum(sums)
    .call(areachart()
        .title("TOTAL SALARIES PAID BY YEAR")
        .measures(["Regular", "Retro", "Injury", "Overtime", "Other"])
        .width(1100)
        .height(400));

d3.select("#avgtable")
    .datum(avgs)
    .call(datatable()
        .title("AVERAGE PAY BY YEAR")
        .dimensions(["Year"])
        .measures(["Regular", "Retro", "Overtime", "Injury", "Other", "Total"])
        .formatFirstColumn(true)
        .formatLastColumn(true)
        .width(1100));

d3.select("#avgchart")
    .datum(avgs)
    .call(areachart()
        .title("AVERAGE PAY BY YEAR")
        .measures(["Regular", "Retro", "Injury", "Overtime", "Other"])
        .width(1100)
        .height(400));

d3.select("#countschart")
    .datum(numEmployees)
    .call(timeserieslinechart()
        .dimension("Year")
        .measures(["count"])
        .min(0)
        .width(1100)
        .height(200)
        .title("TOTAL NUMBER OF EMPLOYEES BY YEAR"));

d3.select("#injurychart")
    .datum(injuries)
    .call(timeserieslinechart()
        .dimension("Year")
        .measures(["count"])
        .width(1100)
        .height(200)
        .title("NUMBER OF INJURED EMPLOYEES BY YEAR")
        .min(0));

d3.select("#dropdownMenu")
    .append("select")
    .attr("id", "dropdown")
    .selectAll("option")
    .data(years)
    .enter().append("option")
    .attr("value", function (d) { return d })
    .text(function (d) { return d })

d3.select("#dropdownMenu").select("#dropdown")
    .on("change", function () {
        currentYear = document.getElementById("dropdown").value;
        console.log(currentYear);
        updateYear(currentYear);
    })

function updateYear(year) {
    d3.selectAll(".forYear").selectAll("*").remove();

    d3.select("#mostPaidEmployees")
        .attr("class", "forYear")
        .datum(topTenEmployees[year])
        .call(datatable()
            .title("TOP TEN MOST PAID EMPLOYEES IN " + year)
            .dimensions(["First", "Last", "Title", "Program"])
            .measures(["Regular", "Retro", "Overtime", "Injury", "Other", "Total"])
            .width(1100)
            .formatFirstColumn(false)
            .formatLastColumn(true));

    d3.select("#histogram")
        .attr("class", "forYear")
        .datum(totalsForYear[year])
        .call(barchart()
            .title("TOTAL PAY DISTRIBUTION IN " + year)
            .dimension("bin")
            .measure("hist")
            .width(1100)
            .height(400));
};

updateYear(2019);


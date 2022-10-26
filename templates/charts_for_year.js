
var years = JSON.parse("{{ allYears }}");
var pageType = "{{pageType}}";
var value = "{{value}}";

//Create dropdown menu
d3.select("#years-dropdown")
    .append("div")
    .style("width", "1100px")
    .append("select")
    .attr("id", "dropdown")
    .selectAll("option")
    .data(years)
    .enter().append("option")
    .attr("value", (d) => d)
    .text((d) => d)

//Create onChange event for dropdown that calls updateYear
d3.select("#years-dropdown").select("#dropdown")
    .on("change", function () {
        currentYear = parseInt(document.getElementById("dropdown").value);
        TopNForYear(currentYear);
        SalaryHistogram(currentYear);
    })

function DisplayTopNForYear(data, year){
    d3.select("#mostPaidEmployees").selectAll("*").remove();

    let employeedims = ["First", "Last"]
    if(!pageType) employeedims[2] = "Department";
    if(pageType == "department") employeedims[2] = "Program";
    if(pageType == "cabinet") employeedims[2] = "Department";
    employeedims.push("Title");

    d3.select("#mostPaidEmployees")
        .datum(data)
        .call(datatable()
            .title("Top Ten Most Paid Employees in " + year)
            .dimensions(employeedims)
            .measures(["Regular", "Retro", "Overtime", "Injury", "Other", "Total"])
            .width(1100)
            .formatFirstColumn(false)
            .formatLastColumn(true));
}

function TopNForYear(year) {
    $.get('/topnforyear', {
        forYear: year, pageType: pageType, value: value}).done(
            (response) => DisplayTopNForYear(response["data"], year));
    }

function DisplaySalaryHistogram(data, year) {
    d3.select("#histogram").selectAll("*").remove();

    d3.select("#histogram")
        .datum(data)
        .call(barchart()
            .title("Total Pay Distribution in " + year)
            .dimension("bin")
            .measure("hist")
            .width(1100)
            .height(350));
};

function SalaryHistogram(year) {
    $.get('/salaryhistogram', {
        forYear: year, pageType: pageType, value: value}).done(
            (response) => DisplaySalaryHistogram(response["data"], year));
    }

TopNForYear(years[0]);
SalaryHistogram(years[0]);



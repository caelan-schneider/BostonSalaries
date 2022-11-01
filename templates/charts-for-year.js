
var years = JSON.parse("{{years}}");
var pageType = "{{page_type}}";
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
        topNForYear(currentYear);
        salaryHistogram(currentYear);
    })

function displayTopNForYear(data, year){
    d3.select("#most-paid-employees-table").selectAll("*").remove();

    let employeeDims = ["First", "Last"]
    if(!pageType) employeeDims[2] = "Department";
    if(pageType == "department") employeeDims[2] = "Program";
    if(pageType == "cabinet") employeeDims[2] = "Department";
    employeeDims.push("Title");

    d3.select("#most-paid-employees-table")
        .datum(data)
        .call(dataTable()
            .title("Top Ten Most Paid Employees in " + year)
            .dimensions(employeeDims)
            .measures(["Regular", "Retro", "Overtime", "Injury", "Other", "Total"])
            .width(1100)
            .formatFirstColumn(false)
            .formatLastColumn(true));
}

function topNForYear(year) {
    $.get('/top-n-for-year', {
        forYear: year, pageType: pageType, value: value}).done(
            (response) => displayTopNForYear(response["data"], year));
    }

function displaySalaryHistogram(data, year) {
    d3.select("#pay-histogram").selectAll("*").remove();

    d3.select("#pay-histogram")
        .datum(data)
        .call(barChart()
            .title("Total Pay Distribution in " + year)
            .dimension("bin")
            .measure("hist")
            .width(1100)
            .height(350));
};

function salaryHistogram(year) {
    $.get('/salary-histogram', {
        forYear: year, pageType: pageType, value: value}).done(
            (response) => displaySalaryHistogram(response["data"], year));
    }

topNForYear(years[0]);
salaryHistogram(years[0]);



var pathRoot = '{{path_root}}'
var pageType = '{{page_type}}';

d3.select("#main-dropdown")
    .on("change", function () {
        division = document.getElementById("main-dropdown").value;
        secondaryDropdown(division)
    })

function displaySecondary(data, division) {
    d3.select("#secondary-dropdown-input").remove();
    d3.select("#secondary-dropdown").remove();
    d3.select("#dropdown-button").remove();

    if (division == "Cabinet" || division == "Department" || division == "Program") {

        d3.select("#header-dropdowns")
            .append("input")
            .attr("id", "secondary-dropdown-input")
            .attr("list", "secondary-dropdown");

        d3.select("#header-dropdowns")
            .append("datalist")
            .attr("id", "secondary-dropdown");

        var value = document.getElementById("secondary-dropdown");

        d3.select("#secondary-dropdown-input")
            .on("change", function (d) { updateSearch(division) })
            .attr("placeholder", "SELECT A " + division.toUpperCase());
;

        d3.select("#secondary-dropdown")
            .selectAll(".division-option")
            .data(data["options"])
            .enter().append("option")
            .attr("class", "division-option")
            .attr("value", (d) => d)
            .text((d) => d);

        d3.select("#header-dropdowns")
            .append("a")
            .attr("id", "dropdown-button")
            .attr("class", "btn disabled")
            .attr("href", pathRoot + division.toLowerCase() + "/" + value)
            .append("i").attr("class", "fa fa-search")
    }
}

function secondaryDropdown(selected) {
    $.get('/divisionoptions', {
        selected: selected
    }).done(
        function (response) {
            displaySecondary(response, selected);
        });
}

function updateSearch(division) {
    if (division == "Department" || division == "Cabinet") {
        d3.select("#dropdown-button")
            .attr("href", pathRoot + division.toLowerCase() + "/" + document.getElementById("secondary-dropdown-input").value)
            .attr("class", "btn");
    }

    if (division == "Program") {
        let [dept, ...prog]  = document.getElementById("secondary-dropdown-input").value.split(" - ")
        prog = prog.join(" - ")
        d3.select("#dropdown-button")
            .attr("href", pathRoot + "department/" + dept + "/program/" + prog)
            .attr("class", "btn");
    }

}

secondaryDropdown("Department");
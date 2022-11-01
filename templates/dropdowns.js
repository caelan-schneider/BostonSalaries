var pathRoot = '{{path_root}}'
var divisionType = '{{division_type}}';

d3.select("#main-dropdown")
    .on("change", function () {
        division_type = document.getElementById("main-dropdown").value;
        secondaryDropdown(division_type)
    })

function displaySecondary(data, division_type) {
    d3.select("#secondary-dropdown-input").remove();
    d3.select("#secondary-dropdown").remove();
    d3.select("#dropdown-button").remove();

    if (division_type == "Cabinet" || division_type == "Department" || division_type == "Program") {

        d3.select("#header-dropdowns")
            .append("input")
            .attr("id", "secondary-dropdown-input")
            .attr("list", "secondary-dropdown");

        d3.select("#header-dropdowns")
            .append("datalist")
            .attr("id", "secondary-dropdown");

        var divisionValue = document.getElementById("secondary-dropdown");

        d3.select("#secondary-dropdown-input")
            .on("change", function (d) { updateSearch(division_type) })
            .attr("placeholder", "SELECT A " + division_type.toUpperCase());
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
            .attr("href", pathRoot + divisionType.toLowerCase() + "/" + divisionValue)
            .append("i").attr("class", "fa fa-search")
    }
}

function secondaryDropdown(selected) {
    $.get('/division-options', {
        selected: selected
    }).done(
        function (response) {
            displaySecondary(response, selected);
        });
}

function updateSearch(divisionType) {
    if (divisionType == "Department" || divisionType == "Cabinet") {
        d3.select("#dropdown-button")
            .attr("href", pathRoot + divisionType.toLowerCase() + "/" + document.getElementById("secondary-dropdown-input").value)
            .attr("class", "btn");
    }

    if (divisionType == "Program") {
        let [dept, ...prog]  = document.getElementById("secondary-dropdown-input").value.split(" - ")
        prog = prog.join(" - ")
        d3.select("#dropdown-button")
            .attr("href", pathRoot + "department/" + dept + "/program/" + prog)
            .attr("class", "btn");
    }

}

secondaryDropdown("Department");
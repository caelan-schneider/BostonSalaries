var datatable = function () {
    var margin = { top: 50, right: 50, bottom: 50, left: 75 };
    var title = "";
    var columns = ["Year", "Regular", "Retro", "Overtime", "Injury", "Other", "Total"];
    var formatFirstColumn = true;
    var formatLastColumn = false;

    function my(selection) {

        selection.each(function (data) {

            //Add title
            if (title != "") {
                d3.select(this).append("span")
                    .attr("class", "title")
                    .text(title);
            }

            //Create table
            var table = d3.select(this)
                .append("table");

            //Create table header and add column headers
            var head = table.append("thead");
            head.append("tr")
                .selectAll("th")
                .data(columns).enter().append("th")
                .text(function (col) { return col })
                .attr("class", function(d, i){
                    if(i == 0 && formatFirstColumn){return "primaryHeader"}
                    if (i == columns.length -2 && formatLastColumn){return "preFinalHeader"}});

            //Create table body and add correct number of rows based on data
            var body = table.append("tbody");
            var rows = body.selectAll("tr").data(data).enter().append("tr");

            //Create cell for each row and column
            rows.selectAll("td")
                .data(function (row) {
                    return columns.map(function (col) {
                        if(col == "Name") {return {"column": col, "value": row["First"] + " " + row["Last"]}}
                        return { "column": col, "value": row[col] };
                    })
                }).enter().append('td')
                .text(function (d) {
                    //reformat columns representing currency amounts to include commas and two decimal places
                    var currency_columns = ['Regular', 'Retro', 'Overtime', 'Injury', 'Other', "Total"];
                    if (currency_columns.includes(d.column)) { return d.value.toLocaleString('en', { minimumFractionDigits: 2 }); }
                    else { return d.value; }
                })
                .attr("class", function (d, i) {
                    //give class to Year column for special styling
                    if (i == 0 && formatFirstColumn) { return "primaryCell" }
                    if (i == columns.length -2 && formatLastColumn){return "preFinalCell"}});
        })
    }

    my.title = function (value) {
        if (!arguments.length) return title;
        title = value;
        return my;
    }

    my.margin = function (value) {
        if (!arguments.length) return margin;
        margin = value;
        return my;
    }

    my.columns = function (value) {
        if (!arguments.length) return columns;
        columns = value;
        return my;
    }

    my.formatFirstColumn = function (value) {
        if (!arguments.length) return formatFirstColumn;
        formatFirstColumn = value;
        return my;
    }

    my.formatLastColumn = function (value) {
        if (!arguments.length) return formatLastColumn;
        formatLastColumn = value;
        return my;
    }

    return my;

}
var datatable = function () {
    var width = 800;
    var height = 400;
    var title = "";
    var dimensions = ["Year"]
    var measures = ["Regular", "Retro", "Overtime", "Injury", "Other", "Total"];
    var formatFirstColumn = true;
    var formatLastColumn = false;

    function my(selection) {

        selection.each(function (data) {
            var allColumns = dimensions.concat(measures);

            //Create table
            var tableWrapper = d3.select(this)
                .append("div")
                    .attr("class", "table-wrapper");
                    
            tableWrapper.style("width", width + "px");
            tableWrapper.style("height", height + "px");

            //Add title
            if (title != "") {
                tableWrapper.append("span")
                    .attr("class", "title")
                    .text(title);
            }
                    
            var table = tableWrapper.append("table");

            //Create table header and add column headers
            var head = table.append("thead");
            head.append("tr")
                .selectAll("th")
                .data(allColumns).enter().append("th")
                .text(function (col) { return col })
                .attr("class", function(d, i){
                    if(i == 0 && formatFirstColumn){return "primary-header"}
                    if (i == allColumns.length -2 && formatLastColumn){return "pre-final-header"}
                    if (i == allColumns.length -1 && formatLastColumn){return "final-header"}
                });

            //Create table body and add correct number of rows based on data
            var body = table.append("tbody");
            var rows = body.selectAll("tr").data(data).enter().append("tr");

            //Create cell for each row and column
            rows.selectAll("td")
                .data(function (row) {
                    return allColumns.map(function (col) {
                        return { "column": col, "value": row[col] };
                    })
                }).enter().append('td')
                .text(function (d) {
                    //reformat columns representing currency amounts to include commas and two decimal places
                    if (measures.includes(d.column)) { return d.value.toLocaleString('en', { minimumFractionDigits: 2 }); }
                    else { return d.value; }
                })
                .attr("class", function (d, i) {
                    //give class to Year column for special styling
                    if (i == 0 && formatFirstColumn) { return "primary-cell" }
                    if (i == allColumns.length -2 && formatLastColumn){return "pre-final-cell"}
                    if (i == allColumns.length -1 && formatLastColumn){return "final-cell"}
                });
        })
    }

    my.title = function (value) {
        if (!arguments.length) return title;
        title = value;
        return my;
    }

    my.dimensions = function (value) {
        if (!arguments.length) return dimensions;
        dimensions = value;
        return my;
    }

    my.measures = function (value) {
        if (!arguments.length) return measures;
        measures = value;
        return my;
    }

    my.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return my;
    }

    my.height = function(value) {
        if (!arguments.length) return height;
        height = value;
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
var dataTable = function () {
    var width = 800;
    var height = 400;
    var formatFirstColumn = true;
    var formatLastColumn = false;
    var dimensions, measures, title;

    function my(selection) {
        selection.each(function (data) {

            if (Object.is(dimensions, undefined)) throw ("Must have at least one dimension");
            if (Object.is(measures, undefined)) throw ("Must have at least one measure");
            if (data.length == 0) throw ("Data is empty!")

            var allColumns = dimensions.concat(measures);

            //Create table wrapper
            var tableWrapper = d3.select(this)
                .append("div")
                .attr("class", "table-wrapper");

            //Set width and height
            tableWrapper.style("width", width + "px");
            tableWrapper.style("height", height + "px");

            //Add title
            if (!Object.is(title, undefined)) {
                tableWrapper.append("span")
                    .attr("class", "title")
                    .text(title).append("br");;
            }

            //Create table
            var table = tableWrapper.append("table");

            //Create table header and add column headers
            var head = table.append("thead");
            head.append("tr")
                .selectAll("th")
                .data(allColumns).enter().append("th")
                .text(function (col) { return col })
                .attr("class", function (d, i) {

                    //Certain headers get classes for special CSS formatting
                    if (i == 0 && formatFirstColumn) { return "primary-header" }
                    if (i == allColumns.length - 2 && formatLastColumn) { return "pre-final-header" }
                    if (i == allColumns.length - 1 && formatLastColumn) { return "final-header" }
                });

            //Create table body and add rows
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

                    //Reformat columns representing currency amounts to include commas and two decimal places
                    if (measures.includes(d.column)) { 
                        try{
                            return d.value.toLocaleString('en', { minimumFractionDigits: 2 }); 
                        }
                        catch (error){
                            console.log(d)
                            console.error(error);
                        }
                    }
                    else { return d.value; }
                })
                .attr("class", function (d, i) {

                    //Certain columns get classes for special CSS formatting
                    if (i == 0 && formatFirstColumn) { return "primary-cell" }
                    if (i == allColumns.length - 2 && formatLastColumn) { return "pre-final-cell" }
                    if (i == allColumns.length - 1 && formatLastColumn) { return "final-cell" }
                });
        })
    }

    my.title = function (value) {
        if (!arguments.length) return title;
        title = value;
        return my;
    }

    my.dimensions = function (value) {
        dimensions = value;
        return my;
    }

    my.measures = function (value) {
        measures = value;
        return my;
    }

    my.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        return my;
    }

    my.height = function (value) {
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
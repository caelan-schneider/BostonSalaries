var timeseriestable = function () {
    var margin = { top: 50, right: 500, bottom: 50, left: 75 };
    var title = "";
    var columns = ["Year", "Regular", "Retro", "Overtime", "Injury", "Other", "Total"];

    function my(selection) {

        selection.each(function (data) {

            //Add title
            if (title != "") {
                d3.select(this).append("span")
                    .attr("class", "tableTitle")
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
                .text(function (col) { return col });

            //Create table body and add correct number of rows based on data
            var body = table.append("tbody");
            var rows = body.selectAll("tr").data(data).enter().append("tr");

            //Create cell for each row and column
            rows.selectAll("td")
                .data(function (row) {
                    return columns.map(function (col) {
                        return { "column": col, "value": row[col] };
                    })
                }).enter().append('td')
                .text(function (d) { 
                    var currency_columns = ['Regular', 'Retro', 'Overtime', 'Injury', 'Other', "Total"];
                    if(currency_columns.includes(d.column)){return d.value.toLocaleString('en', {minimumFractionDigits: 2});}
                    else {return d.value ;}
                })
                .attr("class", function (d) {
                    //give class to Year column for special styling
                    if (d.column == "Year") { return "primaryCell" }
                });
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

    return my;

}
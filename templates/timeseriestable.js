var timeseriestable = function(){
    var margin = { top: 50, right: 500, bottom: 50, left: 75 }
        ,width = window.innerWidth - margin.left - margin.right;
    var caption = "Title";

    function my(selection){

        selection.each(function(data){
            
            var table = d3.select(this)
                .append("table")
                .style("width", width);

            table.append("thead");

            table.select("thead")
                .html("<caption>" + caption + "</caption><th>Year</th><th>Regular</th><th>Overtime</th><th>Total</th>");

            table.append("tbody")
                .selectAll("tr")
                .data(data).enter().append("tr")
                .html(function (d) {
                    return "<td><strong>" + d.Year.getFullYear() + "</strong></td><td>" + d.Regular.toLocaleString() + "</td><td>" + d.Overtime.toLocaleString() + "</td><td>" + d.Total.toLocaleString() + "</td>"
                    }).exit();
        })
    }

    my.caption = function (value) {
        if (!arguments.length) return caption;
        caption = value;
        return my;
    }

    my.width = function (value) {
        if (!arguments.width) return caption;
        width = value;
        return my;
    }

    my.margin = function (value) {
        if (!arguments.length) return margin;
        margin = value;
        return my;
    }
    
    return my;

}
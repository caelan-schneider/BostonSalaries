var timeserieslinechart = function () {
    var margin = { top: 20, right: 20, bottom: 40, left: 40 }
        , width = window.innerWidth - margin.left - margin.right // Use the window's width 
        , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height
    var title = "";

    var max, min;

    function my(selection) {
        selection.each(function (data) {

            //get max value for autoscaling
            if(Object.is(max, undefined)) {
                max = d3.max(data.map(obj => obj.count));
            } 

            //get min value for autoscaling
            if(Object.is(min, undefined)) {
                min = d3.min(data.map(obj => obj.count));
            }
           
            //Add title
            if (title != "") {
                d3.select(this).append("span")
                    .attr("class", "title")
                    .text(title).append("br");;
            }

            //Parse the year for proper time scaling
            var parseYear = d3.timeParse("%Y");
            data.forEach(function (d) { d.Year = parseYear(d.Year)});

            var xScale = d3.scaleTime()
                .domain([data[0].Year, data[data.length - 1].Year]) // input
                .range([0, width]); // output

            var yScale = d3.scaleLinear()
                .domain([min, max]) // input 
                .range([height, 0]); // output 

            //Chart base
            var svg = d3.select(this)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // X axis
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale));

            // Y axis
            svg.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(yScale)); 

            //Count line
            svg.append("path")
                .datum(data)
                .attr("class", "count")
                .attr("d", d3.line()
                    .x(function (d, i) { return xScale(d.Year) })
                    .y(function (d, i) { return yScale(d.count) }));
                    //.curve(d3.curveMonotoneX));

            //Count points
            svg.selectAll(".countPoints")
                .data(data).enter().append("circle")
                .attr("class", "countPoints")
                .attr("cx", function (d, i) { return xScale(d.Year) })
                .attr("cy", function (d, i) { return yScale(d.count) })
                .attr("r", 5);
        });
    }

    my.title = function (value) {
        if (!arguments.length) return title;
        title = value;
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

    my.margin = function (value) {
        if (!arguments.length) return margin;
        margin = value;
        return my;
    }

    my.max = function (value) {
        if (!arguments.length) return max;
        max = value;
        return my;
    }

    my.min = function (value) {
        if (!arguments.length) return min;
        min = value;
        return my;
    }

    return my;
}
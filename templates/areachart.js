var areachart = function () {
    var margin = { top: 20, right:20, bottom: 40, left: 100 }
        , width = window.innerWidth// Use the window's width 
        , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height
    var title = "";
    var xVal = "Year";
    var yVals = ["Regular", "Overtime", "Injury", "Retro", "Other"];

    function my(selection) {
        selection.each(function (data) {
            width = width - margin.left - margin.right - 155;
            //Parse the year for propery time scaling
            var parseYear = d3.timeParse("%Y");
            data.forEach(function (d) { d.Year = parseYear(d.Year) });

            var xScale = d3.scaleTime()
                .domain([data[0].Year, data[data.length - 1].Year]) // input
                .range([2, width]); // output

            //get max value for autoscaling
            var max = d3.max(data, function (d) {
                sum = 0;
                yVals.forEach(
                    function (val) {
                        sum += d[val];
                    }
                )
                return sum;
            });

            var yScale = d3.scaleLinear()
                .domain([0, max]) // input 
                .range([height - 1, 0])
                .nice(); // output 
            
            //Create wrapper
            var chartWrapper = d3.select(this)
                .append("div")
                .attr("class", "chart-wrapper");

            chartWrapper.style("width", width + margin.left + margin.right + 155 + "px");

            //Add title
            if (title != "") {
                chartWrapper.append("span")
                    .attr("class", "title")
                    .text(title).append("br");
            }

            //Chart base
            var svg = chartWrapper
                .append("svg")
                .attr("width", width + margin.left + margin.right + 150)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //chart legend
            var keys = yVals.reverse();
            svg.selectAll("#legend-points")
                .data(keys)
                .enter()
                .append("circle")
                .attr("r", 7)
                .attr("class", function (d) { return d.toLowerCase() })
                .attr("cx", width + 40)
                .attr("cy", function (d, i) { return margin.top + i * 20 });

            svg.selectAll("#legend-text")
                .data(keys)
                .enter()
                .append("text")
                .text(function (d) { return d })
                .attr("x", width + 55)
                .attr("y", function (d, i) { return margin.top + i * 20 + 3.5 })
                .attr("font-size", "12px");


            // X axis
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale));

            // Y axis
            svg.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(yScale));

            var stackGenerator = d3.stack().keys(yVals.reverse());
            var stackedData = stackGenerator(data);

            svg.selectAll(".layers")
                .data(stackedData)
                .enter()
                .append("path")
                .attr("class", function (d) { return d.key.toLowerCase() })
                .attr("d", d3.area()
                    .x(function (d) { return xScale(d.data[xVal]) })
                    .y0(function (d) { return yScale(d[0]) })
                    .y1(function (d) { return yScale(d[1]) })
                );
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

    my.xVal = function (value) {
        if (!arguments.length) return xVal;
        xVal = value;
        return my;
    }

    my.yVals = function (value) {
        if (!arguments.length) return yVals;
        yVals = value;
        return my;
    }

    return my;
}
var timeserieslinechart = function () {
    var margin = { top: 20, right: 20, bottom: 40, left: 80 }
        , width = window.innerWidth - margin.left - margin.right// Use the window's width 
        , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height
    var title = "";
    var xVal = "Year";
    var yVals = ["Total"];

    var max, min;

    function my(selection) {
        selection.each(function (data) {
            width = width - margin.left - margin.right - 55;
            //get max value for autoscaling
            if (Object.is(max, undefined)) {
                //get max value for autoscaling
                var max = 0
                yVals.forEach(function (val) {
                    max = Math.max(max, d3.max(data, function (d) { return d[val] }));
                    console.log(max);
                })
            }

            //get min value for autoscaling
            if (Object.is(min, undefined)) {
                min = d3.min(data.map(obj => obj.count));
            }

            //Parse the year for proper time scaling
            var parseYear = d3.timeParse("%Y");
            data.forEach(function (d) { d.Year = parseYear(d.Year) });

            var xScale = d3.scaleTime()
                .domain(d3.extent(data, function (d) { return d[xVal] })) // input
                .range([2, width]); // output

            var yScale = d3.scaleLinear()
                .domain([max, min]) // input 
                .range([2, height])
                .nice(); // output 

            //Create wrapper
            var chartWrapper = d3.select(this)
                .append("div")
                .attr("class", "chart-wrapper");

            chartWrapper.style("width", width  + margin.left + margin.right + 55 + "px");

            //Add title
            if (title != "") {
                chartWrapper.append("span")
                    .attr("class", "title")
                    .text(title).append("br");;
            }

            //Chart base
            var svg = chartWrapper
                .append("svg")
                .attr("width", width + margin.left + margin.right + 50)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("g")
                .attr("class", "grid-lines")
                .call(d3.axisLeft(yScale)
                    .tickSize(-width)
                    .tickFormat("")
                )
                .call(function (g) { g.select(".domain").remove() });

            // X axis
            svg.append("g")
                .attr("class", "xAxis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale));

            // Y axis
            svg.append("g")
                .attr("class", "yAxis")
                .call(d3.axisLeft(yScale))

            svg.selectAll("#ts-line")
                .data(yVals)
                .enter()
                .append("path")
                .each(function (line) {
                    d3.select(this).datum(data)
                        .attr("class", line.toLowerCase())
                        .attr("d", d3.line()
                            .x(function (d, i) { return xScale(d[xVal]) })
                            .y(function (d, i) { return yScale(d[line]) }))
                });

            //Count points
            svg.selectAll(".categories")
                .data(yVals)
                .enter()
                .append("g")
                .each(function (line) {
                    pointsClass = line.toLowerCase() + "-points";
                    console.log(pointsClass);
                    d3.select(this)
                        .selectAll(".points")
                        .data(data)
                        .enter()
                        .append("circle")
                        .attr("class", pointsClass)
                        .attr("cx", function (d, i) { return xScale(d[xVal]) })
                        .attr("cy", function (d, i) { return yScale(d[line]) })
                        .attr("r", 5);
                });
        })
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
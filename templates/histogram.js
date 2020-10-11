var histogram = function () {
    var margin = { top: 20, right: 20, bottom: 40, left: 80 }
        , width = window.innerWidth // Use the window's width 
        , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height
    var title = "";
    var numBins = 50;

    function my(selection) {
        selection.each(function (data) {
            width = width - margin.left - margin.right - 55;
            var xScale = d3.scaleLinear()
                .domain(d3.extent(data, d => d[xVal]))
                .range([1, width])
                .nice();

            var histogram = d3.histogram()
                .value(function (d) { return d[xVal] })
                .domain(xScale.domain())
                .thresholds(xScale.ticks(numBins)); //number of bins

            var bins = histogram(data);

            var upperLimitY = d3.max(bins, d => d.length);
            var yScale = d3.scaleLinear()
                .domain([0, upperLimitY])
                .range([height - 1, 0])
                .nice();

            //Create wrapper
            var chartWrapper = d3.select(this)
                .append("div")
                .attr("class", "chart-wrapper");

            chartWrapper.style("width", width + margin.left + margin.right + 55 + "px");

            //Add title
            if (title != "") {
                chartWrapper.append("span")
                    .attr("class", "title")
                    .text(title).append("br");
            }

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
                .call(d3.axisLeft(yScale));

            svg.selectAll("rect")
                .data(bins)
                .enter()
                .append("rect")
                .attr("x", 1)
                .attr("transform", function (d) { return "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")"; })
                .attr("width", function (d) { return xScale(d.x1) - xScale(d.x0); })
                .attr("height", function (d) { return height - yScale(d.length); })
                .attr("class", xVal.toLowerCase());

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
        if (!arguments.length) throw "Error: No value entered for x axis.";
        xVal = value;
        return my;
    }

    return my;
}
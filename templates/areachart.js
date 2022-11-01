var areaChart = function () {
    var margin = { top: 20, right: 20, bottom: 40, left: 100 }
        , width = window.innerWidth // Use the window's width 
        , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height
    var dimension = "Year";
    var title, measures;

    function my(selection) {
        selection.each(function (data) {

            if (Object.is(measures, undefined)) throw ("Must have at least one measure");

            width = width - margin.left - margin.right - 155;

            //get max value for autoscaling
            var max = d3.max(data, function (d) {
                sum = 0;
                measures.forEach((val) => { sum += d[val]; })
                return sum;
            });

            //Parse the year for propery time scaling
            var parseYear = d3.timeParse("%Y");
            data.forEach(function (d) { d.Year = parseYear(d.Year) });

            var xScale = d3.scaleTime()
                .domain([data[0].Year, data[data.length - 1].Year]) // input
                .range([2, width]); // output

            var yValsVisible = measures.slice(0);

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
            if (!Object.is(title, undefined)) {
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

            //Add horizontal grid lines
            svg.append("g")
                .attr("class", "grid-lines")
                .call(d3.axisLeft(yScale)
                    .tickSize(-width)
                    .tickFormat("")
                )
                .call((g) => g.select(".domain").remove());

            //Chart legend
            var keys = measures.reverse();
            svg.selectAll("#legend-points") // Add points
                .data(keys)
                .enter()
                .append("circle")
                .attr("r", 7)
                .attr("class", (d) => d.toLowerCase())
                .attr("cx", width + 40)
                .attr("cy", (d, i) => margin.top + i * 20)
                .on("click", (d, i, n) => {
                    svg.selectAll(".layers").remove();
                    index = yValsVisible.indexOf(d);
                    if (index >= 0) {
                        yValsVisible.splice(index, 1);
                        d3.select(n[i]).attr("class", "unselected");
                    }
                    else {
                        yValsVisible.push(d);
                        d3.select(n[i]).attr("class", (d) => d.toLowerCase());
                    }
                    update(yValsVisible);
                });;

            svg.selectAll("#legend-text") //Add text
                .data(keys)
                .enter()
                .append("text")
                .text((d) => d)
                .attr("x", width + 55)
                .attr("y", (d, i) => margin.top + i * 20 + 3.5)
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

            function update(cols) {

                //Create stacked area chart
                var stackGenerator = d3.stack().keys(cols);
                var stackedData = stackGenerator(data);

                svg.selectAll(".layers")
                    .data(stackedData)
                    .enter()
                    .append("path")
                    .attr("class", function (d) { return d.key.toLowerCase() + " layers" })
                    .attr("d", d3.area()
                        .x((d) => xScale(d.data[dimension]))
                        .y0((d) => yScale(d[0]))
                        .y1((d) => yScale(d[1]))
                    );
            }
            update(yValsVisible);
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

    my.dimension = function (value) {
        if (!arguments.length) return dimension;
        dimension = value;
        return my;
    }

    my.measures = function (value) {
        measures = value;
        return my;
    }

    return my;
}
var timeserieslinechart = function () {
    var margin = { top: 20, right: 20, bottom: 40, left: 80 }
        , width = window.innerWidth // Use the window's width 
        , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height
    var dimension = "Year";
    var max, min, title, measures;

    function my(selection) {
        selection.each(function (data) {

            if (Object.is(measures, undefined)) throw ("Must have at least one measure");

            width = width - margin.left - margin.right - 55;

            //get max value of all fields for autoscaling (if one isn't specified)
            if (Object.is(max, undefined)) {
                max = 0
                measures.forEach(function (val) {
                    max = Math.max(max, d3.max(data, (d) => d[val]));
                    max = Math.max(max, 5);
                })
            }

            //get min value of all fields for autoscaling (if one isn't specified)
            if (Object.is(min, undefined)) {
                min = Number.POSITIVE_INFINITY
                measures.forEach(function (val) {
                    min = Math.min(min, d3.min(data, (d) => d[val]));
                })
            }

            //Parse the year for proper time scaling
            var parseYear = d3.timeParse("%Y");
            data.forEach(function (d) { d.Year = parseYear(d.Year) });

            //Create scale functions to map data to positions in SVG
            var xScale = d3.scaleTime()
                .domain(d3.extent(data, (d) => d[dimension]))
                .range([2, width]);

            var yScale = d3.scaleLinear()
                .domain([max, min])
                .range([2, height])
                .nice();

            //Create wrapper for chart
            var chartWrapper = d3.select(this)
                .append("div")
                .attr("class", "chart-wrapper");

            chartWrapper.style("width", width + margin.left + margin.right + 55 + "px");

            //Add title
            if (!Object.is(title, undefined)) {
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

            //Add horizontal grid lines
            svg.append("g")
                .attr("class", "grid-lines")
                .call(d3.axisLeft(yScale)
                    .tickSize(-width)
                    .tickFormat("")
                    .ticks(Math.min(max, 10))
                )
                .call((g) => { g.select(".domain").remove() });

            //Y axis
            svg.append("g")
                .attr("class", "yAxis")
                .call(d3.axisLeft(yScale)
                    .ticks(Math.min(max, 10))
                );

            //X axis
            svg.append("g")
                .attr("class", "xAxis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale));

            //For each field create a line
            svg.selectAll("#ts-line")
                .data(measures)
                .enter()
                .append("path")
                .each(function (line) {
                    d3.select(this).datum(data)
                        .attr("class", line.toLowerCase())
                        .attr("d", d3.line()
                            .x((d) => xScale(d[dimension]))
                            .y((d) => yScale(d[line])))
                });

            //For each field add points
            svg.selectAll(".categories")
                .data(measures)
                .enter()
                .append("g")
                .each(function (line) {
                    pointsClass = "p-" + line.toLowerCase();
                    hoverClass = "h-" + line.toLowerCase();
                    d3.select(this)
                        .selectAll(".points")
                        .data(data)
                        .enter()
                        .append("circle")
                        .attr("class", pointsClass)
                        .attr("cx", (d) => xScale(d[dimension]))
                        .attr("cy", (d) => yScale(d[line]))
                        .attr("r", 5);
                });

            var voronoi = d3.voronoi()
                .x((d) => xScale(d[dimension]))
                .y((d) => yScale(d[measures[0]]))
                .size(width, height)(data);

            const voronoiRadius = width / 10;

            svg.append('circle')
                .attr('class', 'highlight-circle')
                .attr('r', 7) // slightly larger than our points
                .style('fill', 'none')
                .style('display', 'none');

            // callback to highlight a point
            function highlight(d) {
                // no point to highlight - hide the circle
                if (!d) {
                    d3.select('.highlight-circle').style('display', 'none');

                    // otherwise, show the highlight circle at the correct position
                } else {
                    d3.select('.highlight-circle')
                        .style('display', '')
                        .style('stroke', "blue")
                        .attr('cx', xScale(d[dimension]))
                        .attr('cy', yScale(d[measures[0]]));
                }
            }

            // callback for when the mouse moves across the overlay
            function mouseMoveHandler() {
                // get the current mouse position
                const [mx, my] = d3.mouse(this);

                // use the new diagram.find() function to find the Voronoi site
                // closest to the mouse, limited by max distance voronoiRadius
                const site = voronoi.find(mx, my, voronoiRadius);

                // highlight the point if we found one
                highlight(site && site.data);
            }

            svg.on('mousemove', mouseMoveHandler)
            .on('mouseleave', () => {
              // hide the highlight circle when the mouse leaves the chart
              highlight(null);
            });

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
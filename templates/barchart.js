var barChart = function () {
    var margin = { top: 20, right: 20, bottom: 50, left: 80 }
        , width = window.innerWidth// Use the window's width 
        , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height
    var dimension, measure, title, max;

    function my(selection) {
        selection.each(function (data) {

            if (Object.is(dimension, undefined)) throw ("Must have at least one dimension");
            if (Object.is(measure, undefined)) throw ("Must have at least one measure");

            width = width - margin.left - margin.right - 55;

            //Create scale functions to map data to positions in SVG
            var xScale = d3.scaleBand()
                .domain(data.map(d => d[dimension]))
                .range([2, width]);

            if (Object.is(max, undefined)) {
                max =  d3.max(data.map(d => d[measure]));
                max = Math.max(max, 5);
            }
                    
            var yScale = d3.scaleLinear()
                .domain([0, max])
                .range([height, 0]).nice();

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

            //Shift ticks from middle of rectangle to right side
            var shiftLength = xScale.bandwidth() / 2;

            //X axis
            svg.append("g")
                .attr("class", "xAxis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(xScale))
                .selectAll("text")
                .attr("transform", "translate(" + shiftLength + ",0) rotate(-20)") //Translate and rotate text
                .style("text-anchor", "end");

            svg.selectAll(".xAxis .tick line").each(function () {
                d3.select(this).attr("transform", "translate(" + shiftLength + ",0)"); //Translate ticks
            })

            //Y axis
            svg.append("g")
                .attr("class", "yAxis")
                .call(d3.axisLeft(yScale).ticks(Math.min(max, 10)))

            //For each X value create a bar of height y
            svg.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", (d) => xScale(d[dimension]))
                .attr("y", (d) => yScale(d[measure]) - 1)
                .attr("width", xScale.bandwidth())
                .attr("height", (d) => height - yScale(d[measure]));
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

    my.max = function (value) {
        if (!arguments.length) return max;
        max = value;
        return my;
    }

    my.margin = function (value) {
        if (!arguments.length) return margin;
        margin = value;
        return my;
    }

    my.dimension = function (value) {
        dimension = value;
        return my;
    }

    my.measure = function (value) {
        measure = value;
        return my;
    }

    return my;
}
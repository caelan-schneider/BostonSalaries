var timeserieschart = function () {
    var margin = { top: 50, right: 500, bottom: 50, left: 75 }
        , width = window.innerWidth - margin.left - margin.right // Use the window's width 
        , height = window.innerHeight - margin.top - margin.bottom // Use the window's height

    function my(selection) {

        selection.each(function (data) {

            var xScale = d3.scaleTime()
                .domain([data[0].Year, data[data.length - 1].Year]) // input
                .range([0, width]); // output

            //get max value for autoscaling
            var max = [];
            data.forEach(
                function (obj) {
                    max = max.concat([obj.Total]);
                });
            max = d3.max(max);

            var yScale = d3.scaleLinear()
                .domain([0, max]) // input 
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

            // Regular area
            svg.append("path")
                .datum(data)
                .attr("class", "regular")
                .attr("d", d3.area()
                    .x(function (d, i) { return xScale(d.Year) })
                    .y0(height)
                    .y1(function (d, i) { return yScale(d.Regular) })
                    .curve(d3.curveMonotoneX));

            //Overtime area
            svg.append("path")
                .datum(data)
                .attr("class", "overtime")
                .attr("d", d3.area()
                    .x(function (d, i) { return xScale(d.Year) })
                    .y0(function (d, i) { return yScale(d.Regular) })
                    .y1(function (d, i) { return yScale(d.Overtime + d.Regular) })
                    .curve(d3.curveMonotoneX));

            //Injury area
            svg.append("path")
                .datum(data)
                .attr("class", "injury")
                .attr("d", d3.area()
                    .x(function (d, i) { return xScale(d.Year) })
                    .y0(function (d, i) { return yScale(d.Overtime + d.Regular) })
                    .y1(function (d, i) { return yScale(d.Injury + d.Overtime + d.Regular) })
                    .curve(d3.curveMonotoneX));

            //Retro area
            svg.append("path")
                .datum(data)
                .attr("class", "retro")
                .attr("d", d3.area()
                    .x(function (d, i) { return xScale(d.Year) })
                    .y0(function (d, i) { return yScale(d.Injury + d.Overtime + d.Regular) })
                    .y1(function (d, i) { return yScale(d.Retro + d.Injury + d.Overtime + d.Regular) })
                    .curve(d3.curveMonotoneX));

            //Other area
            svg.append("path")
                .datum(data)
                .attr("class", "other")
                .attr("d", d3.area()
                    .x(function (d, i) { return xScale(d.Year) })
                    .y0(function (d, i) { return yScale(d.Injury + d.Retro + d.Overtime + d.Regular) })
                    .y1(function (d, i) { return yScale(d.Other + d.Retro + d.Injury + d.Overtime + d.Regular) })
                    .curve(d3.curveMonotoneX));

            //Total line
            svg.append("path")
                .datum(data)
                .attr("class", "total")
                .attr("d", d3.line()
                    .x(function (d, i) { return xScale(d.Year) })
                    .y(function (d, i) { return yScale(d.Total) })
                    .curve(d3.curveMonotoneX));

            // //Regular points
            // svg.selectAll(".regularPoints")
            //     .data(data).enter().append("circle")
            //     .attr("class", "regularPoints")
            //     .attr("cx", function (d, i) { return xScale(d.Year) })
            //     .attr("cy", function (d, i) { return yScale(d.Regular) })
            //     .attr("r", 4)
            //     .attr("stroke", "#fff")
            //     .attr("fill", "#84a9ac");

            // //Overtime points
            // svg.selectAll(".overtimePoints")
            //     .data(data).enter().append("circle")
            //     .attr("class", "overtimePoints")
            //     .attr("cx", function (d, i) { return xScale(d.Year) })
            //     .attr("cy", function (d, i) { return yScale(d.Overtime + d.Regular) })
            //     .attr("r", 4);

            //Total points
            svg.selectAll(".totalPoints")
                .data(data).enter().append("circle")
                .attr("class", "totalPoints")
                .attr("cx", function (d, i) { return xScale(d.Year) })
                .attr("cy", function (d, i) { return yScale(d.Total) })
                .attr("r", 4);
        });
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

    return my;
}
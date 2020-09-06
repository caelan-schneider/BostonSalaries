var areachart = function () {
    var margin = { top: 20, right: 20, bottom: 40, left: 80 }
        , width = window.innerWidth - margin.left - margin.right // Use the window's width 
        , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height
    var title = "";
    var xVal = "Year";
    var yVals = ["Regular", "Overtime", "Injury", "Retro", "Other"];

    function my(selection) {
        selection.each(function (data) {
           
             //Add title
             if (title != "") {
                d3.select(this).append("span")
                    .attr("class", "title")
                    .text(title).append("br");
            }

            //Parse the year for propery time scaling
            var parseYear = d3.timeParse("%Y");
            data.forEach(function (d) { d.Year = parseYear(d.Year)});

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
                .attr("width", width + margin.left + margin.right + 200)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //chart legend
            var keys = yVals.reverse();
            svg.selectAll("#legendPoints")
                .data(keys)
                .enter()
                .append("circle")
                .attr("r", 7)
                .attr("class", function(d){return d.toLowerCase()})
                .attr("cx", width + 40)
                .attr("cy", function(d, i){return margin.top + i * 20});

            svg.selectAll("#legendText")
                .data(keys)
                .enter()
                .append("text")
                .text(function(d){return d})
                .attr("x", width + 55)
                .attr("y", function(d, i){return margin.top + i * 20 + 3.5})
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
            
            var stackedData = d3.stack()
                .keys(yVals.reverse())
                (data)
            console.log(stackedData);
            
            svg.selectAll(".layers")
                .data(stackedData)
                .enter()
                .append("path")
                .attr("class", function(d){return d.key.toLowerCase()})
                .attr("d",d3.area()
                    .x(function (d) { return xScale(d.data[xVal]) })
                    .y0(function(d) { return yScale(d[0])})
                    .y1(function(d) { return yScale(d[1])})
                );

            //Total line
            svg.append("path")
                .datum(data)
                .attr("class", "total")
                .attr("d", d3.line()
                    .x(function (d, i) { return xScale(d.Year) })
                    .y(function (d, i) { return yScale(d.Total) }));
                    //.curve(d3.curveMonotoneX));

            //Total points
            svg.selectAll(".totalPoints")
                .data(data).enter().append("circle")
                .attr("class", "totalPoints")
                .attr("cx", function (d, i) { return xScale(d.Year) })
                .attr("cy", function (d, i) { return yScale(d.Total) })
                .attr("r", 4);
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
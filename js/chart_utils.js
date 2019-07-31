function create_stacked_bar_chart(canvas_id, data) {
    var canvas = $('#'+canvas_id);
    var height = canvas.height();
    var width = canvas.width();
    var ys = d3.scaleLinear().domain([0, 100]).range([0, height]);
    var colors = d3.scaleSequential().domain([0, 15]).interpolator(d3.interpolateRainbow);
    var chart = d3.select('#'+canvas_id);
    var tooltip = d3.select('#tooltip');
    tooltip.style("opacity", 0);
    chart.selectAll('g').data(data).enter().append('g')
        .attr('tranform', function (d, i) {return 'translate(' + width / data.length * i + ', 0)'})
        .on('mouseover', function (x, y) {
            d3.select(this).attr("opacity", 0.8);
        })
        .on('mouseout', function () {
            d3.select(this).attr("opacity", 1);
        })
        .each(function (d, idx) {
                var g = d3.select(this);
                var runing_sum = [0];
                for (j in data[idx]) {
                    runing_sum.push(runing_sum[j] + data[idx][j]);
                }
                g.selectAll('rect').data(data[idx]).enter().append('rect')
                    .attr("x", function (d,i) {return width / data.length * idx})
                    .attr("width", function (d,i) {return width / data.length - 5})
                    .attr("y", function (d, i) {return height - ys(runing_sum[i+1])})
                    .attr("height", function (d, i) {return ys(d)})
                    .attr("fill", function (d, i) {return colors(i)})
                    .attr("opacity", 0)
                    .on('mouseover', function (d) {
                        tooltip
                            .html('<p>' + d + '<p>')
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY) + "px")
                            .transition()
                            .duration(500)
                            .style("opacity", 0.8);
                    })
                    .on("mouseout", function(d) {
                        tooltip
                            .transition()
                            .duration(500)
                            .style("opacity", 0);
                    })
                    .transition()
                    .delay(function(d, i) { return i * 500; })
                    .duration(1500)
                    .ease(d3.easeCubic)
                    .attr("opacity", 1)
            }
        );
}

function create_packed_chart(canvas_id, data) {
    var canvas = $('#'+canvas_id);
    var height = canvas.height();
    var width = canvas.width();
    var ys = d3.scaleLinear().domain([0, 100]).range([0, height]);
    var colors = d3.scaleSequential().domain([0, 25]).interpolator(d3.interpolateRainbow);
    var chart = d3.select('#'+canvas_id);
    var tooltip = d3.select('#tooltip');
    var root = d3.hierarchy(data);
    var packLayout = d3.pack();
    packLayout.size([width, height]);
    root.sum(function(d) {
        return d.value;
    });
    packLayout(root);
    tooltip.style("opacity", 0);
    chart.append('g');

    var nodes = d3.select('svg g')
        .selectAll('g')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('transform', function(d) {return 'translate(' + [d.x, d.y] + ')'});

    nodes
        .append('circle')
        .attr('fill', function (d, i) {return d.data.color})
        .attr('r', function(d) { return d.r; })
        .on('mouseover', function (d) {
            tooltip
                .html('<p>' + d.data.name + '<p>')
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px")
                .transition()
                .duration(500)
                .style("opacity", 0.8);
        })
        .on("mouseout", function(d) {
            tooltip
                .transition()
                .duration(500)
                .style("opacity", 0);
        });

    nodes
        .append('text')
        .attr('dx', -14)
        .attr('dy', 4)
        .attr('fill', '#eee')
        .text(function(d) {
            return d.children === undefined ? d.data.name : '';
        })
}
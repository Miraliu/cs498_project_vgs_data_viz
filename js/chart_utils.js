const platforms = ['Wii', 'NES', 'PC', 'GB', 'DS', 'X360', 'SNES', 'PS3', 'PS4',
       '3DS', 'PS2', 'GBA', 'NS', 'GEN', 'N64', 'PS', 'XOne', 'WiiU',
       'XB', 'PSP', '2600', 'GC', 'GBC', 'PSN', 'PSV', 'DC', 'SAT', 'SCD',
       'WS', 'XBL', 'Amig', 'VC', 'NG', 'WW', 'PCE', '3DO', 'GG', 'OSX',
       'PCFX', 'Mob', 'And', 'Ouya', 'DSiW', 'MS', 'DSi', 'VB', 'Linux',
       'MSD', 'C128', 'AST', 'Lynx', '7800', '5200', 'S32X', 'MSX', 'FMT',
       'ACPC', 'C64', 'BRW', 'AJ', 'ZXS', 'NGage', 'GIZ', 'WinP', 'iQue',
       'iOS', 'Arc', 'ApII', 'Aco', 'BBCM', 'TG16', 'CDi', 'CD32', 'Int']

const years = ['1979', '1980', '1981', '1982', '1983', '1984', '1985', '1986', '1987', 
        '1988', '1989', '1990', '1991', '1992', '1993', '1994', '1995', '1996', '1997', '1998', 
        '1999', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', 
        '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019']

const colors = d3.scaleSequential().domain([0, 80]).interpolator(d3.interpolateRainbow);

function create_stacked_bar_chart(canvas_id, data) {
    var canvas = $('#'+canvas_id);
    var height = canvas.height();
    var width = canvas.width();
    var ys = d3.scaleLinear().domain([0, 100]).range([0, height]);
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


function create_area_chart(canvas_id, data) {
    var canvas = $('#'+canvas_id);
    var height = canvas.height();
    var width = canvas.width();
    var chart = d3.select('#'+canvas_id);
    var ys = d3.scaleLinear().domain([0, 5000]).range([height, 0]);
    var area = d3.area()
                .x(function(d, i) {return i * width / 40})
                .y0(function(d, i) {return ys(d[0])})
                .y1(function(d, i) {return ys(d[1])});
    var stack = d3.stack().keys(platforms);

    var stacked = stack(data);

    chart.select('g')
        .attr('transform', 'translate(50,0)')
        .selectAll('path')
        .data(stacked)
        .enter()
        .append('path')
        .transition()
        .duration(500)
        .style('fill', function(d, i) {
            return colors(i);
        })
        .attr('d', area);

    chart.append('g').attr('transform', 'translate(50,50)').call(d3.axisLeft(ys).tickFormat(d3.format("~s")));

}

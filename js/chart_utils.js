const platforms = ['Wii', 'NES', 'PC', 'GB', 'DS', 'X360', 'SNES', 'PS3', 'PS4',
       '3DS', 'PS2', 'GBA', 'NS', 'GEN', 'N64', 'PS', 'XOne', 'WiiU',
       'XB', 'PSP', '2600', 'GC', 'GBC', 'PSN', 'PSV', 'DC', 'SAT', 'SCD',
       'WS', 'XBL', 'Amig', 'VC', 'NG', 'WW', 'PCE', '3DO', 'GG', 'OSX',
       'PCFX', 'Mob', 'And', 'Ouya', 'DSiW', 'MS', 'DSi', 'VB', 'Linux',
       'MSD', 'C128', 'AST', 'Lynx', '7800', '5200', 'S32X', 'MSX', 'FMT',
       'ACPC', 'C64', 'BRW', 'AJ', 'ZXS', 'NGage', 'GIZ', 'WinP', 'iQue',
       'iOS', 'Arc', 'ApII', 'Aco', 'BBCM', 'TG16', 'CDi', 'CD32', 'Int']

const genres = ['Sports', 'Platform', 'Racing', 'Shooter', 'Role-Playing',
       'Puzzle', 'Party', 'Simulation', 'Action',
       'Action-Adventure', 'Fighting', 'Strategy', 'Adventure', 'Music',
       'MMO', 'Sandbox', 'Visual Novel', 'Board Game', 'Education']

const years = ['1979', '1980', '1981', '1982', '1983', '1984', '1985', '1986', '1987', 
        '1988', '1989', '1990', '1991', '1992', '1993', '1994', '1995', '1996', '1997', '1998', 
        '1999', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', 
        '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019']

const colors = d3.scaleSequential().domain([0, genres.length + 1]).interpolator(d3.interpolateRainbow);

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

function create_packed_chart(canvas_id, data, value_key) {
    var canvas = $('#'+canvas_id);
    var height = canvas.height();
    var width = canvas.width();
    var ys = d3.scaleLinear().domain([0, 100]).range([0, height]);
    var chart = d3.select('#'+canvas_id);
    var tooltip = d3.select('#tooltip');
    var root = d3.hierarchy(data);
    var packLayout = d3.treemap();
    packLayout.size([width, height]);
    root.sum(function(d) {
        return d[value_key];
    });
    packLayout(root);
    tooltip.style("opacity", 0);
    chart.append('g');

    var nodes = chart.select('g')
                  .selectAll('g')
                  .data(root.descendants())
                  .enter()
                  .append('g')
                  .attr('transform', function(d) {return 'translate(' + [d.x0, d.y0] + ')'})

    nodes
        .append('rect')
        .attr('width', function(d) { return d.x1 - d.x0; })
        .attr('height', function(d) { return d.y1 - d.y0; })
        .attr('fill', function (d, i) {return colors(genres.indexOf(d.data['Genre']))})
        .attr('r', function(d) { return d.r; })
        .on('mouseover', function (d) {
            tooltip
                .html('<p>' + d.data['Genre'] + ': ' + d.data[value_key] + '<p>')
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
}


function create_area_chart(canvas_id, data, keys) {
    var canvas = $('#'+canvas_id);
    var height = canvas.height() - 50;
    var width = canvas.width() - 60;
    var chart = d3.select('#'+canvas_id);
    var tooltip = d3.select('#tooltip');
    var margin = 50;
    var ys = d3.scaleLinear().domain([0, 5000]).range([height - 50, 0]);
    var xs = d3.scaleBand().domain(years).range([0, width]);
    var area = d3.area()
                .x(function(d, i) {return i * width / 40})
                .y0(function(d, i) {return ys(d[0])})
                .y1(function(d, i) {return ys(d[1])});
    var stack = d3.stack().keys(keys);

    var stacked = stack(data);

    chart.select('g')
        .attr('transform', 'translate(50, 50)')
        .selectAll('path')
        .data(stacked)
        .enter()
        .append('path')
        .style('fill', function(d, i) {
            return colors(i);
        })
        .transition()
        .duration(1500)
        .attr('d', area);

    chart.append('g').attr('transform', 'translate(50,50)').call(d3.axisLeft(ys).tickFormat(d3.format("~s")));
    chart.append('g').attr("transform", "translate(50," + height + ")").call(d3.axisBottom(xs).tickValues([1980,1990,2000,2010,2019]));

    chart.selectAll("legendrect")
        .data(genres)
        .enter()
        .append("rect")
        .attr("x", width - 60)
        .attr("y", function(d,i){return 10 + i * 13})
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function(d, i){ return colors(i)})

    chart.selectAll("legendlabel")
        .data(genres)
        .enter()
        .append("text")
        .attr("x", width - 60 + 12)
        .attr("y", function(d,i){return 10 + i * 13 + 5})
        .style("fill", '#a1a1a1')
        .style("font-size", '0.7em')
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
}

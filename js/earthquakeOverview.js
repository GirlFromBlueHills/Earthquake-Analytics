
function nextPage(){
    window.location='fracking_vs_earthquakes.html';
}

var margin = {top: 30, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


function colores(n) {
    var colores_g = ["#FF8400", "#FF5500", "#FF3700", "#FF0000", "#FF0084", "#FF00B3", "#FF00E1", "#D400FF", "#BB00FF", "#A200FF"];
    return colores_g[Math.round(n)];
}

/*
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */

// setup x
var xValue = function(d) { return d.mag;}, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("top");

// setup y
var yValue = function(d) { return d.depth;}, // data -> value
    yScale = d3.scale.linear().range([0, height]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");


// add the graph canvas to the body of the webpage
var scatterplot = d3.select("#scatterplot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("#scatterplot").append("div")
    .attr("class", "tooltip")

// load data
d3.csv("./csv/earthquake.csv", function(error, data) {

    // change string (from CSV) into number format
    data.forEach(function(d) {
        d.depth = +d.depth;
        d.mag = +d.mag;
        d.longitude = +d.longitude;
        d.latitude = +d.latitude;
//    console.log(d);
    });

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

    // x-axis
    scatterplot.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + 0 + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width-50)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Magnitude");

    // y-axis
    scatterplot.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .attr("dx", "-26em")
        .style("text-anchor", "end")
        .text("Depth");

    // draw dots
    scatterplot.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", "#0294C4")
        .attr("opacity",0.9)
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("Magnitude: "+xValue(d)
                + "</br> Depth:    " + yValue(d))
                .style("background", "lightsteelblue")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

});


d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);

var width = 960,
    height = 500;
focused = false,
    ortho = true,
    sens = 0.25;


var projectionMap = d3.geo.equirectangular()
    .scale(145)
    .translate([width / 2, height / 2])


var proj = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .scale(220);

var projection = proj;


var i = -1,n;


var path = d3.geo.path().projection(projection).pointRadius(5);

var rotate = d3_geo_greatArcInterpolator();

var svg = d3.select("#ball").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("mousedown", mousedown);


var zoneTooltip = d3.select("#ball").append("div").attr("class", "zoneTooltip"),
    infoLabel = d3.select("#ball").append("div").attr("class", "infoLabel");

var probe = d3.select("#ball").append("div")
    .attr("id","probe")
    .attr("class", "earth_tooltip");

var isPlay = false;

var title;

var position;


function defaultRotate() {
    d3.transition()
        .duration(1500)
        .tween("rotate", function() {
            var r = d3.interpolate(projection.rotate(), [0, 0]);
            return function(t) {
                projection.rotate(r(t));
                svg.selectAll("path").attr("d", path);
            };
        })
};

function reset() {
    svg.selectAll(".focused").classed("focused", focused = false);
    infoLabel.style("display", "none");
    zoneTooltip.style("display", "none");
    d3.selectAll("#ocean_color").transition().duration(5000).attr("offset", "100%")
        .attr("stop-color", "blue");
    //Transforming Map to Globe

    projection = proj;
    path.projection(projection);
    svg.selectAll("path").transition().duration(5000).attr("d", path)
    svg.selectAll("path").classed("ortho", ortho = true);
};


queue()
    .defer(d3.json,"json/world-110m2.json")
    .defer(d3.tsv, "csv/world-110m-country-names.tsv")
    .defer(d3.csv,"csv/earthquake.csv")
    .await(ready);

function ready(error, world, countryData, places) {


    var countryById = {},
        countries = topojson.feature(world, world.objects.countries).features;

    //Adding countries by name

    countryData.forEach(function(d) {
        countryById[d.id] = d.name;
    });



    n = places.length;
    position = places;


    var ocean_fill = svg.append("defs").append("radialGradient")
        .attr("id", "ocean_fill")
        .attr("cx", "75%")
        .attr("cy", "25%");
    ocean_fill.append("stop").attr("offset", "5%").attr("stop-color", "#fff");
    var ocean_color = ocean_fill.append("stop")
        .attr("id", "ocean_color")
        .attr("offset", "100%")
        .attr("stop-color", "blue");


    var globe_highlight = svg.append("defs").append("radialGradient")
        .attr("id", "globe_highlight")
        .attr("cx", "75%")
        .attr("cy", "25%");
    globe_highlight.append("stop")
        .attr("offset", "5%").attr("stop-color", "#ffd")
        .attr("stop-opacity","0.6");
    globe_highlight.append("stop")
        .attr("offset", "100%").attr("stop-color", "#ba9")
        .attr("stop-opacity","0.2");

    var globe_shading = svg.append("defs").append("radialGradient")
        .attr("id", "globe_shading")
        .attr("cx", "55%")
        .attr("cy", "45%");
    globe_shading.append("stop")
        .attr("offset","30%").attr("stop-color", "#fff")
        .attr("stop-opacity","0")
    globe_shading.append("stop")
        .attr("offset","100%").attr("stop-color", "#505962")
        .attr("stop-opacity","0.3")

    var drop_shadow = svg.append("defs").append("radialGradient")
        .attr("id", "drop_shadow")
        .attr("cx", "50%")
        .attr("cy", "50%");
    drop_shadow.append("stop")
        .attr("offset","20%").attr("stop-color", "#000")
        .attr("stop-opacity",".5")
    drop_shadow.append("stop")
        .attr("offset","100%").attr("stop-color", "#000")
        .attr("stop-opacity","0")

    svg.append("ellipse")
        .attr("cx", 440).attr("cy", 450)
        .attr("rx", projection.scale()*.90)
        .attr("ry", projection.scale()*.25)
        .attr("class", "noclicks")
        .style("fill", "url(#drop_shadow)");

    svg.append("circle")
        .attr("cx", width / 2).attr("cy", height / 2)
        .attr("r", projection.scale())
        .attr("class", "noclicks")
        .style("fill", "url(#ocean_fill)");

    var world = svg.selectAll("path").data(countries);
    world.enter().append("path")
        .attr("class", "mapData")
        .attr("d", path)
        .classed("ortho", ortho = true);



    //draw points on the sphere

    point = svg.selectAll("dot").data(places);
    var time, mag;
    point.enter().append("path")
        .attr("class", "point")
        .datum(function(d) { return {
            type: "Point",
            coordinates: [d.longitude, d.latitude],
            time: d.time,
            mag: d.mag
        }; })
        .on("mousemove",function(d){
            setProbeContent(d);
            probe
                .style("background", "lightsteelblue")
                .style( {
                    "display" : "block",
                    "top" : (d3.event.pageY - 80) + "px",
                    "left" : (d3.event.pageX + 10) + "px"
                })
        })
        .on("mouseout",function(){
            hoverData = null;
            probe.style("display","none");
        })
        .attr("d", path)
        .style("opacity", 0)
        .attr("fill", function(d,i) { return colores(d.mag); } );

    function setProbeContent(d){

        var html = "Time: "+new Date(d["time"])+"</br>"+"Longitude: "+ d.coordinates[0]+"   "+"Latitude: "+ d.coordinates[1]+"</br>"+"Magnitude: "+ d.mag+"</br>";
        probe
            .html( html );
    }



    title = svg.append("text")
        .attr("x", 1*width / 15)
        .attr("y", height * 1 / 20);


    world.call(d3.behavior.drag()
        .origin(function() { var r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
        .on("drag", function() {
            var x = d3.event.x * sens,
                y = -d3.event.y * sens,
                rotate = projection.rotate();
            //Restriction for rotating upside-down
            y = y > 30 ? 30 :
                    y < -30 ? -30 :
                y;
            projection.rotate([x, y]);
            svg.selectAll("path.ortho").attr("d", path);
            svg.selectAll(".focused").classed("focused", focused = false);
        }))

    //Events processing

    world.on("mouseover", function(d) {
        if (ortho === true) {
            infoLabel.text(countryById[d.id])
                .style("display", "inline");
        } else {
            zoneTooltip.text(countryById[d.id])
                .style("left", (d3.event.pageX + 7) + "px")
                .style("top", (d3.event.pageY - 15) + "px")
                .style("display", "block");
        }
    })
        .on("mouseout", function(d) {
            if (ortho === true) {
                infoLabel.style("display", "none");
            } else {
                zoneTooltip.style("display", "none");
            }
        })
        .on("mousemove", function() {
            if (ortho === false) {
                zoneTooltip.style("left", (d3.event.pageX + 7) + "px")
                    .style("top", (d3.event.pageY - 15) + "px");
            }
        })
        .on("click", function(d) {
            if (focused === d) return reset();
            d3.selectAll("#ocean_color").transition().duration(5000).attr("offset", "100%")
                .attr("stop-color", "white");
            svg.selectAll(".focused").classed("focused", false);
            d3.select(this).classed("focused", focused = d);
            infoLabel.text(countryById[d.id])
                .style("display", "inline");

            //Transforming Globe to Map

            if (ortho === true) {
                defaultRotate();
                setTimeout(function() {
                        svg.selectAll(".ortho").classed("ortho", ortho = false);
                        projection = projectionMap;
                        path.projection(projection);
                        svg.selectAll("path").transition().duration(5000).attr("d", path);
                    }
                    , 1600);
            }
        });


    //rotation animation

    startAnimation();
    d3.select('#playOrStop').on('click', function () {
        if (isPlay){
            isPlay = false;
        }else{
            isPlay = true;
        }
        startAnimation();
    });




}

function startAnimation() {

    if (--i <= 0) i = n-1;
    if(isPlay == false){
        point.style("opacity",0.3);
        return;
    }
    title.text(new Date(position[i].time)+"  "+"Longitude: "+ position[i].longitude +" Latitude: "+ position[i].latitude+"\n"+ " Magnitude: " + position[i].mag);

    point.transition()
        .style("opacity", function(d, j) { return j === i ? "1":"0" ; })
    ;

    scatterplot.selectAll(".dot").transition()
        .style("fill", function(d, j) { return j === i ? "red":"#0294C4" ; })

    d3.transition()
        .delay(250)
        .duration(1500)
        .tween("rotate", function() {
            var p = [position[i].longitude,position[i].latitude];
            rotate.source(projection.rotate()).target([-p[0], -p[1]]).distance();
            return function(t) {
                projection.rotate(rotate(t));
                svg.selectAll(".mapData").attr("d", path);
                svg.selectAll(".point").attr("d", path);
            };
        })
        .transition()
        .each("end", startAnimation);
}


// modified from http://bl.ocks.org/1392560
var m0, o0;
function mousedown() {
    isPlay = false;
    m0 = [d3.event.pageX, d3.event.pageY];
    o0 = projection.rotate();
    d3.event.preventDefault();
}
function mousemove() {
    if (m0) {
        var m1 = [d3.event.pageX, d3.event.pageY]
            , o1 = [o0[0] + (m1[0] - m0[0]) / 6, o0[1] + (m0[1] - m1[1]) / 6];
        o1[1] = o1[1] > 30  ? 30  :
                o1[1] < -30 ? -30 :
            o1[1];
        projection.rotate(o1);
        svg.selectAll(".mapData").attr("d", path);
        svg.selectAll(".point").attr("d", path);
    }
}
function mouseup() {
    if (m0) {
        mousemove();
        m0 = null;
    }
}

//display rotation animation with earthquake happening

var d3_radians = Math.PI / 180;

function d3_geo_greatArcInterpolator() {
    var x0, y0, cy0, sy0, kx0, ky0,
        x1, y1, cy1, sy1, kx1, ky1,
        d,
        k;

    function interpolate(t) {
        var B = Math.sin(t *= d) * k,
            A = Math.sin(d - t) * k,
            x = A * kx0 + B * kx1,
            y = A * ky0 + B * ky1,
            z = A * sy0 + B * sy1;
        return [
                Math.atan2(y, x) / d3_radians,
                Math.atan2(z, Math.sqrt(x * x + y * y)) / d3_radians
        ];
    }

    interpolate.distance = function() {
        if (d == null) k = 1 / Math.sin(d = Math.acos(Math.max(-1, Math.min(1, sy0 * sy1 + cy0 * cy1 * Math.cos(x1 - x0)))));
        return d;
    };

    interpolate.source = function(_) {
        var cx0 = Math.cos(x0 = _[0] * d3_radians),
            sx0 = Math.sin(x0);
        cy0 = Math.cos(y0 = _[1] * d3_radians);
        sy0 = Math.sin(y0);
        kx0 = cy0 * cx0;
        ky0 = cy0 * sx0;
        d = null;
        return interpolate;
    };

    interpolate.target = function(_) {
        var cx1 = Math.cos(x1 = _[0] * d3_radians),
            sx1 = Math.sin(x1);
        cy1 = Math.cos(y1 = _[1] * d3_radians);
        sy1 = Math.sin(y1);
        kx1 = cy1 * cx1;
        ky1 = cy1 * sx1;
        d = null;
        return interpolate;
    };

    return interpolate;
}






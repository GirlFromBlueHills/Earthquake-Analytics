
function previousPage(){
    window.location='EarthquakeOverView.html';
}
function nextPage(){
    window.location='fracking_vs_earthquakes.html';
}

var margin = {top: 30, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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

// setup fill color
var cValue = function(d) { return d.Manufacturer;},
    color = d3.scale.category10();

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

var proj = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .scale(220);

var pointpath = function(d, r) {
    var pr = d3.geo.path().projection(proj).pointRadius(r);
    return pr({type: "Point", coordinates: [d.lon, d.lat]})
}


var i = -1,n;


var path = d3.geo.path().projection(proj).pointRadius(5);

var rotate = d3_geo_greatArcInterpolator();

var svg = d3.select("#ball").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("mousedown", mousedown);


var probe = d3.select("#ball").append("div")
    .attr("id","probe")
    .attr("class", "earth_tooltip");

var isPlay = true;
var point = d3.geo.circle();

var title;

var position;

queue()
    .defer(d3.json,"json/world-110m2.json")
    .defer(d3.csv,"csv/earthquake.csv")
    .await(ready);

function ready(error, world, places) {
    n = places.length;
    position = places;



    var ocean_fill = svg.append("defs").append("radialGradient")
        .attr("id", "ocean_fill")
        .attr("cx", "75%")
        .attr("cy", "25%");
    ocean_fill.append("stop").attr("offset", "5%").attr("stop-color", "#fff");
    ocean_fill.append("stop").attr("offset", "100%").attr("stop-color", "blue");

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
        .attr("rx", proj.scale()*.90)
        .attr("ry", proj.scale()*.25)
        .attr("class", "noclicks")
        .style("fill", "url(#drop_shadow)");

    svg.append("circle")
        .attr("cx", width / 2).attr("cy", height / 2)
        .attr("r", proj.scale())
        .attr("class", "noclicks")
        .style("fill", "url(#ocean_fill)");

    svg.append("path")
        .datum(topojson.object(world, world.objects.land))
        .attr("class", "land noclicks")
        .attr("d", path);

    svg.append("circle")
        .attr("cx", width / 2).attr("cy", height / 2)
        .attr("r", proj.scale())
        .attr("class","noclicks")
        .style("fill", "url(#globe_highlight)");

    svg.append("circle")
        .attr("cx", width / 2).attr("cy", height / 2)
        .attr("r", proj.scale())
        .attr("class","noclicks")
        .style("fill", "url(#globe_shading)");


    //draw points on the sphere

    point = svg.selectAll(".dot").data(places);
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
        .attr("fill", "red" );

    function setProbeContent(d){

        var html = "Time: "+new Date(d["time"])+"</br>"+"Longitude: "+ d.coordinates[0]+"   "+"Latitude: "+ d.coordinates[1]+"</br>"+"Magnitude: "+ d.mag+"</br>";
        probe
            .html( html );
    }

    title = svg.append("text")
        .attr("x", 1*width / 15)
        .attr("y", height * 1 / 20);


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


function refresh() {
    svg.selectAll(".land").attr("d", path);
    svg.selectAll(".point").attr("d", path);


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
            rotate.source(proj.rotate()).target([-p[0], -p[1]]).distance();
            return function(t) {
                proj.rotate(rotate(t));
                svg.selectAll(".land").attr("d", path);
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
    o0 = proj.rotate();
    d3.event.preventDefault();
}
function mousemove() {
    if (m0) {
        var m1 = [d3.event.pageX, d3.event.pageY]
            , o1 = [o0[0] + (m1[0] - m0[0]) / 6, o0[1] + (m0[1] - m1[1]) / 6];
        o1[1] = o1[1] > 30  ? 30  :
                o1[1] < -30 ? -30 :
            o1[1];
        proj.rotate(o1);
        svg.selectAll("path.point").attr("d", function(d) {return pointpath(d, d.r)});
        refresh();
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






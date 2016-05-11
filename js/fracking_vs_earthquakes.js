var width = 1400,
    height = 600;

var projection = d3.geo.mercator()
    .center([-150, 55 ])
    .scale(430);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map-container").append("svg")
    .attr("width", width)
    .attr("height", height);

var probe = d3.select("body").append("div")
    .attr("id","probe");

var g = svg.append("g");

var map = g.append("g")
    .attr("id","map");

g.append( "rect" )
    .attr("width",width)
    .attr("height",height)
    .attr("fill","white")
    .attr("opacity",0)


var rColumn = "mag";
var rScale = d3.scale.sqrt();
var tScale = d3.time.scale();
var isPlaying = false;

d3.json("json/us.json", function(error, us) {
    states = topojson.feature(us, us.objects.states).features;
    map.selectAll("path")
        .data(states)
        .enter()
        .append("path")
        .attr("class", "feature")
        .style("fill", "gray")
        .attr("d", path)

    map.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "mesh")
        .attr("d", path);

    probe = d3.select("#map-container").append("div")
        .attr("id","probe");

    d3.select("body")
        .append("div")
        .style("height",d3.select("#map-container").node().offsetHeight + "px")
    d3.csv("csv/earthquake_usa.csv", function(error, data) {

        rScale.domain(d3.extent(data, function (d){ return +d[rColumn]; }));
        var rMin = 3;
        var rMax = 10;
        rScale.range([rMin, rMax]);

        tScale.domain(d3.extent(data,function (d){ return new Date(d["time"]);}))
            .range([0,20e3]);

        var dots =g.selectAll("circle")
            .data(data);
        dots.enter().append("circle");
        dots.attr("cx", function(d) {
            return projection([parseFloat(d["longitude"]), parseFloat(d["latitude"])])[0];
        }).attr("cy", function(d) {
            return projection([parseFloat(d["longitude"]), parseFloat(d["latitude"])])[1];
        })
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
            });
        dots.transition().duration(1e3)
            .delay(function (d){ return tScale(new Date(d["time"])); })
            .attr("r", function (d){ return rScale(d[rColumn]); });

        function setProbeContent(d){

            var html = "Earthquake location: "+d["place"]
                +"</br>"+"Longitude: "+ d["longitude"]+"   "+"Latitude: "+ d["latitude"]+""
                +"</br>"+"Magnitude: "+ d["mag"]
                +"</br>"+"depth: "+ d["depth"]
                +"</br>"+"Time: "+ new Date(d["time"]);
            probe
                .html( html );
        }


        dots.exit().remove();
    });
    d3.csv("csv/fracking_clean.csv", function(error, data) {


        var area =g.selectAll("ellipse")
            .data(data);
        area.enter().append("ellipse");
        area.attr("cx", function(d) {
            return projection([parseFloat(d["longitude"]), parseFloat(d["latitude"])])[0];
        }).attr("cy", function(d) {
            return projection([parseFloat(d["longitude"]), parseFloat(d["latitude"])])[1];
        }).attr("rx",2).attr("ry",2)
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
            });
        function setProbeContent(d){

            var html = "Fracking location: "+d["state"]+", "+ d["county"]
                +"</br>"+"Well name: "+ d["well_name"]
                +"</br>"+"Longitude: "+ d["longitude"]+"   "+"Latitude: "+ d["latitude"]+"" +
                "</br>"+"depth: "+ d["true_vertical_depth"]+"</br>";
            probe
                .html( html );
        }


        area.exit().remove();
        createLegend();


    });
    // zoom and pan
    var zoom = d3.behavior.zoom()
        .on("zoom",function() {
            g.attr("transform","translate("+
                                    d3.event.translate.join(",")+")scale("+d3.event.scale+")");
            g.selectAll("circle")
                .attr("d", path.projection(projection));
            g.selectAll("path")
                .attr("d", path.projection(projection));

        });

    svg.call(zoom)

});

function createLegend() {
    var legend = g.append("g").attr("id", "legend").attr("transform", "translate(800,10)");

    legend.append("circle").attr("class", "earthquake").attr("r", 5).attr("cx", 5).attr("cy",10);
    legend.append("circle").attr("class", "fracking").attr("r", 5).attr("cx", 5).attr("cy", 30);
    legend.append("circle").attr("class", "highlight").attr("r", 5).attr("cx", 5).attr("cy", 50);

    legend.append("text").text("earthquake").attr("x", 15).attr("y", 10);
    legend.append("text").text("fracking").attr("x", 15).attr("y", 30);
    legend.append("text").text("highlight earthquake").attr("x", 15).attr("y", 50);
}

//update data section
function updateData() {

    var place = document.getElementById('place').value;
    var start = new Date(document.getElementById('start').value);
    var end = new Date(document.getElementById('end').value);
    end.setDate(end.getDate()+1);
    d3.csv("csv/earthquake_usa.csv", function(error, data) {
        rScale.domain(d3.extent(data, function (d){ return +d[rColumn]; }));
        var rMin = 3;
        var rMax = 10;
        rScale.range([rMin, rMax]);


        var dots =g.selectAll("circle")
            .data(data);
        dots.enter().append("circle");
        dots.attr("cx", function(d) {
            return projection([parseFloat(d["longitude"]), parseFloat(d["latitude"])])[0];
        }).attr("cy", function(d) {
            return projection([parseFloat(d["longitude"]), parseFloat(d["latitude"])])[1];
        })
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
            });

        dots.attr("r", function (d){ return rScale(d[rColumn]); });
        dots.style("fill", function(d){
            var flag = filter(d);
            if(flag){
                return "rgba(250, 237, 40, 0.5)";
            }else{
                return "rgba(255, 0, 0, 0.5)";
            }
        });

        function filter(d){
            var placeFlag = false;
            var timeFlag = false;
            if(place!=null && place!="" && (d.place.toLowerCase().indexOf(place.toLowerCase()) != -1)){
                placeFlag = true;
            }
            d["time"] = new Date(d["time"]);
            if(start != "Invalid Date" && end != "Invalid Date") {
                if (d["time"] >= start && d["time"] <= end) {
                    timeFlag = true;
                }
            //    Fill end
            }else if(start =="Invalid Date" && end != "Invalid Date"){
                if (d["time"] <= end) {
                    timeFlag = true;
                }
            // Fill start
            }else if(start !="Invalid Date" && end == "Invalid Date"){
                if (d["time"] >= start) {
                    timeFlag = true;
                }
                //Not fill at all
            }else{
                timeFlag = true;
            }
            if(placeFlag && timeFlag){
                console.log("Yes! time: "+d["time"]+", place:"+ d.place);
                return true;
            }else{
                console.log("No! time: "+d["time"]+", place:"+ d.place);
                return false;
            }
        }

        function setProbeContent(d){

            var html = "Earthquake location: "+d["place"]
                +"</br>"+"Longitude: "+ d["longitude"]+"   "+"Latitude: "+ d["latitude"]+""
                +"</br>"+"Magnitude: "+ d["mag"]
                +"</br>"+"depth: "+ d["depth"]
                +"</br>"+"Time: "+ new Date(d["time"]);
            probe
                .html( html );
        }


        dots.exit().remove();
        createLegend();
    });

}

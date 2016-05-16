// load data from a csv file
d3.csv("csv/earthquake_usa.csv", function (data) {

    data.forEach(function(d) {
        d.dtg   = new Date(d["time"]);
        d.lat   = +d.latitude;
        d.long  = +d.longitude;
        d.mag   = d3.round(+d.mag,1);
        d.depth = d3.round(+d.depth,0);
    });

    var magnitudeChart = dc.barChart("#magnitude-chart");
    var depthChart = dc.barChart("#depth-chart");
    var timeChart = dc.lineChart("#time-chart");

    /****************************************
     * 	Run the data through crossfilter    *
     ****************************************/

    var facts = crossfilter(data);  // Gets our 'facts' into crossfilter

    /******************************************************
     * Create the Dimensions                               *
     * A dimension is something to group or filter by.     *
     * Crossfilter can filter by exact value, or by range. *
     ******************************************************/

    // for Magnitude                                                                                                                                                                                                                                                                                                                                                                                          
    var magValue = facts.dimension(function (d) {
        return d.mag;       // group or filter by magnitude
    });
    var magValueGroupSum = magValue.group()
        .reduceSum(function(d) { return d.mag; });	// sums the magnitudes per magnitude
    var magValueGroupCount = magValue.group()
        .reduceCount(function(d) { return d.mag; }) // counts the number of the facts by magnitude

    // for Depth
    var depthValue = facts.dimension(function (d) {
        return d.depth;
    });
    var depthValueGroup = depthValue.group();

    // define a daily volume Dimension
    var volumeByDay = facts.dimension(function(d) {
        return d3.time.hour(d.dtg);
    });
    // map/reduce to group sum
    var volumeByDayGroup = volumeByDay.group()
        .reduceCount(function(d) { return d.dtg; });

        // Magnitide Bar Graph Summed
    magnitudeChart.width(480)
        .height(150)
        .margins({top: 10, right: 10, bottom: 20, left: 40})
        .dimension(magValue)								// the values across the x axis
        .group(magValueGroupSum)							// the values on the y axis
        .transitionDuration(500)
        .centerBar(true)
        .gap(56)                                            // bar width Keep increasing to get right then back off.
        .x(d3.scale.linear().domain([0.5, 7.5]))
        .elasticY(true)
        .xAxis().tickFormat(function(v) {return v;});

    // Depth bar graph
    depthChart.width(480)
        .height(150)
        .margins({top: 10, right: 10, bottom: 20, left: 40})
        .dimension(depthValue)
        .group(depthValueGroup)
        .transitionDuration(500)
        .centerBar(true)
        .gap(1)                    // bar width Keep increasing to get right then back off.
        .x(d3.scale.linear().domain([0, 100]))
        .elasticY(true)
        .xAxis().tickFormat(function(v) {return v;});

    // time graph
    timeChart.width(960)
        .height(100)
        .margins({top: 10, right: 10, bottom: 20, left: 40})
        .dimension(volumeByDay)
        .group(volumeByDayGroup)
        .transitionDuration(500)
        .elasticY(true)
        .x(d3.time.scale().domain(d3.extent(data,function (d){ return new Date(d["time"]);}))) // scale and domain of the graph
        .xAxis();

    dc.renderAll();

});


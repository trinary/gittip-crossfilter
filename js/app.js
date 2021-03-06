var margin = { top: 10, left: 20, bottom: 30, right: 0};
var width = 960;
var height = 160;
var marginTransform = d3.svg.transform().translate([margin.left, margin.top])
var hero = d3.select("#hero").attr("transform",marginTransform);
hero.attr("width",width).attr("height",height);

d3.json("https://www.gittip.com/about/paydays.json",function(data) { 
  data = data.reverse();
  var cf = crossfilter(data);
  var all = cf.groupAll();
  var participants = cf.dimension(function(d) { return d.nparticipants} );
  var start = cf.dimension(function(d) {return d.ts_start} );

  var picker_x = d3.scale.ordinal()
    .domain(start.bottom(Infinity).map(function(d) { return d.ts_start; }))
    .rangeRoundBands([0,width])
  var picker_y = d3.scale.linear()
    .domain([0,d3.max(data, function(d) { return d.nparticipants})])
    .range([height,0])
  var picker = hero.append("g").classed("picker",true);
  var bars = picker.selectAll(".bars").data(data)
    .enter()
    .append("rect")
    .classed("bars",true)
    .attr("x",function(d,i) { return picker_x(d.ts_start); })
    .attr("y",function(d,i) { return picker_y(d.nparticipants); })
    .attr("width",picker_x.rangeBand())
    .attr("height", function(d,i) { return height - picker_y(d.nparticipants); })

    //let's get brushing!
  var brush = d3.svg.brush().x(picker_x)
      .on("brushstart", brushstart)
      .on("brush", brushmove)
      .on("brushend", brushend);

  hero.append("g")
    .attr("class", "brush")
    .call(brush)
    .selectAll("rect")
    .attr("height", height);


  function brushstart() {
    bars.classed("selecting", true);
  }

  function brushend() {
    bars.classed("selecting", false);
  }

  function brushmove() {
    var s = d3.event.target.extent();
    bars.classed("selected", function(d,i) { return s[0] < (x = picker_x(d.ts_start)) && x < s[1]; });
    var selected = document.getElementsByClassName("selected");
    var label="Inspecting " + selected.length + " weeks."
    document.getElementById("label").innerHTML=label;
    start.filterFunction(function(d) { return s[0] < picker_x(d) && picker_x(d) < s[1]});
    littleChart(start.top(Infinity),d3.select("#tippers"),function(d,i) { 
      return d.ntippers;
    });
    littleChart(start.top(Infinity),d3.select("#volume"),function(d,i) { 
      return d.transfer_volume;
    });
    littleChart(start.top(Infinity),d3.select("#ntransfers"), function(d,i) {
      return d.ntransfers;
    });
    littleChart(start.top(Infinity),d3.select("#chargevolume"), function(d,i) {
      return d.charge_volume;
    });
  }

  function littleChart(data, elem, accessor) {
    var svg = elem.select("svg");
    var g = svg.select("g");
    var height = 160;
    var width = 960;
    var margin = {top: 0, bottom: 20, left: 20, right:0};
    svg.attr("width", width);
    svg.attr("height", height);
    var accessed = data.map(accessor);
    var hist = d3.layout.histogram()
      .bins(10)
      (accessed);
    var xScale = d3.scale.ordinal()
      .domain(hist.map(function(d) { return d.x}))
      .rangeRoundBands([0,width - margin.left - margin.right], 0.2)
    var yScale = d3.scale.linear()
      .domain([0,d3.max(hist, function(d,i) { return d.y; })])
      .range([height - margin.top - margin.bottom, 0]);

    var xAxis = d3.svg.axis()
      .scale(xScale)
      .tickFormat(d3.format(".3r"))
      .orient("bottom");

    var bars = g.selectAll(".bars")
      .data(hist)
    bars.enter()
      .append("rect")
      .classed("bars", true)
    bars.transition()
      .attr("x", function(d,i) { return xScale(d.x); })
      .attr("y", function(d,i) { return height - yScale(d.y) - margin.bottom; })
      .attr("width", xScale.rangeBand)
      .attr("height", function(d,i) { return yScale(d.y);})
    bars.exit()
      .remove()
    g.select(".x.axis").remove()
    axis = g.append("g")
      .classed("x axis",true)
      .attr("transform",d3.svg.transform().translate([0,height - margin.bottom]))
      .transition()
      .call(xAxis);
  }
});

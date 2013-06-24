var margin = { top: 10, left: 20, bottom: 30, right: 0};
var width = 960;
var height = 160;
var marginTransform = d3.svg.transform().translate([margin.left, margin.top])
var hero = d3.select("#hero").attr("transform",marginTransform);
hero.attr("width",width).attr("height",height);

d3.json("data/paydays.json",function(data) { 
  var cf = crossfilter(data);
  var all = cf.groupAll();
  var participants = cf.dimension(function(d) { return d.nparticipants} );
  var start = cf.dimension(function(d) {return d.ts_start} );

  var picker_x = d3.scale.ordinal()
    .domain(start.top(Infinity).map(function(d) { return d.ts_start; }))
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
    console.log(start.top(Infinity));
    littleChart(start.top(Infinity),d3.select("#volume"),function(d,i) { 
      return d.transfer_volume;
    });
  }

  function littleChart(data, elem, accessor) {
    var svg = elem.select("svg");
    svg.selectAll("g").remove();
    var g = svg.append("g");
    var height = svg.attr("height");
    var width = svg.attr("width");
    var accessed = data.map(accessor);
    console.log(data, accessed);
    var hist = d3.layout.histogram()
        .bins(10)
        (accessed);
    var x_scale = d3.scale.linear()
        .domain(d3.extent(hist, function(d,i) { return d.x; }))
        .range([0,width]);
    var y_scale = d3.scale.linear()
        .domain([0,d3.max(hist, function(d,i) { return d.y; })])
        .range([height,0]);
    g.selectAll(".hist")
      .data(hist)
      .enter()
      .append("rect")
      .classed("hist", true)
      .attr("x", function(d,i) { console.log(d); return x_scale(d.x); })
      .attr("y", function(d,i) { return height - y_scale(d.y); })
      .attr("width", function(d,i) { return x_scale(d.dx); })
      .attr("height", function(d,i) { return y_scale(d.y);})
  }
});

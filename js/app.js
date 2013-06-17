var margin = { top: 0, left: 20, bottom: 30, right: 0};
var width = 960;
var marginTransform = d3.svg.transform().translate([margin.left, margin.top])
var svg = d3.select("#content").append("svg").attr("transform",marginTransform);

var xscale = 

d3.json("data/paydays.json",function(data) { 
  data.forEach(function(i) {
    i.ts_start = new Date(i.ts_start);
    i.ts_end = new Date(i.ts_end);
  });
  console.log(data);
  var cf = crossfilter(data);
  var all = cf.groupAll();
  var participants = cf.dimension(function(d) { return d.nparticipants} );
  var start = cf.dimension(function(d) {return d.ts_start} );

  var picker_x = d3.scale.ordinal()
    .domain(d3.range(data.length))
    .rangeRoundBands([0,width])
  var picker_y = d3.scale.linear()
    .domain([0,d3.max(data, function(d) { return d.nparticipants})])
    .range([160,0])
  console.log(picker_y.domain());
  var picker = svg.append("g").classed("picker",true);
  picker.selectAll(".bars").data(data)
    .enter()
    .append("rect")
    .classed("bars",true)
    .attr("x",function(d,i) { return picker_x(i); })
    .attr("y",function(d,i) { console.log(d.nparticipants);return picker_y(d.nparticipants); })
    .attr("width",picker_x.rangeBand())
    .attr("height", function(d,i) { return 160 - picker_y(d.nparticipants); })
});

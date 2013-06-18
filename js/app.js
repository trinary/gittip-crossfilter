var margin = { top: 10, left: 20, bottom: 30, right: 0};
var width = 960;
var height = 160;
var marginTransform = d3.svg.transform().translate([margin.left, margin.top])
var hero = d3.select("#hero").attr("transform",marginTransform);
hero.attr("width",width).attr("height",height);

d3.json("data/paydays.json",function(data) { 
  data.reverse(); // This is still backwards.
  data.forEach(function(i) {
    i.ts_start = new Date(i.ts_start);
    i.ts_end = new Date(i.ts_end);
  });
  var cf = crossfilter(data);
  var all = cf.groupAll();
  var participants = cf.dimension(function(d) { return d.nparticipants} );
  var start = cf.dimension(function(d) {return d.ts_start} );

  var picker_x = d3.scale.ordinal()
    .domain(d3.range(data.length))
    .rangeRoundBands([0,width])
  var picker_y = d3.scale.linear()
    .domain([0,d3.max(data, function(d) { return d.nparticipants})])
    .range([height,0])
  var picker = hero.append("g").classed("picker",true);
  var bars = picker.selectAll(".bars").data(data)
    .enter()
    .append("rect")
    .classed("bars",true)
    .attr("x",function(d,i) { return picker_x(i); })
    .attr("y",function(d,i) { return picker_y(d.nparticipants); })
    .attr("width",picker_x.rangeBand())
    .attr("height", function(d,i) { return height - picker_y(d.nparticipants); })

    //let's get brushing!
  hero.append("g")
    .attr("class", "brush")
    .call(d3.svg.brush().x(picker_x)
      .on("brushstart", brushstart)
      .on("brush", brushmove)
      .on("brushend", brushend))
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
    bars.classed("selected", function(d,i) { return s[0] <= (x = picker_x(i)) && x <= s[1]; });
    var selected = document.getElementsByClassName("selected");
    console.log(selected);
    var label="Inspecting " + selected.length + " weeks."
    document.getElementById("label").innerHTML=label;

  }
});

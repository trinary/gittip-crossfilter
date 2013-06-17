
var svg = d3.select("#content").append("svg");
d3.json("/data/paydays.json",function(data) { 
  var cf = crossfilter(data);
  all = cf.groupAll();
  console.log(all);
});

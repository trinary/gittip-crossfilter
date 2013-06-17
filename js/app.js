
var svg = d3.select("#content").append("svg");
d3.json("http://gittip.com/about/paydays.json",function(data) { 
  console.log(data);
});

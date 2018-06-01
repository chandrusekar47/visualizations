var dataMale = []
var dataFemale = []


var margin = {
  top: 30,
  right: 20,
  bottom: 70,
  left: 100
},
width = 850 - margin.left - margin.right,
height = 850 - margin.top - margin.bottom;

// setup x 
var xValue = function(d) {
  return Math.log(d.freq_birth);
    }, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) {
      return xScale(xValue(d));
    }, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// setup y
var yValue = function(d) {
  return Math.log(d.freq_death);
    }, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) {
      return yScale(yValue(d));
    }, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

// var tip = d3.tip().attr("class", "d3-tip").offset([-10, 0])
//              .html(function(d) {
//            return d.BLocLabel + "<br>" + "Births: " + d.freq_birth            
//            + "<br>" + "Deaths: " + d.freq_death;
//          }); 

var chart1 = d3.select("body")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var chart2 = d3.select("body")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


d3.json("fb_gender_birth_death_counts.json", function(data) {

    // console.log(data);

    dataMale = data.filter(function(d) {
      return d.Gender == "Male";
    });

    dataFemale = data.filter(function(d) {
      return d.Gender == "Female";
    });

    // console.log(dataMale);
    // console.log(dataFemale);


    data2 = dataMale; //// change from male to female here


    xScale.domain([d3.min(data2, xValue) - 1 / 2, d3.max(data2, xValue) + 1 / 2]);
    yScale.domain([d3.min(data2, yValue) - 1 / 2, d3.max(data2, yValue) + 1 / 2]);


    // x-axis
    chart1.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .attr("fill", "blue")
    .style("font-size", "17px")
    .text("Male Birth Sources");

    // y-axis
    chart1.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "translate(" + 200 + "," + 10 + ")")
    .attr("class", "label")
    .attr("y", 6)
    .attr("dy", ".71em")
    .attr("fill", "red")
    .style("text-anchor", "end")
    .style("font-size", "17px")
    .text("Male Death Attractors");

    // chart1.call(tip);

    // draw dots
    chart1.selectAll(".dot")
    .data(data2)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 3)
    .attr("cx", xMap)
    .attr("cy", yMap)
    .style("fill", function(d) {
      if (d.freq_birth > d.freq_death) {
        return "blue";
      } else if (d.freq_birth < d.freq_death) {
        return "red"
      } else {
        return "gray";
      }
    })
        // .on("mouseover", tip.show)
        // .on("mouseout", tip.hide);


    // x-axis
    var text = "10";
    chart1.append("text")
    .attr("transform",
      "translate(" + (width / 2) + " ," + (height + 50) + ")")
    .style("text-anchor", "middle")
    .style("font-size", "17px")
    .text("log10 scale of the # of Births");

    // y-axis
    chart1.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 40 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "17px")
    .text("log10 scale of the # of Deaths");

    // -------------------------------------------------------------
    // Second graph

    data2 = dataFemale;

    // x-axis
    chart2.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .attr("fill", "blue")
    .style("font-size", "16px")
    .text("Female Birth Sources");

    // y-axis
    chart2.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "translate(" + 205 + "," + 10 + ")")
    .attr("class", "label")
    .attr("y", 6)
    .attr("dy", ".71em")
    .attr("fill", "red")
    .style("text-anchor", "end")
    .style("font-size", "16px")
    .text("Female Death Attractors");

    // chart2.call(tip);

    // draw dots
    chart2.selectAll(".dot")
    .data(data2)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 3)
    .attr("cx", xMap)
    .attr("cy", yMap)
    .style("fill", function(d) {
      if (d.freq_birth > d.freq_death) {
        return "blue";
      } else if (d.freq_birth < d.freq_death) {
        return "red"
      } else {
        return "gray";
      }
    })
        // .on("mouseover", tip.show)
        // .on("mouseout", tip.hide);


    // x-axis
    var text = "10";
    chart2.append("text")
    .attr("transform",
      "translate(" + (width / 2) + " ," + (height + 50) + ")")
    .style("text-anchor", "middle")
    .style("font-size", "17px")
    .text("log10 scale of the # of Births");

    // y-axis
    chart2.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 40 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "17px")
    .text("log10 scale of the # of Deaths");
    setup_click_handlers()
  });

var outlier_points = []
var outlier_tips = []

function setup_click_handlers() {
  d3.selectAll("circle.dot").on("click", function() {
    var index_of_point = outlier_points.indexOf(this)
    if (index_of_point >= 0) {
      var point = outlier_points.splice(index_of_point, 1)[0]
      var tip = outlier_tips.splice(index_of_point, 1)[0]
      tip.hide(point)
      d3.select(this).classed("outlier", false)
    } else {
      var tip = d3.tip().attr("class", "d3-tip").offset([-10, 0])
      .html(function(d) {
        return d.BLocLabel + "<br>" + "Births: " + d.freq_birth +
        "<br>" + "Deaths: " + d.freq_death;
      });
      tip(d3.select(this))
      outlier_points.push(this)
      outlier_tips.push(tip)
      d3.select(this).classed("outlier", true)
      if ($("#highlight-outliers").prop("checked")) {
        tip.show(this.__data__, this)
      }
    }
  })
}
$("#highlight-outliers").change(function() {
  if (this.checked) {
    outlier_tips.forEach(function(otip, index) {
      otip.show(outlier_points[index].__data__, outlier_points[index])
    })
  } else {
    outlier_tips.forEach(function(otip, index) {
      otip.hide(outlier_points[index])
    })
  }
})
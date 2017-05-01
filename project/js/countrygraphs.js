window.CountryGraphs = (() => {
	var readyStateDeferred = $.Deferred();
	var yearValues = []
	var graph_width = 600
	var graph_height = 400
	var margins = {left: 100,right: 10,top: 50,bottom: 100}
	function create_chart (parent, width, height, margins, title, xlab, ylab) {
		var chart = d3.select(parent)
			.append("svg")
				.attr("width", width + margins.left+ margins.right)
				.attr("height", height + margins.top+ margins.bottom)
			.append("g")
				.attr("class", "grid-area")
				.attr("transform", "translate("+margins.left+", "+margins.top+")")
		chart.append('text')
				.attr("x", width/3.5)
				.attr("y", 0)
				.attr("class", "title")
				.style("text-anchor", "start")
				.text(title)
		chart.append("text")
				.attr("transform", "translate("+(width/2)+", " + (height + margins.bottom/2) + ")")
				.attr("class", "label x-axis")
				.style("text-anchor", "middle")
				.text(xlab)
		chart.append("text")
				.attr("transform", "rotate(-90)")
				.attr("class", "label y-axis")
				.attr("x", -height/2)
				.attr("y", -margins.left/1.5)
				.style("text-anchor", "middle")
				.text(ylab)
		return chart
	}

	function setup_year_x_axis(chart) {
		var scale = d3.scalePoint().domain(yearValues).range([5, graph_width-5])
		var axis = d3.axisBottom(scale).tickValues(_.filter(yearValues, (x) => x%5 == 0))
		var mapper = (item) => scale(item.year)
		chart._xaxis = {axis, scale, mapper}
		chart.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(0, " + graph_height + ")")
			.call(axis)
	}

	function setup_yaxis(chart, property_name) {
		var scale = d3.scaleLinear().range([graph_height, 0])
		var axis = d3.axisLeft(scale).tickFormat((x) => x < 0 ? "": x)
		var mapper = (item) => scale(item[property_name])
		chart._yaxis = {axis, scale, mapper, property_name}
		chart.append("g")
			.attr("class", "y-axis")
	}

	function setup_xaxis(chart, property_name) {
		var scale = d3.scaleLinear().range([0, graph_width])
		var axis = d3.axisBottom(scale).tickFormat((x) => x < 0 ? "": (x%1 > 0? "" : x))
		var mapper = (item) => scale(item[property_name])
		chart._xaxis = {axis, scale, mapper, property_name}
		chart.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(0, " + graph_height + ")")
	}

	function setup_nominal_y_axis (chart, property_name) {
		var scale = d3.scaleLinear().range([0, graph_height])
		var axis = d3.axisLeft(scale)
		chart._yaxis = {axis, scale, property_name}
		chart.append("g")
			.attr("class", "y-axis")
	}

	function update_nominal_graph(chart, country, year) {
		var year_data = chart._data[year] || {}
		var country_data = year_data[country] || []
		var [min_val, max_val] = d3.extent(country_data, (x) => x[chart._xaxis.property_name])
		var range = max_val - min_val
		chart._xaxis
			.scale
			.domain([ Math.max(min_val-10*Math.abs(range)/100.0, 0) , max_val + 10*Math.abs(range)/100.0])
		chart.selectAll(".x-axis")
				.transition()
				.duration(500)
				.ease(d3.easeCircleInOut)
				.call(chart._xaxis.axis);
		var unique_values = _.map(country_data, (x) => x[chart._yaxis.property_name])
		chart._yaxis
			.scale
			.domain([-2, unique_values.length])
		chart._yaxis
			.axis
			.tickValues(_.map(unique_values, (x) => unique_values.indexOf(x)))
			.tickFormat((x, i) => unique_values[i])
		chart.selectAll(".y-axis")
				.transition()
				.duration(500)
				.ease(d3.easeCircleInOut)
				.call(chart._yaxis.axis);

		var bar_height = 20;
		var bar_groups = chart.selectAll("g.bar-group")
			.data(country_data, (x) => x[chart._yaxis.property_name])
		bar_groups
			.attr("transform", (x, i) => "translate(0, " + chart._yaxis.scale(i) + ")" )
		bar_groups
			.select("rect.bar")
			.attr("width", (x) => chart._xaxis.scale(x[chart._xaxis.property_name]))
		var new_bars = bar_groups.enter()
			.append("g")
			.attr("class", "bar-group")
			.attr("transform", (x, i) => "translate(0, " + (chart._yaxis.scale(i) - bar_height/2 ) + ")" )
		new_bars
			.append("rect")
			.attr("class", "bar")
			.attr("width", (x) => chart._xaxis.scale(x[chart._xaxis.property_name]))
			.attr("x", 0)
			.attr("y", 0)
			.append("svg:title").text((x) => x[chart._yaxis.property_name])
		bar_groups.exit().remove()
	}

	function draw_trend_graph(chart, country_name, year) {
		var country_data = chart._data[country_name] || []
		var [min_val, max_val] = d3.extent(country_data, (x) => x[chart._yaxis.property_name])
		var range = max_val - min_val
		chart._yaxis
			.scale
			.domain([ min_val - 10*Math.abs(range)/100.0, max_val + 30*Math.abs(range)/100.0])
		chart.selectAll(".y-axis")
				.transition()
				.duration(500)
				.ease(d3.easeCircleInOut)
				.call(chart._yaxis.axis);
		var point_to_point_link_generator =  d3.line().x(chart._xaxis.mapper).y(chart._yaxis.mapper)
		var link = chart
			.selectAll(".links")
			.data([country_data], (x) => country_name)
		link.attr("d", (d) => point_to_point_link_generator(d))
		link.enter()
			.append("path")
			.attr("class","links")
			.attr("d", (d) => point_to_point_link_generator(d))
		var points = chart
			.selectAll("circle.point")
			.data(country_data, (x) => x["year"])
		points.transition()
			.duration(300)
			.attr("class", (x) => "point " + (x["year"] == year ? "active" : ""))
			.attr("cx", chart._xaxis.mapper)
			.attr("cy", chart._yaxis.mapper)
		points
			.enter()
			.append("circle")
			.attr("class", (x) => "point " + (x["year"] == year ? "active" : ""))
			.attr("cx", chart._xaxis.mapper)
			.attr("cy", chart._yaxis.mapper)
		points.exit().remove()
	}

	function fetchData() {
		$.when($.get('data/attacks_year_location.json'), 
			$.get("data/country_year_stats.json"), 
			$.get("data/org_country_year_stats.json"), 
			$.get("data/country_year_attacktype.json")).done(function (response1, response2, response3, response4) {
			var dataByYear = _.groupBy(response1[0], "year")
			yearValues = _.keys(dataByYear)
			countryTrendGraph._data = _.groupBy(response2[0], "country")
			countryFoiledTrendGraph._data = countryTrendGraph._data
			countryKillTrendGraph._data = countryTrendGraph._data
			countryDamageTrendGraph._data = countryTrendGraph._data
			var groupedByYear = _.groupBy(response3[0], "year")
			orgCountryYearGraph._data = {}
			_.forEach(groupedByYear, (values, year) => {
				var groupedByCountry = _.groupBy(values, "country")
				orgCountryYearGraph._data[year] = {}
				_.forEach(groupedByCountry, (values, country_name) => {
					var arr = _.sortBy(_.filter(values, (x) => x.org_name !== "Unknown"), ["no_attacks"])
					orgCountryYearGraph._data[year][country_name] = arr.slice(Math.max(arr.length - 5, 0))
				})
			})
			var groupedByYear = _.groupBy(response4[0], "year")
			countryYearTypeGraph._data = {}
			_.forEach(groupedByYear, (values, year) => {
				var groupedByCountry = _.groupBy(values, "country")
				countryYearTypeGraph._data[year] = {}
				_.forEach(groupedByCountry, (values, country_name) => {
					countryYearTypeGraph._data[year][country_name] = _.sortBy(_.filter(values, (x) => x.attack_type !== "Unknown"), ["no_attacks"]);
				})
			})
			setup_year_x_axis(countryTrendGraph)
			setup_year_x_axis(countryFoiledTrendGraph)
			setup_year_x_axis(countryKillTrendGraph)
			setup_year_x_axis(countryDamageTrendGraph)
			readyStateDeferred.resolve(dataByYear)
		})
	}
	var graph_parents = [document.createElement("div"),document.createElement("div"),document.createElement("div"),document.createElement("div"),document.createElement("div"),document.createElement("div"),document.createElement("div")]
	var countryTrendGraph = create_chart(graph_parents[0], graph_width, graph_height, margins, "Number of attacks from 1970-2015", "Year", "Number of attacks");
	var countryFoiledTrendGraph = create_chart(graph_parents[1], graph_width, graph_height, margins, "Number of prevented attacks from 1970-2015", "Year", "Number of prevented attacks");
	var countryKillTrendGraph = create_chart(graph_parents[2], graph_width, graph_height, margins, "Number of people killed from 1970-2015", "Year", "Number of people killed");
	var countryDamageTrendGraph = create_chart(graph_parents[3], graph_width, graph_height, margins, "Property damage from 1970-2015", "Year", "Property damage value in USD");
	margins.left = 200
	margins.right = 100
	var orgCountryYearGraph = create_chart(graph_parents[4], graph_width - margins.left - margins.right, graph_height, margins, "Terrorist organizations vs Number of attacks", "Number of attacks");
	var countryYearTypeGraph = create_chart(graph_parents[5], graph_width - margins.left - margins.right, graph_height, margins, "Types of terrorist attack", "Number of attacks");

	setup_yaxis(countryTrendGraph, "no_attacks")
	setup_yaxis(countryFoiledTrendGraph, "no_foiled_attacks")
	setup_yaxis(countryKillTrendGraph, "no_kills")
	setup_yaxis(countryDamageTrendGraph, "propval")
	setup_xaxis(orgCountryYearGraph, "no_attacks")
	setup_xaxis(countryYearTypeGraph, "no_attacks")
	setup_nominal_y_axis(orgCountryYearGraph, "org_name")
	setup_nominal_y_axis(countryYearTypeGraph, "attack_type")

	return {
		setup: function (container) {
			_.each(graph_parents, function (e) { container.append(e)})
			fetchData()
		},
		getCountryYearAttacks: function () {
			return readyStateDeferred.promise()
		},
		updateGraphs: function (country, year) {
			draw_trend_graph(countryTrendGraph, country, year)
			draw_trend_graph(countryFoiledTrendGraph, country, year)
			draw_trend_graph(countryKillTrendGraph, country, year)
			draw_trend_graph(countryDamageTrendGraph, country, year)
			update_nominal_graph(orgCountryYearGraph, country, year)
			update_nominal_graph(countryYearTypeGraph, country, year)
		}
	};
})();
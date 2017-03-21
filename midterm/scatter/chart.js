window.Chart = (() => {
	return function(all_data, attr, width, height, margins) {
		this.margins = margins || {top: 50, right: 30, bottom: 100, left: 120};
		this.graph_width = width || 1280
		this.graph_height = height || 800
		this.data = all_data
		this.continent_names = uniq(pluck("continent", all_data)).sort();
		this.all_years = uniq(pluck("century", all_data)).sort();
		this.last_anim_timeout_id = 0
		this.grouped_by_continent = group_by_continent_sort_by_year(all_data)
		this.grouped_by_year = group_by("century", all_data)
		this.min_year_val = d3.min(this.all_years)
		this.min_year_data = this.grouped_by_year.get(this.min_year_val)
		this.chart = create_chart(this.graph_width, this.graph_height, this.margins)
		this.attr = attr
		this.y_axis_prop = attr.property_name
		this.zero_line_endpoints = {start: point(0,0), end: point(0,0)}
		this.setup_xaxis(200, 20)
		this.setup_yaxis()
		this.setup_data_points()
		this.setup_continents()
	}
})()

Chart.prototype = {
	sorted_min_year_data: function () {
		return this.min_year_data.sort((x,y) => y[this.y_axis_prop] - x[this.y_axis_prop])
	},
	change_continent_state: (chart, team_id, activate) => { 
		chart.chart.selectAll("."+team_id).classed("active", activate)
		clearTimeout(this.last_anim_timeout_id)
		this.last_anim_timeout_id = window.setTimeout(() => {
			d3.selectAll("."+team_id).moveToFront()
			d3.selectAll("circle.point."+team_id).moveToFront()
		}, 300)
		if (!activate) chart.activate_winners()
	},
	setup_xaxis: function(left_padding, right_padding) {
		var scale = d3.scalePoint().domain(this.all_years).range([left_padding, this.graph_width-right_padding])
		var axis = d3.axisBottom(scale)
		var mapper = (item) => scale(item.century)
		this.xaxis = {axis, scale, mapper}
		this.chart.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(0, " + this.graph_height+ ")")
			.call(axis)
		this.chart
			.selectAll(".label.x-axis")
			.text("Century")
	},
	setup_yaxis: function() {
		var scale = d3.scaleLinear().range([this.graph_height, 0])
		var axis = d3.axisLeft(scale)
		var mapper = (item) => scale(item[this.y_axis_prop])
		this.yaxis = {axis, scale, mapper}
		this.chart
			.append("g")
			.attr("class", "y-axis")
			.call(axis)
	},
	setup_data_points: function () {
		var obj = this
		this.chart
			.selectAll("circle.point")
			.data(this.data, (x) => x["continent"] + "_" + x["century"])
			.enter()
			.append("circle")
				.on("mouseover", function({continent}) { 
					obj.change_continent_state(obj, continent, true) 
				})
				.on("mouseout", function({continent}) { 
					obj.change_continent_state(obj, continent, false) 
				})
				.attr("class", "point")
		this.chart
			.selectAll(".links")
			.data(this.grouped_by_continent.values())
			.enter()
			.append("path")
				.attr("class", ([{continent}, ]) => continent + " links")
				.on("mouseover", function ([{continent}, ]) { obj.change_continent_state(obj, continent, true) })
				.on("mouseout", function ([{continent}, ]) { obj.change_continent_state(obj, continent, false) })
	},
	setup_continents: function () {
		var that = this
		this.continent_locations = this.continent_names.map((continent) => { return {continent: continent, location: point(0,0), first_point_location: point(0,0) }})
		this.chart
			.selectAll("text.continent-name")
			.data(this.continent_locations)
			.enter()
			.append("text")
				.attr("class", ({continent}) => continent + " continent-name")
				.attr("y", ({location}) => location.y)
				.attr("x", ({location}) => location.x)
				.text(({continent}) => continent)
				.on("mouseover", function (continent) { that.change_continent_state(that, continent, true) })
				.on("mouseout", function (continent) { that.change_continent_state(that, continent, false) })
		var continent_name_first_point_link_generator =  d3.line().x((d) => d.x).y((d) => d.y)
		this.chart
			.selectAll("path.first-link")
			.data(this.continent_locations)
			.enter()
			.append("path")
				.attr("d", ({location, first_point_location}) => continent_name_first_point_link_generator([location, first_point_location]))
				.attr("class", ({continent}) => continent + " first-link")
	},
	rescale_yaxis: function (top_padding=20, bottom_padding=20) {
		var y_axis_prop = this.y_axis_prop
		var attr = this.attr
		var accessor_func = (d) => d[y_axis_prop]
		var [min_val, max_val] = d3.extent(this.data, accessor_func)
		var range = max_val - min_val
		this.yaxis
			.scale
			.domain([ min_val - bottom_padding*Math.abs(range)/100.0, max_val + top_padding*max_val/100.0])
		this.chart.selectAll(".y-axis")
				.transition()
				.duration(1500)
				.ease(d3.easeCircleInOut)
				.call(this.yaxis.axis.tickFormat(attr.formatter));
	},
	update_data_points: function () {
		var obj = this
		var point_to_point_link_generator =  d3.line().x(this.xaxis.mapper).y(this.yaxis.mapper)
		this.chart
			.selectAll(".links")
			.data(this.grouped_by_continent.values(), (x) => x[0]["continent"])
			.attr("class", ([{continent}, ]) => continent + " links")
			.attr("d", (d) => point_to_point_link_generator(d))
		this.chart
			.selectAll("circle.point")
			.data(this.data, (x) => x["continent"] + "_" + x["century"])
			.transition()
			.duration(300)
			.attr("class", ({continent}) => continent + " point")
			.attr("cx", this.xaxis.mapper)
			.attr("cy", this.yaxis.mapper)
	},
	update_title: function (title) {
		this.chart.select(".title")
			.text(this.attr.title)
	},
	update_ylab: function (ylab) {
		this.chart.select(".y-axis.label")
			.text(this.attr.ylab)
	},
	update_yunitlab: function (yunit) {
		this.chart.select(".y-axis.unit")
			.text(this.attr.unit)
	},
	update_continents: function () {
		var that = this
		var continent_names = this.continent_names
		var ordered_first_column_data = this.sorted_min_year_data()
		var number_of_continents = continent_names.length
		var continent_right_padding = 50
		var continent_height = 25
		var locations_of_continent = {}
		continent_names.forEach((continent, i) => {
			locations_of_continent[continent] = point(that.xaxis.scale(that.min_year_val) - continent_right_padding, that.graph_height/2 + (i-number_of_continents/2)*continent_height)
		})
		var first_column_points = {}
		ordered_first_column_data.forEach((d) => {
			first_column_points[d.id] = point(that.xaxis.scale(d.century), that.yaxis.scale(d[that.y_axis_prop]))
		})
		var continent_name_first_point_link_generator =  d3.line().x((d) => d.x).y((d) => d.y)
		this.continent_locations.forEach((d) => {
			d.location = locations_of_continent[d.continent]
			d.first_point_location = first_column_points[d.continent]
		})

		this.chart
			.selectAll("text.continent-name")
			.data(this.continent_locations)
			.attr("class", ({continent}) => continent + " continent-name")
			.attr("y", ({location}) => location.y)
			.attr("x", ({location}) => location.x)
			.text(({continent}) => continent)

		this.chart.selectAll("path.first-link")
			.data(this.continent_locations)
			.attr("d", ({location, first_point_location}) => continent_name_first_point_link_generator([location, first_point_location]))
			.attr("class", ({continent}) => continent + " first-link")
	},
	render: function (attr) {
		this.y_axis_prop = attr.property_name
		this.attr = attr
		this.rescale_yaxis()
		this.update_title()
		this.update_ylab()
		this.update_yunitlab()
		this.update_data_points()
		this.update_continents()
	}
}

window.Chart.create = function (data, attr) {
	return new Chart(data, attr)
}
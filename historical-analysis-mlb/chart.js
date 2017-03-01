window.Chart = (() => {
	return function(all_data, width, height, margins) {
		this.margins = margins || {top: 20, right: 30, bottom: 80, left: 80};
		this.graph_width = width || 1280
		this.graph_height = height || 800
		this.data = all_data
		this.all_years = uniq(pluck("year", all_data)).sort();
		this.last_anim_timeout_id = 0
		this.grouped_by_team = group_by_team_sort_by_year(all_data)
		this.grouped_by_year = group_by("year", all_data)
		this.min_year_val = d3.min(this.all_years)
		this.min_year_data = this.grouped_by_year.get(this.min_year_val)
		this.chart = create_chart(this.graph_width, this.graph_height, this.margins)
		this.setup_xaxis(200, 20)
		this.setup_yaxis()
		this.setup_data_points()
		this.setup_team_names()
		this.setup_team_ids()
	}
})()

Chart.prototype = {
	sorted_min_year_data: function () {
		return this.min_year_data.sort((x,y) => y[this.y_axis_prop] - x[this.y_axis_prop])
	},
	change_team_state: (chart, team_id, activate) => { 
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
		var mapper = (item) => scale(item.year)
		this.xaxis = {axis, scale, mapper}
		this.chart.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(0, " + this.graph_height+ ")")
			.call(axis)
	},
	setup_yaxis: function() {
		var scale = d3.scaleLinear().range([this.graph_height, 0])
		var axis = d3.axisLeft(scale)
		var mapper = (item) => scale(item[this.y_axis_prop])
		this.yaxis = {axis, scale, mapper}
		this.chart.append("g")
			.attr("class", "y-axis")
	},
	setup_data_points: function () {
		var obj = this
		this.chart
			.selectAll("circle")
			.data(this.data)
			.enter()
			.append("circle")
				.on("mouseover", function({id:team_id}) { 
					obj.change_team_state(obj, team_id, true) 
				})
				.on("mouseout", function({id:team_id}) { 
					obj.change_team_state(obj, team_id, false) 
				})
		this.chart
			.selectAll(".links")
			.data(this.grouped_by_team.values())
			.enter()
			.append("path")
				.attr("class", ([{id:team_id}, ]) => team_id + " links")
				.on("mouseover", function ([{id:team_id}, ]) { obj.change_team_state(obj, team_id, true) })
				.on("mouseout", function ([{id:team_id}, ]) { obj.change_team_state(obj, team_id, false) })
	},
	setup_team_names: function () {
		this.chart.selectAll("text.team-name")
			.data(this.sorted_min_year_data())
			.enter()
			.append("text")
				.attr("class", ({team_id}) => team_id + " team-name")
				.attr("x", this.graph_width/2)
				.attr("y", this.margins.top*3)
				.text(({team_name}) => team_name)
	},
	setup_team_ids: function () {
		var that = this
		this.team_id_labels = this.grouped_by_team.keys().map((team_id) => { return {team_id: team_id, location: point(0,0), first_point_location: point(0,0) }})
		this.chart
			.selectAll("text.team-id")
			.data(this.team_id_labels)
			.enter()
			.append("text")
				.attr("class", ({team_id}) => team_id + " team-id")
				.attr("y", ({location}) => location.x)
				.attr("x", ({location}) => location.y)
				.text(({team_id}) => team_id)
				.on("mouseover", function ({team_id}) { that.change_team_state(that, team_id, true) })
				.on("mouseout", function ({team_id}) { that.change_team_state(that, team_id, false) })
		var team_id_first_point_link_generator =  d3.line().x((d) => d.x).y((d) => d.y)
		this.chart
			.selectAll("path.first-link")
			.data(this.team_id_labels)
			.enter()
			.append("path")
				.attr("d", ({location, first_point_location}) => team_id_first_point_link_generator([location, first_point_location]))
				.attr("class", ({team_id}) => team_id + " first-link")
	},
	activate_winners: function () { 
		d3.selectAll(".ws-winner")
		.moveToFront() 
	},
	rescale_yaxis: function (top_padding=20, bottom_padding=20) {
		var accessor_func = (d) => d[this.y_axis_prop]
		var [min_val, max_val] = d3.extent(this.data, accessor_func)
		this.yaxis
			.scale
			.domain([ min_val - bottom_padding*min_val/100.0, max_val + top_padding*max_val/100.0])
			.range([this.graph_height, 0])
		this.chart.select(".y-axis")
				.transition()
				.duration(1500)
				.ease(d3.easeSinInOut)
				.call(this.yaxis.axis);
	},
	update_data_points: function () {
		var obj = this
		var point_to_point_link_generator =  d3.line().x(this.xaxis.mapper).y(this.yaxis.mapper)
		this.chart
			.selectAll(".links")
			.data(this.grouped_by_team.values())
			.attr("class", ([{id:team_id}, ]) => team_id + " links")
			.attr("d", (d) => point_to_point_link_generator(d))
			.call(this.activate_winners)
		this.chart
			.selectAll("circle")
			.data(this.data)
			.transition()
			.duration(300)
			.attr("class", (d) => d.id + " point" + (d.is_world_series_winner === 'Y' ? " ws-winner": ""))
			.attr("cx", this.xaxis.mapper)
			.attr("cy", this.yaxis.mapper)
			.call(this.activate_winners)
	},
	update_title: function (title) {
		this.chart.select(".title")
			.text(title)
	},
	update_ylab: function (ylab) {
		this.chart.select(".y-axis.label")
			.text(ylab)
	},
	update_yunitlab: function (yunit) {
		this.chart.select(".y-axis.unit")
			.text(yunit)
	},
	update_team_ids: function () {
		var that = this
		var ordered_min_year_data = this.sorted_min_year_data()
		var number_of_teams = ordered_min_year_data.length
		var team_id_right_padding = 50
		var team_id_height = 25
		var locations_of_team_ids = {}
		ordered_min_year_data.forEach((d, i) => {
			locations_of_team_ids[d.id] = point(that.xaxis.scale(that.min_year_val) - team_id_right_padding, that.graph_height/2 + (i-number_of_teams/2)*team_id_height)
		})
		var first_column_points = {}
		ordered_min_year_data.forEach((d) => {
			first_column_points[d.id] = point(that.xaxis.scale(d.year), that.yaxis.scale(d[that.y_axis_prop]))
		})
		var team_id_first_point_link_generator =  d3.line().x((d) => d.x).y((d) => d.y)
		this.team_id_labels.forEach((d) => {
			d.location = locations_of_team_ids[d.team_id]
			d.first_point_location = first_column_points[d.team_id]
		})

		this.chart.selectAll("text.team-id")
			.data(this.team_id_labels)
			.attr("class", ({team_id}) => team_id + " team-id")
			.attr("y", ({location}) => location.y)
			.attr("x", ({location}) => location.x)
			.text(({team_id}) => team_id)

		this.chart.selectAll("path.first-link")
			.data(this.team_id_labels)
			.attr("d", ({location, first_point_location}) => team_id_first_point_link_generator([location, first_point_location]))
			.attr("class", ({team_id}) => team_id + " first-link")
	},
	render: function (attr) {
		this.y_axis_prop = attr.property_name
		this.rescale_yaxis()
		this.update_title(attr.title)
		this.update_ylab(attr.ylab)
		// this.update_yunitlab(attr.unit)
		this.update_data_points()
		this.update_team_ids()
	}
}

window.Chart.create = function (data) {
	return new Chart(data)
}
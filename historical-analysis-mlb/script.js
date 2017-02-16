$(function () {
	d3.selection.prototype.moveToFront = function() {
		return this.each(function(){
			this.parentNode.appendChild(this);
		});
	};

	var all_data;
	function fetch_data() {
		return $.get("/summary.json")
			.done(function (data) {
				window.all_data = all_data = data
			})
	}
	function uniq(argument) {
		return d3.set(argument).values()
	}
	function pluck(prop_name, array) {
		return array.map(function (item) {return item[prop_name]})
	}
	function group_by(prop_name, array) {
		return d3.nest().key((d) => d[prop_name]).map(array)
	}
	function create_chart(width, height, margins) {
		return d3.select("body")
			.append("svg")
				.attr("width", width + margins.left+ margins.right)
				.attr("height", height + margins.top+ margins.bottom)
				.attr("class", "graph")
			.append("g")
				.attr("class", "grid-area")
				.attr("transform", "translate("+margins.left+", "+margins.top+")")
	}
	function generate_xaxis(all_data, graph_width, left_padding, right_padding) {
		var all_years = uniq(pluck("year", all_data)).sort()
		var scale = d3.scalePoint().domain(all_years).range([left_padding, graph_width-right_padding])
		var axis = d3.axisBottom(scale)
		return {axis, scale}
	}
	function generate_yaxis(all_data, prop_name, graph_height, top_padding=10, bottom_padding=10) {
		var accessor_func = (d) => d[prop_name]
		var min_val = d3.min(all_data, accessor_func)
		var max_val = d3.max(all_data, accessor_func)
		var scale = d3.scaleLinear().domain([ min_val - bottom_padding*min_val/100.0, max_val + top_padding*max_val/100.0]).range([graph_height, 0])
		var axis = d3.axisLeft(scale)
		return {axis, scale}
	}
	function group_by_team_sort_by_year (all_data) {
		var grouped_by_team = group_by("id", all_data)
		grouped_by_team.values().forEach((vals) => vals.sort((x,y) => x.year - y.year))
		return grouped_by_team
	}
	function values(map) {
		var values = []
		for (var prop in map) {
			if (map.hasOwnProperty(prop)) {
				values.push(map[prop])
			}
		}
		return values;
	}
	function xlab(chart, label, height, width, margins) {
		chart.append("text")
			.attr("transform", "translate("+(width/2)+", " + (height + margins.top) + ")")
			.attr("class", "label")
			.style("text-anchor", "middle")
			.text(label)
	}
	function axis_labels(chart, xlab, ylab, height, width, margins) {
		chart.append("text")
			.attr("transform", "translate("+(width/2)+", " + (height + margins.bottom/2) + ")")
			.attr("class", "label")
			.style("text-anchor", "middle")
			.text(xlab)
		chart.append("text")
			.attr("transform", "rotate(-90)")
			.attr("class", "label")
			.attr("x", -graph_height/2)
			.attr("y", -margins.left/2)
			.style("text-anchor", "middle")
			.text(ylab)
	}
	function chart_title(chart, title, width, margins) {
		chart.append('text')
			.attr("x", width/2)
			.attr("y", margins.top)
			.attr("class", "title")
			.text(title)
			.style("text-anchor", "middle")
	}
	function throttle(event_handler, delay) {
		var timeout_id = 0;
		return (...args) => {
			clearTimeout(timeout_id)
			timeout_id = setTimeout(() => event_handler.apply(window, args), delay)
		}
	}

	var margins = {top: 20, right: 30, bottom: 80, left: 80}
	var graph_width = 1440
	var graph_height = 1024
	fetch_data().then(function () {	
		var y_axis_prop = "wins";
		var grouped_by_team = group_by_team_sort_by_year(all_data)
		var grouped_by_year = group_by("year", all_data)
		var chart = create_chart(graph_width, graph_height, margins)
		var {scale:x_axis_scale, axis:x_axis} = generate_xaxis(all_data, graph_width, 200, 20)
		var {scale:y_axis_scale, axis:y_axis} = generate_yaxis(all_data, y_axis_prop, graph_height)
		var x_axis_value_mapper = (item) => x_axis_scale(item.year)
		var y_axis_value_mapper = (item) => y_axis_scale(item[y_axis_prop])
		var activate_winners = () => d3.selectAll(".ws-winner").moveToFront()
		var last_anim_timeout_id = 0;
		var change_team_state = (team_id, activate) => { 
			d3.selectAll("."+team_id).classed("active", activate)
			clearTimeout(last_anim_timeout_id)
			last_anim_timeout_id = window.setTimeout(() => {
				d3.selectAll("."+team_id).moveToFront()
				d3.selectAll("circle.point."+team_id).moveToFront()
			}, 300)
			if (!activate) activate_winners()
		};
		var min_year_val = d3.min(pluck("year", all_data));
		var min_year_data_grouped_by_id = group_by("id", grouped_by_year.get(min_year_val))
		var first_column_data_ordered = min_year_data_grouped_by_id.values().map((d) => d[0]).sort((x,y) => y[y_axis_prop] - x[y_axis_prop])
		var team_ids = first_column_data_ordered.map((d) => d["id"])
		var team_names = first_column_data_ordered.map((d) => d["name"])
		var number_of_teams = team_ids.length
		var team_id_right_padding = 50
		var team_id_height = 25
		var locations_of_team_ids = team_ids.map((d, i) => {return {"x": x_axis_scale(min_year_val) - team_id_right_padding, "y": graph_height/2 + (i-number_of_teams/2)*team_id_height }})
		var first_column_points = team_ids.map((d) => min_year_data_grouped_by_id.get(d)[0]).map((d) => {return {"x": x_axis_scale(d.year), "y":y_axis_scale(d[y_axis_prop])}})
		var point_to_point_link_generator =  d3.line().x(x_axis_value_mapper).y(y_axis_value_mapper)
		var team_id_first_point_link_generator =  d3.line().x((d) => d.x).y((d) => d.y)

		chart.selectAll("text.team-id")
			.data(d3.zip(team_ids, locations_of_team_ids))
			.enter()
			.append("text")
				.attr("class", (d) => d[0] + " team-id")
				.attr("y", (d) => d[1].y)
				.attr("x", (d) => d[1].x)
				.text((d) => d[0])
				.on("mouseover", (d) => change_team_state(d[0], true))
				.on("mouseout", (d) => change_team_state(d[0], false))
		
		chart.selectAll("path.first-link")
			.data(d3.zip(team_ids, locations_of_team_ids, first_column_points))
			.enter()
			.append("path")
				.attr("d", (d) => team_id_first_point_link_generator([d[1], d[2]]))
				.attr("class", (d) => d[0] + " first-link")

		chart.selectAll("text.team-name")
			.data(d3.zip(team_ids, team_names))
			.enter()
			.append("text")
				.attr("class", (d) => d[0] + " team-name")
				.attr("x", graph_width/2)
				.attr("y", margins.top*2)
				.text((d) => d[1])

		chart.append("g")
			.call(x_axis)
			.attr("class", "x-axis")
			.attr("transform", "translate(0, " + graph_height+ ")")
		chart.append("g")
			.attr("class", "y-axis")
			.call(y_axis)
		axis_labels(chart, "Year", "Number of wins", graph_height, graph_width, margins)
		chart_title(chart, "Number of wins for MLB teams from 2000-2015", graph_width, margins)
		chart
			.selectAll(".links")
			.data(grouped_by_team.values())
			.enter()
			.append("path")
				.attr("d", (d) => point_to_point_link_generator(d))
				.attr("class", (d) => d[0].id + " links")
				.on("mouseover", (d) => change_team_state(d[0].id, true))
				.on("mouseout", (d) => change_team_state(d[0].id, false))

		
		chart
			.selectAll("circle")
			.data(all_data)
			.enter()
			.append("circle")
				.attr("cx", x_axis_value_mapper)
				.attr("cy", y_axis_value_mapper)
				.attr("class", (d) => d.id + " point" + (d.is_world_series_winner === 'Y' ? " ws-winner": ""))
				.on("mouseover", (d) => change_team_state(d.id, true))
				.on("mouseout", (d) => change_team_state(d.id, false))
			.call(activate_winners)
	})
});
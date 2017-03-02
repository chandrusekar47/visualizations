d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this)
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
	return values
}

function create_chart (width, height, margins) {
	var chart = d3.select("body")
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
	chart.append("text")
			.attr("transform", "translate("+(width/2)+", " + (height + margins.bottom/2) + ")")
			.attr("class", "label x-axis")
			.style("text-anchor", "middle")
	chart.append("text")
			.attr("transform", "rotate(-90)")
			.attr("class", "label y-axis")
			.attr("x", -height/2)
			.attr("y", -margins.left/1.5)
			.style("text-anchor", "middle")
	chart.append("text")
			.attr("transform", "rotate(-90)")
			.attr("class", "unit y-axis")
			.attr("x", -height/2)
			.attr("y", -margins.left/2.5)
			.style("text-anchor", "middle")
	chart.append("text")
			.attr("class", "average-text hidden")
			.attr("x", 0)
			.attr("y", 0)
			.style("text-anchor", "start")
	var legend_width = 230, legend_height = 30
	var legend_tl_x = width - legend_width
	var legend_tl_y = 5
	var padding = 20
	var circle_radius = 10

	var legend_box = chart.append("g")
			.attr("class","legend")

	legend_box
			.append("rect")
				.attr("width", legend_width)
				.attr("height", legend_height)
				.attr("x", legend_tl_x)
				.attr("y", legend_tl_y)
	legend_box
			.append("circle")
				.attr('cx', legend_tl_x + padding)
				.attr('cy', legend_tl_y + legend_height/2)
				.attr('r', circle_radius)
				.attr("class", "legend-point ws-winner")
	legend_box
			.append("text")
			.attr("x", legend_tl_x + padding + circle_radius + padding/3)
			.attr("y", legend_tl_y + legend_height/2 + 5)
			.text("- World series winner")


	chart.append("defs")
			.append("marker")
			.attr("id", "arrow")
			.attr("viewBox", "0 0 10 10")
			.attr("refX", 1)
			.attr("refY", 5)
			.attr("markerWidth", 6)
			.attr("markerHeight", 6)
			.attr("orient", "auto")
			.append("path")
				.attr("d", "M 0 0 L 10 5 L 0 10 z")

	return chart
}

function point(x,y) {return {x,y}}

function get_current_location(element) {
	return d3.transform(element.attr("transform")).translate
}
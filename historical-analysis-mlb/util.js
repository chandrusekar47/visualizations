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
			.attr("class", "graph")
		.append("g")
			.attr("class", "grid-area")
			.attr("transform", "translate("+margins.left+", "+margins.top+")")
	chart.append('text')
			.attr("x", width/2)
			.attr("y", margins.top)
			.attr("class", "title")
			.style("text-anchor", "middle")
	chart.append("text")
			.attr("transform", "translate("+(width/2)+", " + (height + margins.bottom/2) + ")")
			.attr("class", "label x-axis")
			.style("text-anchor", "middle")
	chart.append("text")
			.attr("transform", "rotate(-90)")
			.attr("class", "label y-axis")
			.attr("x", -height/2)
			.attr("y", -margins.left/2)
			.style("text-anchor", "middle")
	return chart
}

function point(x,y) {return {x,y}}
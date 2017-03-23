d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this)
	})
}

function point (x, y) {return {x, y}}

function dist (point, another_point) {
	return Math.sqrt((point.x - another_point.x)**2 + (point.y - another_point.y)**2)
}

function point_at_distance(point1, point2, distance_from_point1) {
	if (dist(point1, point2) == 0) {
		return point(point1.x + distance_from_point1, point1.y + distance_from_point1)
	}
	var t = parseFloat(distance_from_point1)/dist(point1, point2)
	return point((1-t) * point1.x + t*point2.x, (1-t)*point1.y + t*point2.y)
}

function create_arrow_marker(svgElement) {
	svgElement.append("defs")
		.append("marker")
		.attr("id", "arrow")
		.attr("viewBox", "0 0 10 10")
		.attr("refX", 6)
		.attr("refY", 6)
		.attr("markerWidth", 6)
		.attr("markerHeight", 6)
		.attr("orient", "auto")
		.append("path")
			.attr("d", "M 0 0 L 10 5 L 0 10 z")
	svgElement.append("defs")
		.append("marker")
		.attr("id", "arrow_active_in")
		.attr("viewBox", "0 0 10 10")
		.attr("refX", 6)
		.attr("refY", 6)
		.attr("markerWidth", 6)
		.attr("markerHeight", 6)
		.attr("orient", "auto")
		.append("path")
			.attr("d", "M 0 0 L 10 5 L 0 10 z")
	svgElement.append("defs")
		.append("marker")
		.attr("id", "arrow_active_out")
		.attr("viewBox", "0 0 10 10")
		.attr("refX", 6)
		.attr("refY", 6)
		.attr("markerWidth", 6)
		.attr("markerHeight", 6)
		.attr("orient", "auto")
		.append("path")
			.attr("d", "M 0 0 L 10 5 L 0 10 z")
}

function group_by(prop_name, array) {
	return d3.nest().key((d) => d[prop_name]).map(array)
}

function node_to_link_mappings(nodes, links, attractors, radius, small_label_radius) {
	var name_to_obj_mapping = {}
	nodes.forEach((x) => {
		if (attractors.indexOf(x.BLCountry) >= 0) {
			x.is_attractor = true
			x.radius = radius[attractors.indexOf(x.BLCountry)]
		}
		if (x.abs_diff <= small_label_radius) {
			x.small_label = true
		}
		x.class_name = x.BLCountry.replace(/ /g, '_')
		x.class_list = []
		x.incoming_nodes = []
		x.outgoing_nodes = []
		name_to_obj_mapping[x.BLCountry] = x
	})
	links.forEach((link) => {
		var source_class_name = link.BLCountry.replace(/ /g, '_')
		var target_class_name = link.DLCountry.replace(/ /g, '_')
		link.classes = "t_"+source_class_name + " " + "s_"+target_class_name
		link.source = name_to_obj_mapping[link.BLCountry]
		link.target = name_to_obj_mapping[link.DLCountry]
		link.source.class_list.push("s_" + link.target.class_name)
		link.target.class_list.push("t_" + link.source.class_name)
	})
	nodes.forEach((x) => {
		x.classes = x.class_list.join(' ')
		delete x.class_list
	})
}

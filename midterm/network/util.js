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
}

function group_by(prop_name, array) {
	return d3.nest().key((d) => d[prop_name]).map(array)
}

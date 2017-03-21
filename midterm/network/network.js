window.Network = (() => {
	var compute_collision_radius = (d) => compute_circle_radius(d) + 15 + d.BLocLabel.length
	var color_calculator = (d) => d.diff <= 0 ? "blue" : "red"
	var gen_raidus_calculator = (scale) => {
		return (d) => d.is_attractor ? d.radius : scale(d.abs_diff)
	}
	var gen_label_pos_calculator = (radius_calculator) => {
		return (d) => radius_calculator(d) + 13
	}

	var Network = function (chartId, nodes, links, width, height, radius_range) {
		this.left_padding = 100
		this.right_padding = 100
		this.top_padding = 100
		this.bottom_padding = 100
		this.width = width - this.left_padding - this.right_padding
		this.height = height - this.bottom_padding - this.top_padding
		this.circle_radius_scale = d3.scaleLinear().domain(d3.extent(nodes.filter((x) => !x.is_attractor), (x) => x.abs_diff)).range(radius_range);
		this.radius_calculator = gen_raidus_calculator(this.circle_radius_scale)
		this.label_pos_calculator = gen_label_pos_calculator(this.radius_calculator)
		this.chartId = chartId
		var obj = this
		this.chart = d3.select("body")
			.append("svg")
			.attr("id", chartId)
			.attr("width", width)
			.attr("height", height)
		create_arrow_marker(this.chart)
		this.simulation = d3.forceSimulation()
			.force("center", d3.forceCenter(width / 2, height / 2))
			.force("collide", d3.forceCollide().radius((d) => obj.radius_calculator(d) + 30).iterations(16))
			.force("link", d3.forceLink())
		this.update_data(nodes, links)
		this.simulation.on("tick", function() {
			if (!obj.link || !obj.node) return;
			obj.link
				.attr("x1", function(d) { 
					return d.source.x
				})
				.attr("y1", function(d) { 
					return d.source.y 
				})
				.attr("x2", function(d) { 
					return point_at_distance(d.target, d.source, obj.radius_calculator(d.target)).x; 
				})
				.attr("y2", function(d) { 
					return point_at_distance(d.target, d.source, obj.radius_calculator(d.target)).y; 
				});

			obj.node.attr("transform", function(d) { 
				return "translate(" + d.x + "," + d.y + ")"; 
			});
		});
	}

	Network.prototype = {
		update_data: function (nodes, links) {
			var obj = this
			// this.collision_radius_scale = d3.scaleOrdinal().domain(all_levels).range(Array.from(new Array(all_levels.length), (x,i) => (i+1)*5))
			
			// this.simulation.force("collide").radius(compute_collision_radius)
			this.link = this.chart.selectAll(".link")
				.data(links)
				.enter()
					.append("line")
					.attr("marker-end", "url(#arrow)")
					.attr("class", (d) => d.classes + " link")

			this.node = this.chart
				.selectAll("g.node-group")
				.data(nodes, (x) => x["BLocUID"])
				.enter()
					.append("g")
						.attr("class", (d)=>d.classes + " node-group")
					.on("click", function (node) {
						var class_name = node.class_name
						node.activated = !node.activated
						obj.chart.selectAll(".t_"+class_name).classed("active out", node.activated)
						obj.chart.selectAll(".s_"+class_name).classed("active in", node.activated)
						obj.chart.selectAll(".link.active.in").attr("marker-end", node.activated ? "url(#arrow_active_in)" : "url(#arrow)")
						obj.chart.selectAll(".link.active.out").attr("marker-end", node.activated ? "url(#arrow_active_out)" : "url(#arrow)")
						obj.chart.selectAll("."+class_name).classed("activated", node.activated)
						if (node.activated) {
							$("#"+obj.chartId +" :not(.active,.activated)").addClass("subdued")
						} else {
							$("#"+obj.chartId +" :not(.active,.activated)").removeClass("subdued")
						}
					})
			this.node
				.append("circle")
					.attr("class", (d) => d.classes + " node " + (d.is_attractor ? " attractor" : ""))
					.attr("r", this.radius_calculator)
					.attr("fill", color_calculator)

			this.node.append("text")
				.attr("dx", 0)
				.attr("dy", this.label_pos_calculator)
				.attr("class", (d) => d.classes + " text-label " + (d.small_label ? " small " : (d.is_attractor ? " attractor " : "medium")))
				.text((d) => d.BLCountry)
			this.simulation.nodes(nodes)
			this.simulation.force("link").links(links)
			this.simulation.restart()
		}
	}

	return Network
})()
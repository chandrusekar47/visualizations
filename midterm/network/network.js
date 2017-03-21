window.Network = (() => {
	var compute_collision_radius = (d) => compute_circle_radius(d) + 15 + d.BLocLabel.length
	var color_calculator = (d) => d.diff <= 0 ? "blue" : "red"
	var gen_raidus_calculator = (scale, level_calculator) => {
		return (d) => scale(level_calculator(d.diff))
	}
	var gen_label_pos_calculator = (radius_calculator) => {
		return (d) => radius_calculator(d)
	}
	var gen_level_calculator = (size_of_level, top_values) => {
		return (x) => top_values.indexOf(Math.abs(x)) >= 0 ? Math.abs(x) :  Math.abs(x) - (Math.abs(x) % size_of_level)
	}

	var Network = function (chartId, nodes, links, width, height) {
		this.left_padding = 100
		this.right_padding = 100
		this.top_padding = 100
		this.bottom_padding = 100
		this.width = width - this.left_padding - this.right_padding
		this.height = height - this.bottom_padding - this.top_padding
		this.chart = d3.select("body")
			.append("svg")
			.attr("id", chartId)
			.attr("width", width)
			.attr("height", height)
		create_arrow_marker(this.chart)
		this.simulation = d3.forceSimulation()
			// .force("center", d3.forceCenter(width / 2, height / 2))
			.force("charge", d3.forceManyBody().strength(-10))
			// .force("collide", d3.forceCollide(5))
			.force("link", d3.forceLink())
			.force("X", d3.forceX())
			.force("Y", d3.forceY())
			.alphaTarget(1)
		this.nodes = []
		this.links = []
		this.update_data(nodes, links)
		var obj = this
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
		update_x_y_scales: function () {
			var extent_of_deaths = d3.extent(this.nodes, (x) => x["freq_death"] + 1)
			var extent_of_births = d3.extent(this.nodes, (x) => x["freq_birth"] + 1)
			this.xForceScale.domain(extent_of_births)
			this.yForceScale.domain(extent_of_deaths)
		},
		update_nodes_and_links: function (nodes, links) {
			this.nodes.splice(0, this.nodes.length)
			this.links.splice(0, this.links.length)
			var obj = this
			nodes.forEach((x) => obj.nodes.push(x))
			links.forEach((x) => obj.links.push(x))
		},
		update_data: function (nodes, links) {
			var obj = this
			this.update_nodes_and_links(nodes, links)
			var no_of_top_values = 5
			var size_of_level = 10
			var unique_values = Array.from(new Set(this.nodes.map((x) => Math.abs(parseFloat(x['diff']))))).sort((a,b) => a-b)
			var top_values = unique_values.splice(Math.max(0, unique_values.length - no_of_top_values), no_of_top_values)
			var level_calculator = gen_level_calculator(size_of_level, top_values)
			var unique_levels = Array.from(new Set(unique_values.map(level_calculator))).sort((a,b) => a-b)
			var all_levels = unique_levels.concat(top_values)
			
			circle_radius_scale = d3.scaleOrdinal().domain(all_levels).range(Array.from(new Array(all_levels.length), (x,i) => (i+1)*3))
			// this.collision_radius_scale = d3.scaleOrdinal().domain(all_levels).range(Array.from(new Array(all_levels.length), (x,i) => (i+1)*5))
			this.radius_calculator = gen_raidus_calculator(circle_radius_scale, level_calculator)
			this.label_pos_calculator = gen_label_pos_calculator(this.radius_calculator)
			
			// this.simulation.force("collide").radius(compute_collision_radius)
			this.link = this.chart.selectAll(".link")
				.data(this.links, (x) => x["BLocUID"]+'-'+x["DLocUID"])
			
			this.link
				.exit()
					.transition()
					.duration(150)
					.attr("opacity", 0.0)
					.remove()
			this.link = this.link
				.enter()
					.append("line")
					.attr("marker-end", "url(#arrow)")
					.attr("class", "link")
				.merge(this.link)

			this.node = this.chart
				.selectAll("g.node-group")
				.data(this.nodes, (x) => x["BLocUID"])
			this.node.selectAll(".node")
					.transition()
					.duration(500)
					.attr("r", this.radius_calculator)
					.attr("fill", color_calculator)
			this.node
				.exit()
				.remove()
			var group_node = this.node.enter()
					.append("g")
						.attr("class", "node-group")
			group_node
				.append("circle")
					.attr("class", (d) => "node " + d['BLocUID'])
					.attr("r", this.radius_calculator)
					.attr("fill", color_calculator)
			this.node = group_node.merge(this.node)
			this.restart_simulation()

			// this.node.append("text")
			// 	.attr("dx", 0)
			// 	.attr("dy", this.label_pos_calculator)
			// 	.text((d) => d.BLocLabel)
		},
		restart_simulation: function () {
			var obj = this
			var extent_of_deaths = d3.extent(this.nodes, (x) => x["freq_death"] + 1)
			var extent_of_births = d3.extent(this.nodes, (x) => x["freq_birth"] + 1)
			this.xForceScale = d3.scaleLog().rangeRound([3*this.left_padding, this.width-this.right_padding])
			this.yForceScale = d3.scaleLog().rangeRound([this.height, this.bottom_padding])
			this.xForceScale.domain(extent_of_births)
			this.yForceScale.domain(extent_of_deaths)
			var xForce = (d) => {
				return obj.xForceScale(d.freq_birth + 1)
			}
			var yForce = (d) => {
				return obj.yForceScale(d.freq_death + 1)
			}
			this.simulation.force("X").x(xForce).strength(1)
			this.simulation.force("Y").y(yForce).strength(1)
			this.simulation.nodes(this.nodes)
			this.simulation.force("link").links(this.links).strength(0)
			this.simulation.alpha(0.8).restart()
		}
	}

	return Network
})()
$(() => {
	var graph_18, graph_19, graph_20;
	var promise_1 = $.when($.get('data/fb_counts_18.json'), 
		$.get('data/fb_links_18.json'))
	.done((response1, response2) => {
		var fb_nodes_18 = response1[0]
		var fb_links_18 = response2[0]
		var width = 1800, height = 1080
		var attractors = ['United Kingdom', 'United States of America', 'Ireland', 'Austria', 'Germany', 'Australia', 'Poland', 'Canada', 'New Zealand', 'Italy', 'Czech Republic', 'India']
		var radius = [49.5,47.0,44.5,42.0,39.5,37.0,34.5,32.0,29.5,27.0,24.5,22.0]
		var radius_range = [3, 19]
		node_to_link_mappings(fb_nodes_18, fb_links_18, attractors, radius, 5)
		graph_18 = new Network("century-18", fb_nodes_18, fb_links_18, width, height, radius_range, "century-specific century-18")
	})
	var promise_2 = $.when($.get('data/fb_counts_19.json'), 
		$.get('data/fb_links_19.json'))
	.done((response1, response2) => {
		var fb_nodes_19 = response1[0]
		var fb_links_19 = response2[0]
		var width = 1800, height = 1200
		var name_to_obj_mapping = {}
		var attractors = ['United States of America', 'France', 'Poland', 'United Kingdom', 'Ukraine', 'Switzerland', 'Ireland', 'Austria', 'India', 'Hungary', 'Canada', 'Netherlands', 'Germany']
		var radius = [58,55,52,49,46,43,40,37,34,31,28,25,22]
		var radius_range = [3, 19]
		node_to_link_mappings(fb_nodes_19, fb_links_19, attractors, radius, 20)
		graph_19 = new Network("century-19", fb_nodes_19, fb_links_19, width, height, radius_range, "century-specific century-19")
	})
	var promise_3 = $.when($.get('data/fb_counts_20.json'), 
		$.get('data/fb_links_20.json'))
	.done((response1, response2) => {
		var fb_nodes_20 = response1[0]
		var fb_links_20 = response2[0]
		var width = 1800, height = 1200
		var attractors =['United States of America' ,'Poland' ,'France' ,'Ukraine' ,'United Kingdom' ,'Australia' ,'China' ,'Switzerland' ,'India' ,'West Bank' ,'Czech Republic' ,'Hungary' ,'Ireland' ,'Romania'];
		var radius = [61,58,55,52,49,46,43,40,37,34,31,28,25,22]
		var radius_range = [3, 19]
		node_to_link_mappings(fb_nodes_20, fb_links_20, attractors, radius, 20)
		graph_20 = new Network("century-20", fb_nodes_20, fb_links_20, width, height, radius_range, "century-specific century-20")
	})

	var activate_century = function (class_for_century) {
		$(".century-specific").hide()
		$(class_for_century).show()
	}

	$("input[type=radio][name=century]").change(function () {
		if (!graph_20 || !graph_19 || !graph_18) { return }
		activate_century("." + this.value)
	})
	$.when(promise_1, promise_2, promise_3).done(() => {
		activate_century(".century-18")
	})
})
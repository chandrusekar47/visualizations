$(() => {
	$.when($.get('data/fb_counts_18.json'), 
		$.get('data/fb_links_18.json'))
	.done((response1, response2) => {
		var fb_nodes_18 = response1[0]
		var fb_links_18 = response2[0]
		var width = 1800,
				height = 1080
		var name_to_obj_mapping = {}
		var attractors = ['United Kingdom', 'United States of America', 'Ireland', 'Austria', 'Germany', 'Australia', 'Poland', 'Canada', 'New Zealand', 'Italy', 'Czech Republic', 'India']
		var radius = [49.5,47.0,44.5,42.0,39.5,37.0,34.5,32.0,29.5,27.0,24.5,22.0]
		var radius_range = [3, 19]

		fb_nodes_18.forEach((x) => {
			if (attractors.indexOf(x.BLCountry) >= 0) {
				x.is_attractor = true
				x.radius = radius[attractors.indexOf(x.BLCountry)]
			}
			if (x.abs_diff <= 5) {
				x.small_label = true
			}
			x.class_name = x.BLCountry.replace(/ /g, '_')
			x.class_list = []
			name_to_obj_mapping[x.BLCountry] = x
		})
		fb_links_18.forEach((link) => {
			var source_class_name = link.BLCountry.replace(/ /g, '_')
			var target_class_name = link.DLCountry.replace(/ /g, '_')
			link.classes = "t_"+source_class_name + " " + "s_"+target_class_name
			link.source = name_to_obj_mapping[link.BLCountry]
			link.target = name_to_obj_mapping[link.DLCountry]
			link.source.class_list.push("s_" + link.target.class_name)
			link.target.class_list.push("t_" + link.source.class_name)
		})
		fb_nodes_18.forEach((x) => {
			x.classes = x.class_list.join(' ')
			delete x.class_list
		})
		var graph = new Network("graph-18", fb_nodes_18, fb_links_18, width, height, [3, 19])
	})
})
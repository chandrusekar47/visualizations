$(() => {
	$.when($.get('data/fb_counts_19.json'), 
		$.get('data/fb_links_19.json'))
	.done((response1, response2) => {
		var fb_nodes_19 = response1[0]
		var fb_links_19 = response2[0]
		var width = 1800,
				height = 1200
		var name_to_obj_mapping = {}
		var attractors = ['United States of America', 'France', 'Poland', 'United Kingdom', 'Ukraine', 'Switzerland', 'Ireland', 'Austria', 'India', 'Hungary', 'Canada', 'Netherlands', 'Germany']
		var radius = [58,55,52,49,46,43,40,37,34,31,28,25,22]
		var radius_range = [3, 19]

		fb_nodes_19.forEach((x) => {
			if (attractors.indexOf(x.BLCountry) >= 0) {
				x.is_attractor = true
				x.radius = radius[attractors.indexOf(x.BLCountry)]
			}
			if (x.abs_diff <= 20) {
				x.small_label = true
			}
			x.class_name = x.BLCountry.replace(/ /g, '_')
			x.class_list = []
			name_to_obj_mapping[x.BLCountry] = x
		})
		fb_links_19.forEach((link) => {
			var source_class_name = link.BLCountry.replace(/ /g, '_')
			var target_class_name = link.DLCountry.replace(/ /g, '_')
			link.classes = "t_"+source_class_name + " " + "s_"+target_class_name
			link.source = name_to_obj_mapping[link.BLCountry]
			link.target = name_to_obj_mapping[link.DLCountry]
			link.source.class_list.push("s_" + link.target.class_name)
			link.target.class_list.push("t_" + link.source.class_name)
		})
		fb_nodes_19.forEach((x) => {
			x.classes = x.class_list.join(' ')
			delete x.class_list
		})
		var graph = new Network("graph-19", fb_nodes_19, fb_links_19, width, height, radius_range)
	})
})
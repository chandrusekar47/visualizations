$(() => {
	$.when($.get('data/p_e_ulan_nodes.json'), 
		$.get('data/p_e_ulan_links.json'))
	.done((response1, response2) => {
		var nodes_grouped_by_century = response1[0]
		var links_grouped_by_century = response2[0]
		var width = 1800,
				height = 1080
		var century_chosen = -300
		var loc_id_to_index_map_by_century = {}
		var centuries = Object.keys(nodes_grouped_by_century).sort((a,b) => parseInt(a)-parseInt(b))
		Object.keys(nodes_grouped_by_century).forEach((century) => {
			var nodes_in_century = nodes_grouped_by_century[century]
			loc_id_to_index_map_by_century[century] = nodes_in_century.reduce((acc, node, index) => {acc[node['BLocUID']] = index; return acc;}, {})
		})
		Object.keys(links_grouped_by_century).forEach((century) => {
			var links_in_century = links_grouped_by_century[century]
			links_in_century.forEach((link) => {
				link.source = nodes_grouped_by_century[century][loc_id_to_index_map_by_century[century][link.BLocUID]]
				link.target = nodes_grouped_by_century[century][loc_id_to_index_map_by_century[century][link.DLocUID]]
			})
		})
		centuries.forEach((x) => $("#century-select").append($("<option>", {'value': x, text: x})))
		$("#century-select").val(century_chosen)
		$("#century-select").on("change", function () {
			century_chosen = parseInt(this.value)
			graph.update_data(nodes_grouped_by_century[century_chosen], links_grouped_by_century[century_chosen])
		})
		var graph = new Network("first-graph", nodes_grouped_by_century[century_chosen], links_grouped_by_century[century_chosen], width, height)
	})
})
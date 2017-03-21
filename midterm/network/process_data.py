import networkx as nx
import json

with open('data/pruned_europe_ulan_nodes.json') as nodes_file:
	all_century_nodes = json.load(nodes_file)

with open('data/pruned_europe_ulan_links.json') as links_file:
	all_century_links = json.load(links_file)

links_grouped_by_century = {}
nodes_grouped_by_century = {}

for node in all_century_nodes:
	if not nodes_grouped_by_century.has_key(node['century']):
		nodes_grouped_by_century[node['century']] = []
	nodes_grouped_by_century[node['century']].append(node)

for link in all_century_links:
	if not links_grouped_by_century.has_key(link['century']):
		links_grouped_by_century[link['century']] = []
	links_grouped_by_century[link['century']].append(link)

reduced_links_by_century = {}
reduced_nodes_by_century = {}

for century, links_in_century in links_grouped_by_century.iteritems():
	nodes_in_century = nodes_grouped_by_century[century]
	G = nx.Graph()
	for link in links_in_century:
		G.add_edge(link['BLocUID'], link['DLocUID'])
	connected_components = nx.connected_components(G)
	most_connected_components = sorted(connected_components, key=len, reverse=True)[0:10]
	needed_nodes = set().union(*most_connected_components)
	reduced_nodes_by_century[century] = [x for x in nodes_in_century if x['BLocUID'] in needed_nodes]
	reduced_links_by_century[century] = [x for x in links_in_century if x['BLocUID'] in needed_nodes or x['DLocUID'] in needed_nodes]

# a = sorted(map(lambda(x,y): (x, len(y)), nodes_grouped_by_century.iteritems()), key=lambda x:x[0])
# b = sorted(map(lambda(x,y): (x, len(y)), reduced_nodes_by_century.iteritems()), key=lambda x:x[0])
# print(sorted(map(lambda(x,y): (x[0], x[1]-y[1]), zip(a,b)), key=lambda x:x[1], reverse = True))

# a = sorted(map(lambda(x,y): (x, len(y)), links_grouped_by_century.iteritems()), key=lambda x:x[0])
# b = sorted(map(lambda(x,y): (x, len(y)), reduced_links_by_century.iteritems()), key=lambda x:x[0])
# print(sorted(map(lambda(x,y): (x[0], x[1]-y[1]), zip(a,b)), key=lambda x:x[1], reverse = True))

with open('data/p_e_ulan_nodes.json', 'w') as outfile:
	json.dump(reduced_nodes_by_century, outfile)

with open('data/p_e_ulan_links.json', 'w') as outfile:
	json.dump(reduced_links_by_century, outfile)
import csv
import numpy as np
import SimpleHTTPServer
import SocketServer
import json
from scipy import stats

PORT = 8000

def group_by(data, property_name):
	grouped_by = {}
	for record in data:
		if not grouped_by.has_key(record[property_name]):
			grouped_by[record[property_name]] = []
		grouped_by[record[property_name]].append(record)
	return grouped_by

def average(data, property_name=None):
	if property_name != None:
		values = [float(x[property_name]) for x in data if x[property_name] != "NULL" and x[property_name] != '']
	else:
		values = [x for x in data if x != None]
	return sum(values)/max(len(values), 1)

def filter_by_years(data, year_key, start_year, end_year):
	filtered_data = []
	for record in data:
		if int(record[year_key]) >= start_year and int(record[year_key]) <= end_year:
			filtered_data.append(record)
	return filtered_data

def sort(data, key, reverse = False):
	return sorted(data, key=key, reverse = reverse)

def pluck(key, data):
	return [x[key] for x in data]

def read_csv(filename):
	all_records = list(csv.reader(open(filename), delimiter=","))
	header_row = all_records[0]
	data_rows = all_records[1:]
	num_cols = len(header_row)
	data_dicts = []
	for row in data_rows:
		data_dict = {}
		for index in xrange(0, num_cols):
			data_dict[header_row[index]] = row[index]
		data_dicts.append(data_dict)
	return data_dicts

def batting_average(player):
	at_bat = float(player["AB"])
	hits = float(player["H"])
	return hits/at_bat if at_bat != 0 else None

teams = filter_by_years(read_csv("data/teams.csv"), "yearID", 2000, 2015)
players = filter_by_years(read_csv("data/players.csv"), "yearID", 2000, 2015)
pitchers = filter_by_years(read_csv("data/pitching.csv"), "yearID", 2000, 2015)
franchise_ids = set(pluck("franchID", teams))
flat_franchise_year = []
teams_by_franchise_id = group_by(teams, "franchID")
franchises_by_year = group_by(teams, "yearID")
players_by_year = group_by(players, "yearID")
pitchers_by_year = group_by(pitchers, "yearID")

for franchise_id in franchise_ids:
	teams_in_franchise = teams_by_franchise_id[franchise_id]
	franchise = {"id": franchise_id, "name": teams_in_franchise[0]["franchName"]}
	teams_by_year = group_by(teams_in_franchise, "yearID")
	for year, teams in teams_by_year.iteritems():
		team = teams[0]
		players_in_team = [x for x in players_by_year[year] if x["teamID"] == team["teamID"]]
		pitchers_in_team = [x for x in pitchers_by_year[year] if x["teamID"] == team["teamID"]]
		flat_franchise_year.append({
			"id": franchise_id, 
			"name": team["franchName"],
			"year": int(year),
			"wins": int(team["W"]), 
			"losses": int(team["L"]), 
			"is_world_series_winner": team["WSWin"],
			"attendance": float(team["attendance"]), 
			"avg_salary": float(round(average(players_in_team, "salary"), 2)),
			"batting_avg": float(round(average(map(batting_average, players_in_team)), 3)), 
			"era": float(round(average(pitchers_in_team, "ERA"), 3))
		})

grouped_by_year = group_by(flat_franchise_year, "year")
for year, records in grouped_by_year.iteritems():
	z_scores_salary = np.round(stats.zscore(pluck("avg_salary", records)), 2)
	z_scores_wins = np.round(stats.zscore(pluck("wins", records)), 2)
	z_scores_batting_avg = np.round(stats.zscore(pluck("batting_avg", records)), 2)
	z_scores_losses = np.round(stats.zscore(pluck("losses", records)), 2)
	z_scores_attendance = np.round(stats.zscore(pluck("attendance", records)), 2)
	z_scores_era = np.round(stats.zscore(pluck("era", records)), 2)
	for i,record in enumerate(records):
		record["z_avg_salary"] = z_scores_salary[i]
		record["z_wins"] = z_scores_wins[i]
		record["z_batting_avg"] = z_scores_batting_avg[i]
		record["z_losses"] = z_scores_losses[i]
		record["z_attendance"] = z_scores_attendance[i]
		record["z_era"] = z_scores_era[i]

target_file = open("summary.json", "w")
target_file.truncate()
target_file.write(json.dumps(flat_franchise_year))
target_file.close()

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
httpd = SocketServer.TCPServer(("", PORT), Handler)
print "serving at port", PORT
httpd.serve_forever()
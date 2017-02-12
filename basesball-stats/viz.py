import csv
import sys
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.ticker import FuncFormatter
import os 


should_save_figures = False
if len(sys.argv) == 2:
	should_save_figures = True

def file_name(str):
	return "".join([c for c in str if c.isalpha() or c.isdigit() or c=='']).rstrip()

def save_all_figures():
	dir_path = os.path.dirname(os.path.realpath(__file__))
	output_dir = os.path.join(dir_path, 'output')
	if not os.path.exists(output_dir):
		os.makedirs(output_dir)
	for i in plt.get_fignums():
		fig = plt.figure(i)
		mng = plt.get_current_fig_manager()
		size = mng.window.maxsize()
		mng.resize(width = size[0]*0.4, height = size[1]*0.75)
		axes = fig.axes[0]
		fig.canvas.draw()
		fig.savefig(os.path.join(output_dir, file_name(axes.get_title()+'.png')))

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

def filter_by_year(data, year_key, year):
	filtered_data = []
	for record in data:
		if record[year_key] == year:
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

def show_hbar_plot(values, y_labels, title, y_axis_label, x_axis_label, x_formatter = None):
	fig, axis = plt.subplots()
	bar_width = 0.5
	rects = axis.barh(np.arange(len(values)), 
		values, 
		bar_width, 
		color='gray')
	axis.set_xlabel(x_axis_label)
	axis.set_ylabel(y_axis_label)
	axis.set_yticks(np.arange(len(rects)) + bar_width/2)
	axis.set_yticklabels(y_labels)
	axis.set_title(title)
	axis.xaxis.set_major_formatter(x_formatter) if x_formatter != None else None
	fig.tight_layout()
	fig.autofmt_xdate()
	fig.show()
	return fig, axis

def batting_average(player):
	at_bat = float(player["AB"])
	hits = float(player["H"])
	return hits/at_bat if at_bat != 0 else None

def show_scatter_plot(x_values, y_values, title, x_label, y_label, x_formatter = None, point_labels = None):
	fig, axis = plt.subplots()
	axis.scatter(x_values, y_values)
	axis.set_title(title)
	axis.set_xlabel(x_label)
	axis.set_ylabel(y_label)
	axis.xaxis.set_major_formatter(x_formatter) if x_formatter != None else None
	if point_labels != None:
		for xy_label in zip(x_values, y_values, point_labels):
			axis.annotate(xy_label[2], xy = (xy_label[0], float(xy_label[1])-0.25), textcoords='data', ha='center', va='top')
	fig.tight_layout()
	fig.autofmt_xdate()
	fig.show()
	return fig, axis

teams = filter_by_year(read_csv("teams.csv"), "yearID", "2015")
players = filter_by_year(read_csv("players.csv"), "yearID", "2015")
pitchers = filter_by_year(read_csv("pitching.csv"), "yearID", "2015")
team_id_team = {x["teamID"]: x for x in teams}
players_by_team = group_by(players, "teamID")
pitchers_by_team = group_by(pitchers, "teamID")

for team in teams:
	team_id = team["teamID"]
	players_in_team = players_by_team[team_id]
	pitchers_in_team = pitchers_by_team[team_id]
	team["avg_salary"] = round(average(players_in_team, "salary"), 2)
	team["batting_avg"] = round(average(map(batting_average, players_in_team)), 3)
	team["ERA"] = round(average(pitchers_in_team, "ERA"), 3)

teams_sorted_by_wins = sort(teams, lambda x: int(x["W"]))
teams_sorted_by_salary = sort(teams, lambda x: x["avg_salary"])
teams_sorted_by_batting_avg = sort(teams, lambda x: x["batting_avg"])
teams_sorted_by_era = sort(teams, lambda x: x["ERA"], reverse = True)

millions_func_formatter = FuncFormatter(lambda x,y: "%0.2f"%(x*1e-6))

# Task 1
show_hbar_plot(pluck("W", teams_sorted_by_wins), 
			pluck("name", teams_sorted_by_wins), "Performance of teams in MLB 2015", 'Teams', 'Number of Wins')
show_hbar_plot(pluck("avg_salary", teams_sorted_by_salary), 
			pluck('name', teams_sorted_by_salary), "Payroll of teams in MLB 2015", "Teams", "Avg. Salary per player\n in million USD", x_formatter = millions_func_formatter)

swap_scatter_plot_axis = False

if swap_scatter_plot_axis: 
	show_scatter_plot(pluck("W", teams), 
			pluck("avg_salary", teams),
			"Relation between number of wins and player salary",
			"Number of wins", 
			"Average salary per player\n in million USD")
else:
	show_scatter_plot(pluck("avg_salary", teams), 
			pluck("W", teams), 
			"Relation between number of wins and player salary",
			"Average salary per player\n in million USD",
			"Number of wins", 
			x_formatter = millions_func_formatter,
			point_labels = pluck("teamID", teams))

# Task 2
show_hbar_plot(pluck("batting_avg", teams_sorted_by_batting_avg),
			pluck("name", teams_sorted_by_batting_avg), "Batting Average (Hits/At Bats) for MLB teams in 2015", "Teams", "Batting average\n(Higher is better)")

if swap_scatter_plot_axis:
	show_scatter_plot(pluck("W", teams), 
			pluck("batting_avg", teams), "Relation between batting avg and wins", "Number of wins","Batting average\n(Higher is better)")
else:
	show_scatter_plot(pluck("batting_avg", teams),
			pluck("W", teams), "Relation between batting avg and wins", "Batting average\nIgnoring At bats = 0\n(Higher is better)", "Number of wins", point_labels = pluck("teamID", teams))

# Task 3
show_hbar_plot(pluck("ERA", teams_sorted_by_era),
			pluck("name", teams_sorted_by_era), "Earned Run Average for MLB teams in 2015", "Teams", "Earned run average\n(Lesser is better)")
if swap_scatter_plot_axis:
	show_scatter_plot(pluck("W", teams),
			pluck("ERA", teams), "Relation between Earned Run Average and wins", "Number of wins", "Earned run average\n(Lesser is better)")
else:
	show_scatter_plot(pluck("ERA", teams),
			pluck("W", teams), "Relation between Earned Run Average and wins", "Earned run average\n(Lesser is better)", "Number of wins", point_labels = pluck("teamID", teams))

if should_save_figures:
	save_all_figures()
plt.show()
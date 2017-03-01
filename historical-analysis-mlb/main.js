$(() => {
	var attr = (title, ylab, property_name, unit = "",formatter = (x)=> +(x).toFixed(3), draw_zero_line = false, zero_line_label = "Average") => {return {title, ylab, property_name, unit, formatter, draw_zero_line, zero_line_label}}
	var million_formatter = (x) => (x /(Math.pow(10,6))).toFixed(2)
	var y_axis_attributes = {
		"batting_avg": attr("Batting average for teams from  2000-2015", "Batting average", "batting_avg"),
		"era": attr("Earned run average for teams from 2000-2015", "Earned run average", "era"),
		"wins": attr("Number of wins for teams from 2000-2015", "Number of wins", "wins"),
		"attendance": attr("Home attendance of teams from 2000-2015", "Home attendance", "attendance", "million", million_formatter),
		"avg_salary": attr("Average salary of teams from 2000-2015", "Avg. Salary", "avg_salary", "million USD", million_formatter),
		"z_batting_avg": attr("Batting average for teams from  2000-2015", "Normalized Batting average", "z_batting_avg", undefined, undefined, true),
		"z_era": attr("Earned run average for teams from 2000-2015", "Normalized Earned run average", "z_era", undefined, undefined, true),
		"z_wins": attr("Number of wins for teams from 2000-2015", "Normalized Number of wins", "z_wins", undefined, undefined, true),
		"z_attendance": attr("Home attendance of teams from 2000-2015", "Normalized Home attendance", "z_attendance", undefined, undefined, true),
		"z_avg_salary": attr("Average salary of teams from 2000-2015", "Normalized Avg. Salary", "z_avg_salary", undefined, undefined, true)
	}
	var current_attribute = "batting_avg"
	var property_name = current_attribute
	var is_z_score_chosen =false
	var chart
	var update_y_axis_property = () => {
		property_name = is_z_score_chosen ? "z_"+current_attribute : current_attribute
		chart ? chart.render(y_axis_attributes[property_name]) : undefined
	}

	$("input[type=radio][name=attribute]").change(function () {
		current_attribute = this.value
		update_y_axis_property()
	})

	$("input[type=radio][name=scale]").change(function () {
		is_z_score_chosen = this.value === "z_"
		update_y_axis_property()
	})

	Data.fetch((data) => {
		window.all_data = data
		chart = Chart.create(data, y_axis_attributes[property_name])
		chart.render(y_axis_attributes[property_name])
	})
});
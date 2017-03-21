$(() => {
	var attr = (title, ylab, property_name, unit = "",formatter = (x)=> +(x).toFixed(3), draw_zero_line = false, zero_line_label = "Average") => {return {title, ylab, property_name, unit, formatter, draw_zero_line, zero_line_label}}
	var million_formatter = (x) => (x /(Math.pow(10,6))).toFixed(2)
	var y_axis_attributes = {
		"birth_count": attr("Birth count vs continent over time (ULAN dataset)", "Birth count", "birth_count"),
		"death_count": attr("Death count vs continent over time (ULAN dataset)", "Death count", "death_count"),
		"male_birth_count": attr("Male birth count vs continent over time (ULAN dataset)", "Male birth count", "male_birth_count"),
		"male_death_count": attr("Male death count vs continent over time (ULAN dataset)", "Male death count", "male_death_count"),
		"female_birth_count": attr("Female birth count vs continent over time (ULAN dataset)", "Female Birth Count", "female_birth_count"),
		"female_death_count": attr("Female death count vs continent over time (ULAN dataset)", "Female Death Count", "female_death_count"),
		"fb_birth_count": attr("Birth count vs continent over time (FB dataset)", "Birth count", "birth_count"),
		"fb_death_count": attr("Death count vs continent over time (FB dataset)", "Death count", "death_count"),
		"fb_male_birth_count": attr("Male birth count vs continent over time (FB dataset)", "Male birth count", "male_birth_count"),
		"fb_male_death_count": attr("Male death count vs continent over time (FB dataset)", "Male death count", "male_death_count"),
		"fb_female_birth_count": attr("Female birth count vs continent over time (FB dataset)", "Female Birth Count", "female_birth_count"),
		"fb_female_death_count": attr("Female death count vs continent over time (FB dataset)", "Female Death Count", "female_death_count")
	}
	var current_attribute = "death_count"
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
		if (typeof data == "string") {
			data = JSON.parse(data)
		}
		window.all_data = data
		chart = Chart.create(data.data, y_axis_attributes[property_name], data.ws_wins)
		chart.render(y_axis_attributes[property_name])
	})
});
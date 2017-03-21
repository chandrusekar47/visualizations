$(() => {
	var attr = (title, ylab, property_name, formatter = (x)=> x) => {return {title, ylab, property_name, formatter}}
	var y_axis_attributes = {
		"birth_count": attr("Birth count vs continent over time (ULAN dataset)", "Birth count", "birth_count"),
		"death_count": attr("Death count vs continent over time (ULAN dataset)", "Death count", "death_count"),
		"male_birth_count": attr("Male birth count vs continent over time (ULAN dataset)", "Male birth count", "male_birth_count"),
		"male_death_count": attr("Male death count vs continent over time (ULAN dataset)", "Male death count", "male_death_count"),
		"female_birth_count": attr("Female birth count vs continent over time (ULAN dataset)", "Female Birth Count", "female_birth_count"),
		"female_death_count": attr("Female death count vs continent over time (ULAN dataset)", "Female Death Count", "female_death_count"),
		"birth_count_fb": attr("Birth count vs continent over time (FB dataset)", "Birth count", "birth_count_fb"),
		"death_count_fb": attr("Death count vs continent over time (FB dataset)", "Death count", "death_count_fb"),
		"male_birth_count_fb": attr("Male birth count vs continent over time (FB dataset)", "Male birth count", "male_birth_count_fb"),
		"male_death_count_fb": attr("Male death count vs continent over time (FB dataset)", "Male death count", "male_death_count_fb"),
		"female_birth_count_fb": attr("Female birth count vs continent over time (FB dataset)", "Female Birth Count", "female_birth_count_fb"),
		"female_death_count_fb": attr("Female death count vs continent over time (FB dataset)", "Female Death Count", "female_death_count_fb")
	}
	var current_attribute = "death_count"
	var property_name = current_attribute
	var is_fb_chosen =false
	var chart
	var update_y_axis_property = () => {
		property_name = is_fb_chosen ? current_attribute+"_fb" : current_attribute
		chart ? chart.render(y_axis_attributes[property_name]) : undefined
	}

	$("input[type=radio][name=attribute]").change(function () {
		current_attribute = this.value
		update_y_axis_property()
	})

	$("input[type=radio][name=dataset]").change(function () {
		is_fb_chosen = this.value === "fb_"
		update_y_axis_property()
	})

	Data.fetch((data) => {
		if (typeof data == "string") {
			data = JSON.parse(data)
		}
		window.all_data = data
		chart = Chart.create(data, y_axis_attributes[property_name])
		chart.render(y_axis_attributes[property_name])
	})
});
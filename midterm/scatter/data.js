window.Data = (() => {
	return {
		fetch: function (callback) {
			$.get("birth_death_counts.json")
			.done(callback)
			return this
		}
	}
})()
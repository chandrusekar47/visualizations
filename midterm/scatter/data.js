window.Data = (() => {
	return {
		fetch: function (callback) {
			$.get("data/birth_death_counts_padded.json")
			.done(callback)
			return this
		}
	}
})()
window.Data = (() => {
	return {
		fetch: function (callback) {
			$.get({url:"data/birth_death_counts_padded.json", dataType:'json'})
			.done(callback)
			return this
		}
	}
})()
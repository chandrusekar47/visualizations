window.Data = (() => {
	return {
		fetch: function (callback) {
			$.get("summary.json")
			.done(callback)
			return this
		}
	}
})()
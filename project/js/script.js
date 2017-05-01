$(function () {
	var missing_country_mapping = {
		"The Bahamas": "Bahamas",
		"Bosnia and Herzegovina": "Bosnia-Herzegovina",
		"Czech Republic": "Czechoslovakia",
		"French Southern and Antarctic Lands": "French Polynesia",
		"Guinea Bissau": "Guinea-Bissau",
		"Republic of Serbia": "Serbia",
		"Slovakia": "Slovak Republic",
		"United States of America": "United States",
		"West Bank and Gaza Strip": "West Bank"
	}

	var hideLoadingIndicator = function () {
		$("#loading-indicator").remove()
	};

	L.mapbox.accessToken = 'pk.eyJ1IjoiYmxhaGJsYWgtMzIyMSIsImEiOiJjajIzdDl6bjgwMHBlMndxaTN1YnVudWttIn0.PG6CsIhD5A765xXm9oWIXA';
	var activeLayer = {setStyle: (x) => console.log("Country not found while resetting style")}
	var activeYear = 2014
	var activeCountry = ""
	var heatmapLayerByYear = {}
	var heatmapLayersByYearAndCountry = {}
	var worldBoundariesLayer = {}
	var minZoom = 3
	var maxZoom = 7
	var map = L.map('map', {zoomControl: false, doubleClickZoom: false, attributionControl: false}).setView([30, 0], minZoom);
	map.options.minZoom = minZoom
	map.options.maxZoom = maxZoom
	window.map = map
	var layer = L.mapbox.tileLayer('mapbox.dark');
	layer.addTo(map);
	var countryBoundaryStyle = {
		opacity: 0,
		color: 'white',
		dashArray: '2',
		fillOpacity: 0
	};
	var countryBoundaryActiveStyle = {
		opacity: 1,
		weight: 2,
		color: 'green',
		fillOpacity: 0
	};
	var countryBoundaryHoverStyle = {
		weight: 1.5,
		opacity: 1,
		color: 'green',
		fillOpacity: 0
	};
	var countryInfoMap = {}
	var updateActiveYear = function (year) {
		$("#map-controls li.active").toggleClass("active", false)
		$("#map-controls li[data-year="+year+"]").toggleClass("active", true)
		if (activeCountry !== "") {
			if (heatmapLayersByYearAndCountry[activeYear] && heatmapLayersByYearAndCountry[activeYear][activeCountry]) {
				map.removeLayer(heatmapLayersByYearAndCountry[activeYear][activeCountry])
			}
			activeYear = year;
			if (heatmapLayersByYearAndCountry[activeYear] && heatmapLayersByYearAndCountry[activeYear][activeCountry]) {
				map.addLayer(heatmapLayersByYearAndCountry[activeYear][activeCountry]);
			}
			CountryGraphs.updateGraphs(activeCountry, activeYear)
		} else {
			if (heatmapLayerByYear[activeYear]) {
				map.removeLayer(heatmapLayerByYear[activeYear])
			}
			activeYear = year;
			if (heatmapLayerByYear[activeYear]) {
				map.addLayer(heatmapLayerByYear[activeYear]);
			}
		}
	}

	var activateCountry = function (feature, layer) {
		if (!heatmapLayersByYearAndCountry[activeYear]) {return;}
		if (activeCountry === "") {
			$("#graph-container").slideDown()
			if (heatmapLayerByYear[activeYear]) {
				map.removeLayer(heatmapLayerByYear[activeYear])
			}
		} else {
			if (heatmapLayersByYearAndCountry[activeYear][activeCountry]) {
				map.removeLayer(heatmapLayersByYearAndCountry[activeYear][activeCountry])
			}
		}
		activeCountry = missing_country_mapping[feature.properties.name] ? missing_country_mapping[feature.properties.name] : feature.properties.name;
		if (heatmapLayersByYearAndCountry[activeYear][activeCountry]) {
			map.addLayer(heatmapLayersByYearAndCountry[activeYear][activeCountry])
		}
		$(".country-name").text(activeCountry)
		map.fitBounds(layer.getBounds(), {maxZoom: maxZoom})
		window.setTimeout(() => map.panBy(L.point(-400, 0)), 500)
		CountryGraphs.updateGraphs(activeCountry, activeYear)
	}

	var closeCountryPanel = function () {
		$("#graph-container").slideUp()
		map.setView([30, 0], minZoom);
		if (heatmapLayersByYearAndCountry[activeYear] && heatmapLayersByYearAndCountry[activeYear][activeCountry]) {			
			map.removeLayer(heatmapLayersByYearAndCountry[activeYear][activeCountry])
		}
		activeLayer.setStyle(countryBoundaryStyle)
		activeCountry = ""
		updateActiveYear(activeYear)
	}

	var myOnEachFeature = function (feature, layer) {
		countryInfoMap[feature.id] = {
			"id": feature.id,
			"name": feature.properties.name
		}
		layer.on({
			click: (e) => {
				activateCountry(feature, layer)
				window.setTimeout(() => layer.setStyle(countryBoundaryActiveStyle), 500)
				activeLayer = layer
			}, 
			mouseover: (e) => layer.setStyle(countryBoundaryHoverStyle),
			mouseout: (e) => layer.setStyle(countryBoundaryStyle)
		})
	}
	var generateHeatmapLayers = function (attacksGroupedByYear) {
		var years = _.keys(attacksGroupedByYear)
		_.each(years, function (year) {
			var cfg = {
				"radius": 2,
				"maxOpacity": .7, 
				"scaleRadius": true, 
				"useLocalExtrema": true,
				latField: 'lat',
				lngField: 'lon',
				valueField: 'no_attacks'
			};
			var heatmapLayer = new HeatmapOverlay(cfg);
			heatmapLayer.setData({data: attacksGroupedByYear[year]})
			heatmapLayerByYear[year] = heatmapLayer
			var attacksGroupedByCountry = _.groupBy(attacksGroupedByYear[year], "country")
			heatmapLayersByYearAndCountry[year] = heatmapLayersByYearAndCountry[year] || {}
			_.forEach(attacksGroupedByCountry, function (attacks, country) {
				var insidecfg = {
					"maxOpacity": .3, 
					"scaleRadius": true, 
					"useLocalExtrema": true,
					latField: 'lat',
					lngField: 'lon',
					valueField: 'no_attacks'
				};
				var hml = new HeatmapOverlay(insidecfg);
				hml.setData({data: attacks})
				heatmapLayersByYearAndCountry[year][country] = hml
			})
		})
	}

	$("#map-controls li").click(function () {
		updateActiveYear(parseInt($(this).data("year")))
	})

	$.get("data/countries.geo.json").done(function (data) {
		worldBoundariesLayer = L.geoJson(data, {
			onEachFeature: myOnEachFeature,
			style: countryBoundaryStyle
		});
		worldBoundariesLayer.addTo(map)
	})
	CountryGraphs.setup($("#slider-container"))
	CountryGraphs.getCountryYearAttacks().done(function (data) {
		generateHeatmapLayers(data)
	}).then(function () {
		updateActiveYear(activeYear)
		hideLoadingIndicator()
	})
	$("#close-button").click(closeCountryPanel)
})
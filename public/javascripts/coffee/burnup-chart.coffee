window.createBurnupChart = (selector, width, height, sprintData)->
	d3 = window.d3

	padding = 
		top: 10
		left: 30
		bottom: 20
		right: 20

	container = d3.select(selector)

	canvas = container.append('svg')
	canvas.attr('width', width)
	canvas.attr('height', height)

	# -- fixing up Date
	Date.prototype.addDays = (daysCount)->
		result = new Date()
		result.setDate(@getDate() + daysCount)
		return result

	# -- scales
	timeScale = d3.time.scale()
	timeScale.domain([sprintData.start, sprintData.end])
	timeScale.range([padding.left, width - padding.right])

	pointScale = d3.scale.linear()
	pointScale.domain([0, d3.max(sprintData.donePointsPerDay)])
	pointScale.range([height - padding.bottom, padding.top])

	predictionScale = d3.scale.linear()
	predictionScale.domain([0, sprintData.donePointsPerDay.length-1])
	predictionScale.range([0, sprintData.pointVolume])

	predictionLine = d3.svg.line()
	predictionLine.x (d,i)=>
		timeScale(sprintData.start.addDays(i))
	predictionLine.y (d,i)=>
		pointScale(Math.floor(predictionScale(i)))
	predictionLine.interpolate('monotone')

	# -- prediction
	canvas.append('path')
		.attr("class", "prediction")
		.attr("d", predictionLine(sprintData.donePointsPerDay))
		# .attr("x1", timeScale(sprintData.start))
		# .attr("y1", pointScale(0))
		# .attr("x2", timeScale(sprintData.end))
		# .attr("y2", pointScale(sprintData.pointVolume))

	# -- points
	progressLine = d3.svg.line()
	progressLine.x (d,i)=>
		timeScale(sprintData.start.addDays(i))
	progressLine.y (d,i)=>
		pointScale(d)
	progressLine.interpolate("monotone")

	canvas.append("path")
		.attr("d", progressLine(sprintData.donePointsPerDay))
		.attr("class", "progress_line")

	points = canvas.selectAll("circle").data(sprintData.donePointsPerDay)
	points.enter().append('circle')
		.attr("class", "data_point")
		.attr("r", 4)
		.attr("cx", (d,i)=>
			timeScale(sprintData.start.addDays(i))
		)
		.attr("cy", (d,i)=>
			pointScale(d)
		)
		.style("fill", (d,i)=>
			if(d < Math.floor(predictionScale(i)))
				return "red"
			else
				return "green"
		)

	# -- setup axis
	xAxis = d3.svg.axis().orient("bottom").scale(timeScale)
	xAxis.tickFormat(d3.time.format('%d.')) # day.month
	xAxis.ticks(d3.time.days, 1)
	canvas.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0, #{height - padding.bottom})")
		.call(xAxis)

	yAxis = d3.svg.axis().orient("left").scale(pointScale)
	yAxis.ticks(sprintData.pointVolume / 3)
	canvas.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(#{padding.left}, 0)")
		.call(yAxis)
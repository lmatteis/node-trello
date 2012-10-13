window.createBurnupChart = (selector, width, height, sprintData)->
	d3 = window.d3

	padding=
		top: 10
		left: 30
		bottom: 20
		right: 20

	container = d3.select(selector)

	canvas = container.append('svg')
	canvas.attr('width', width)
	canvas.attr('height', height)

	# -- prepare data
	sprintDaysAll = sprintData.days

	for day in sprintDaysAll
		day.date = new Date(day.day)

	daysWorkedOn = []
	for day in sprintDaysAll
		daysWorkedOn.push(day) if day.totalpoints?

	donepoints = []
	for day in sprintDaysAll
		donepoints.push(day.donepoints)

	start = sprintDaysAll[0].date
	end = sprintDaysAll[sprintDaysAll.length-1].date


	# -- scales
	d = [start, end]
	r = [padding.left, width - padding.right]

	timeScale = d3.time.scale()
		.domain(d)
		.range(r)


	console.log d
	console.log daysWorkedOn[1].date
	console.log timeScale(daysWorkedOn[1].date)
	console.log r

	pointScale = d3.scale.linear()
		.domain([0, d3.max(donepoints)])
		.range([height - padding.bottom, padding.top])

	# predictionScale = d3.scale.linear()
	# predictionScale.domain([0, sprintData.donePointsPerDay.length-1])
	# predictionScale.range([0, sprintData.pointVolume])

	# -- prediction
	# predictionLine = d3.svg.line()
	# predictionLine.x (d,i)=>
	# 	timeScale(start.addDays(i))
	# predictionLine.y (d,i)=>
	# 	pointScale(Math.floor(predictionScale(i)))
	# predictionLine.interpolate('monotone')

	# canvas.append('path')
	# 	.attr("class", "prediction")
	# 	.attr("d", predictionLine(sprintData.donePointsPerDay))

	# -- points
	progressLine = d3.svg.line()
	
	progressLine.x (day)=>
		timeScale(day.date)

	progressLine.y (day)=>
		pointScale(day.totalpoints)

	# progressLine.interpolate("monotone")

	canvas.append("path")
		.attr("d", progressLine(daysWorkedOn))
		.attr("class", "progress_line")

	points = canvas.selectAll("circle").data(daysWorkedOn)
	points.enter().append('circle')
		.attr("class", "data_point")
		.attr("r", 4)
		.attr("cx", (day)=>
			timeScale(day.date)
		)
		.attr("cy", (day)=>
			pointScale(day.totalpoints)
		)
		# .style("fill", (day)=>
		# 	if(d < Math.floor(predictionScale(i)))
		# 		return "red"
		# 	else
		# 		return "green"
		# )

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
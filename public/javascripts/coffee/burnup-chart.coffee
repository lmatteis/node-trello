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

	# - fix up some sample data
	last = 0
	for day in sprintDaysAll
		# 
		if day.donepoints?
			day.donepoints = last + Math.max(0, Math.floor((Math.random() * 3)-1))
			last = day.donepoints
	console.log sprintDaysAll

	for day in sprintDaysAll
		day.date = new Date(day.date)

	daysWorkedOn = []
	for day in sprintDaysAll
		daysWorkedOn.push(day) if day.totalpoints?

	console.log "#{daysWorkedOn.length} of #{sprintDaysAll.length} days are passed"

	donepoints = []
	for day in sprintDaysAll
		donepoints.push(day.donepoints)

	totalpoints = []
	for day in sprintDaysAll
		totalpoints.push(day.totalpoints)

	start = sprintDaysAll[0].date
	end = sprintDaysAll[sprintDaysAll.length-1].date

	console.log "Sprint runs \nfrom\t#{start.toString("dd.MM.yy")}\nto\t\t#{end.toString('dd.MM.yy')}"


	# -- scales
	timeDomain = [start, end]
	timeRange = [padding.left, width - padding.right]

	timeScale = d3.time.scale()
		.domain(timeDomain)
		.range(timeRange)

	window.allDays = sprintDaysAll
	window.ts = timeScale

	console.log "time domain: #{timeDomain}"
	console.log "time range: #{timeRange}"


	# console.log d
	# console.log daysWorkedOn[1].date
	# console.log timeScale(daysWorkedOn[1].date)
	# console.log r

	pointDomain = [0, d3.max(donepoints)]
	pointRange = [height - padding.bottom, padding.top]

	pointScale = d3.scale.linear()
		.domain(pointDomain)
		.range(pointRange)

	console.log "point domain: #{pointDomain}"
	console.log "point range: #{pointRange}"

	predictionScale = d3.scale.linear()

	predictionDomain = [0, d3.max(totalpoints)]
	predictionRange = pointRange

	predictionScale.domain(predictionDomain)
	predictionScale.range(predictionRange)

	console.log "prediction domain: #{predictionDomain}"
	console.log "prediction range: #{predictionRange}"

	# -- prediction
	# predictionLine = d3.svg.line()
	
	# predictionLine.x (day,i)=>
	# 	timeScale(day.date)
	
	# predictionLine.y (day,i)=>
	# 	timeProgress = (i / sprintDaysAll.length)
	# 	pointScale(Math.floor(predictionScale(i)))

	# predictionLine.interpolate('monotone')

	# canvas.append('path')
	# 	.attr("class", "prediction")
	# 	.attr("d", predictionLine(sprintDaysAll))

	# -- points
	progressLine = d3.svg.line()
	
	progressLine.x (day)=>
		timeScale(day.date)

	progressLine.y (day)=>
		pointScale(day.donepoints)

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
			pointScale(day.donepoints)
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
	# xAxis.ticks(d3.time.days, 1)
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
$(document).ready ()->
	teams = [
		{div:'teamA', 	boardId: "4f681edb801cba2d41140478"},
		# {div:'team404', boardId: "4f05b23a7bd9872d743ece95"},
		# {div:'teamXXX', boardId: "50350ea44ac40fb64b0044f4"}
	]

	# charts = $('#burnup_charts')

	for team in teams
		do (team)->
			window.jQuery.getJSON "./api", {boardid: team.boardId}, (sprint)->
				window.createBurnupChart("\##{team.div}", 500, 200, sprint)


	# # 1. Team
	# teamOneSprint=
	# 	start: new Date('2012-10-02')
	# 	end: new Date('2012-10-15')
	# 	donePointsPerDay: [0,0,5,5,5,10,10,10,10,15,15,15,20,25]
	# 	pointVolume: 20

	# createBurnupChart('#team404', 500, 200, teamOneSprint)

	# # 2. Team
	# teamTwoSprint=
	# 	start: new Date('2012-10-02')
	# 	end: new Date('2012-10-15')
	# 	donePointsPerDay: [0,0,0,0,3,3,8,8,8,18,18,18,18,19]
	# 	pointVolume: 20

	# createBurnupChart('#teamXXX', 500, 200, teamTwoSprint)

	# window.t1 = teamOneSprint
	# window.t2 = teamTwoSprint
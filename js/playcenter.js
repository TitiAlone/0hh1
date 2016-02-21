// Play Services and Game Center middleware
// Note: this file is not referenced or used in the public source code of 0h h1
// but this file is here for reference only.
var PlayCenter = new (function() {
	
	var Platform = {
			None: 			0,
			Google: 		1,
			Apple: 			2,
			WebConsole: 3
	};

	var self = this,
			enabled = false,
			isSignedIn = false,
			platform = Platform.None,
			debug = false;

	if (!window.isWebApp) {
		if ($.browser.android) {
			platform = Platform.Google;
			enabled = true;
			$('html').addClass('playcenter');
		}
		if ($.browser.ios) {
			platform = Platform.Apple;
			enabled = true;
			$('html').addClass('playcenter');
		}
	}

	//enabled = true; platform = Platform.Apple; 
	//$('html').addClass('playcenter');
	//window.isWebApp = false;

	// define ids used for leaderboards and achievements
	this.IDS = {
		Leaderboards: {
		  'score': 										{ id: '', 1: '', 2: '' },
		  'games_played': 						{ id: '', 1: '', 2: '' },
		  'best_time': 								{ id: '', 1: '', 2: '' },
		  '_4_x_4_played': 						{ id: '', 1: '', 2: '' },
		  '_6_x_6_played': 						{ id: '', 1: '', 2: '' },
		  '_8_x_8_played': 						{ id: '', 1: '', 2: '' },
		  '_10_x_10_played': 					{ id: '', 1: '', 2: '' },
		  'best_time_4_x_4': 					{ id: '', 1: '', 2: '' },
		  'best_time_6_x_6': 					{ id: '', 1: '', 2: '' },
		  'best_time_8_x_8': 					{ id: '', 1: '', 2: '' },
		  'best_time_10_x_10': 				{ id: '', 1: '', 2: ''  }
		},
		Achievements: {
		  'apprentice': 							{ id: '', 1: '', 2: '' },
		  'allfour': 									{ id: '', 1: '', 2: '' },
		  '_160_dots': 								{ id: '', 1: '', 2: '' },
		  '_360_dots': 								{ id: '', 1: '', 2: '' },
		  '_640_dots': 								{ id: '', 1: '', 2: '' },
		  '_1000_dots': 							{ id: '', 1: '', 2: '' },
		  'ten': 											{ id: '', 1: '', 2: '' },
		  'q42': 											{ id: '', 1: '', 2: '' },
		  'quitter': 									{ id: '', 1: '', 2: '' },
		  'how_very_social_of_you': 	{ id: '', 1: '', 2: '' },
		  'happy_lock_toggler': 			{ id: '', 1: '', 2: '' },
		  'no_questions_asked_4_x_4': { id: '', 1: '', 2: '' },
		  'no_questions_asked_6_x_6': { id: '', 1: '', 2: '' },
		  'no_questions_asked_8_x_8': { id: '', 1: '', 2: '' },
		  'no_questions_asked_10_x_10': { id: '', 1: '', 2: '' },
		  'forward_4_x_4': 						{ id: '', 1: '', 2: '' },
		  'forward_6_x_6': 						{ id: '', 1: '', 2: '' },
		  'forward_8_x_8': 						{ id: '', 1: '', 2: '' },
		  'forward_10_x_10': 					{ id: '', 1: '', 2: ''  }
		}
	};

	// send all unlocked achievements that are still in the outbox
	function sendUnSentUnlockedAchievements() {
		var idsToSend = Storage.getDataValue('achievementsNotSent', {});
		for (var id in idsToSend) {
			var achievementObj = self.IDS.Achievements[id];
			self.unlockAchievement(achievementObj);
		}
	}

	// automatically sign in only if the user hasn't explicitly declined or signed out
	this.autoSignIn = function() {
    var autoSignIn = Storage.getDataValue('autoSignIn', true);
    if (debug) alert('autoSignIn ' + autoSignIn);
    if (autoSignIn)
      PlayCenter.signIn(true);		
	}

	// sign in to the platform's game service
	this.signIn = function (auto) {

		// generic sign in success handler
		function success(obj) {
			isSignedIn = true;
			$('html').removeClass('signed-out').addClass('signed-in');

			if (platform == Platform.Apple) {
				// when signing in this session, remove the button
				$('#menu #bar').html('');
				
				//self.resetAchievements();
			}

			// once signedIn, set autoSignIn to true until the user chooses to sign out
			Storage.setDataValue('autoSignIn', true);
			sendUnSentUnlockedAchievements();
			if (debug) alert('signed in success: ' + JSON.stringify(obj))
		}

		// generic sign in fail handler
		function fail(obj) {
			// if autosignin failed or user chose not to sign in, disable autoSignIn
			Storage.setDataValue('autoSignIn', false);
			
			// when signing in this session didn't succeed, don't offer signin button as it won't work
			// (Apple remembers user decision and won't show popup again...)
			if (platform == Platform.Apple) {
				//$('#menu #bar').html('');
			}

			var errorMsg = JSON.stringify(obj);
			if (!auto && /error/.test(errorMsg.toLowerCase(), 'gi')) {
				if (platform == Platform.Apple) {
					Game.showMessage('<p>Signing in with Game Center didn\'t work.</p><p>Please check your internet connection.</p><p>If this problem persists, open the Settings app, go to Game Center and sign in there.</p><p>If that doesn\'t work, give up and go play 0h n0 :)</p>')
				}
				else if (platform == Platform.Android) {
					Game.showMessage('<p>Signing in with Google Play Game Services didn\'t work.</p><p>Please check your internet connection.</p><p>If this problem persists, try again later or give up and go play 0h n0 :)</p>')
				}
			}

			if (debug) alert('sign in failed: ' + JSON.stringify(obj))
		}

		if (enabled) {
			if (platform == Platform.None) {
			}
			if (platform == Platform.Google) {
				googleplaygame.auth(success, fail);
			}
			if (platform == Platform.Apple) {
				gameCenter.authenticate(success, fail)
			}
			if (platform == Platform.WebConsole) {
				console.log('PlayCenter: Signed In');
				success();
			}
		}
	}

	// sign out of the platform's game services
	this.signOut = function(handler) {
		
		function success() {
			isSignedIn = false;
			// remember that this user chose not to be signed in
			Storage.setDataValue('autoSignIn', false);
			$('html').addClass('signed-out').removeClass('signed-in');
			if (handler) handler();
		}

		if (enabled && isSignedIn) {
			if (platform == Platform.None) {
			}
			if (platform == Platform.Google) {
				googleplaygame.signOut(success);
			}
			if (platform == Platform.Apple) {
			}
			if (platform == Platform.WebConsole) {
				console.log('PlayCenter: Signed Out');
				success();
			}
		}
	}

	// submit a score for the id object as defined above
	this.submitScore = function(leaderboardObj, score) {
		// achievementObj contains internal system id, plus each platform's specific id
		var id = leaderboardObj? leaderboardObj.id : undefined,
				platformId = leaderboardObj? leaderboardObj[platform] : undefined,
				isTime = leaderboardObj? leaderboardObj.isTime : false;

		// if this is a time score, it is received in milliseconds, but iOS wants it in seconds
		if (isTime) {
			if (platform == Platform.Apple) {
				score = parseInt(score / 1000);
			}
		}

		if (enabled && isSignedIn && id) {
			if (platform == Platform.None) {
			}
			if (platform == Platform.Google && platformId) {
				if (debug) alert('Submit ' + id + ' score ' + score);
				googleplaygame.submitScore({
					leaderboardId: platformId,
					score: score
				});
			}
			if (platform == Platform.Apple) {
				if (debug) alert('Submit ' + id + ' score ' + score);

				gameCenter.reportScore(platformId, score, function(obj) {
					if (debug) alert('submit success: ' + JSON.stringify(obj))
				}, function(obj) {
					if (debug) alert('submit fail: ' + JSON.stringify(obj))
				});
			}
			if (platform == Platform.WebConsole) {
				console.log('PlayCenter: Submit score - ' + score + ' to ' + id);
			}
		}
	}

	// id = specific leaderboard. If none provided, show all
	this.showLeaderboard = function(id) {
		if (enabled && isSignedIn) {
			if (platform == Platform.None) {
			}
			if (platform == Platform.Google) {
				if (!id)
					googleplaygame.showAllLeaderboards();
				else
					googleplaygame.showLeaderboard(id);
			}
			if (platform == Platform.Apple) {
				gameCenter.showAllLeaderboards(null, function(obj) {
						if (debug) alert('showLeaderboard success ' + JSON.stringify(obj))
					}, function(obj) {
						if (debug) alert('showLeaderboard failed ' + JSON.stringify(obj))
					});
			}
			if (platform == Platform.WebConsole) {
				console.log('PlayCenter: Show leaderboard');
			}
		}
	}

	// Unlock an achievement given by the achievement object as defined above
	// Example: 
	//
	// 		PlayCenter.unlockAchievement(PlayCenter.IDS.Achievements.apprentice);
	//
	this.unlockAchievement = function (achievementObj) {
		// achievementObj contains internal system id, plus each platform's specific id
		var id = achievementObj? achievementObj.id : undefined,
				platformId = achievementObj? achievementObj[platform] : undefined;

		function success() {
			// if it was succesfully sent, mark it so
			Storage.achievementSent(id);
		}

		// first, store that this achievement was unlocked
		Storage.achievementUnlocked(id);

		if (enabled && isSignedIn && id) {
			if (platform == Platform.None) {
			}
			if (platform == Platform.Google && platformId) {
				googleplaygame.unlockAchievement({
					achievementId: platformId
				}, success);
			}
			if (platform == Platform.Apple && platformId) {
				gameCenter.reportAchievement(platformId, success, function(obj) {
					if (debug) alert('failed to report achievement: ' + JSON.stringify(obj))
				})
			}
			if (platform == Platform.WebConsole) {
				console.log('PlayCenter: Unlock achievement - ' + id);
				success();
			}
		}
	}
	
	this.showAchievements = function() {
		if (enabled && isSignedIn) {
			if (platform == Platform.None) {
			}
			if (platform == Platform.Google) {
				googleplaygame.showAchievements();
			}
			if (platform == Platform.Apple) {
				gameCenter.showAchievements();
			}
			if (platform == Platform.WebConsole) {
				console.log('PlayCenter: Show achievements');
			}
		}
	}

	this.resetAchievements = function() {
		if (enabled && isSignedIn) {
			if (platform == Platform.None) {
			}
			if (platform == Platform.Google) {
			}
			if (platform == Platform.Apple) {
				gameCenter.resetAchievements();
			}
			if (platform == Platform.WebConsole) {
				console.log('PlayCenter: Show achievements');
			}
		}
	}

	this.__defineGetter__('enabled', function() { return enabled; });
	this.__defineGetter__('isSignedIn', function() { return isSignedIn; });
})();
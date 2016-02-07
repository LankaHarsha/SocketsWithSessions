angular.module('sessionApp').controller('sessionAppController', function($scope, $state) {

	$state.go('login');

}).controller('loginController', function($scope, loginService, $state, authenticateService) {

	$scope.user = {};
	$scope.login = function() {

		var successLogin = function(response) {

			
			if(response.status==="S") {

				authenticateService.user = response.data;
				authenticateService.isAuthenticated = true;
				$state.go('main');
			}else{

				console.log(data.message);
			}
		}

		var failureLogin = function(data) {

			console.log(data);
		}
		loginService.login($scope.user).then(successLogin,failureLogin);
	}

}).controller('mainController', function($scope, socketFactory) {

	console.log("Entered to main controller");
	socketFactory.on('message',function(message) {

		console.log("This is message");
		console.log(message);
	});
	socketFactory.on('groupMessage', function(message){
		console.log(message);
	})
})

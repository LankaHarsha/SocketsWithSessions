angular.module('sessionApp').service('loginService', function($q, $http) {

	this.login = function(data) {

		var deffered = $q.defer();
		var query = {
			method: 'POST',
			url: '/login',
			data: data
		}

		$http(query).then(function(response) {

			console.log("Resolve");
			deffered.resolve(response.data);

		},function(response) {

			console.log("Reject");
			deffered.reject(response);
		})

		return deffered.promise;

	}
}).service('authenticateService', function() {

	this.user = null;
	this.isAuthenticated = false;

}).service('validateService', function($q, $http) {

	this.verifyUser = function(){
		
		var deffered = $q.defer();
		var query = {
			method: 'GET',
			url:'/verify'
		};
		$http(query).then(function(response){

			deffered.resolve(response.data);
		}, function(response){

			deffered.reject(response);
		})
		return deffered.promise;
	}
})
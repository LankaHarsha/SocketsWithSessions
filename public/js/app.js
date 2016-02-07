var sessionApp =angular.module('sessionApp', ['ui.router']);

sessionApp.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider.state('login', {

		url:'/login',
		title: 'Login Page',
		templateUrl:'partials/login.html'
	}).state('main', {

		url:'/main',
		title: 'Restricted Page',
		templateUrl: 'partials/main.html',
		authRequired: true
	});

	$urlRouterProvider.otherwise('/login');
});

sessionApp.run(function($rootScope, authenticateService, validateService, $state, $location){ 

	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

		if(authenticateService.isAuthenticated === false && toState.authRequired) {

			event.preventDefault();
			$state.go('login');
		}
		console.log(toState);
		console.log(authenticateService.isAuthenticated);
		if(toState.name==='login' && authenticateService.isAuthenticated){
			event.preventDefault();
		}
	});

	validateService.verifyUser().then(function(response){

		authenticateService.user = response.data;
		authenticateService.isAuthenticated = true;
		console.log($location)
		if($location.path()==='/login') {
			$state.go('main');
		}else {
			console.log("Entered-----");
			console.log($location.path().slice(1,$location.path().length));
			$state.go($location.path().slice(1,$location.path().length))
		}

	},function(response){

		console.log(response);
	});
});


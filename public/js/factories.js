angular.module('sessionApp').factory('socketFactory', function($rootScope) {

    var socketFactory = {};
    var Socket = io.connect('http://localhost:8000');
    console.log(Socket);

    socketFactory.on = function(eventName, callback) {

        Socket.on(eventName, function(data) {

            $rootScope.$apply(function() {

                if(callback) {

                    callback.call(Socket, data);
                }
            });
        });
    };

    socketFactory.emit = function(eventName, data, callback) {

        if(!callback) {

            Socket.emit(eventName, data);
        } else {

            Socket.emit(eventName,data, function(data) {

                $rootScope.$apply(function(){

                    callback.call(Socket, data);
                });
            });
        }
    };
    return socketFactory;
})
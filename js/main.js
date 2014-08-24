"use strict"

var app = angular.module('myApp', []);

app.directive('imageonload', function($log) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                $log.debug('loaded');
                scope.$emit('onImageLoaded');
            });
        }
    };
});

app.controller('MainCtrl', function($scope, $timeout, $log) {
    var API_KEY = "kp53f70d2f150798.04074610";
    var HIDE_MILLISECONDS = 3000;
    var AUTO_NEXT_MILLISECONDS = 2000;

    var numbers = []
    var pre_selected_photo_index = null;
    var selected_photo = null;
    var pass = 0;
    var lock = 0;

    $scope.num_of_total_hearts = 10;
    $scope.num_of_pass = 0;
    $scope.num_of_wrong = 0;
    $scope.photos = [];
    $scope.show = [];
    $scope.to_next = false;
    $scope.is_loading = false;
    $scope.num_of_loaded = 0;
    $scope.auto_next_enabled = false;

    $scope.$on('onImageLoaded', function(){
        $scope.num_of_loaded++;
        if($scope.num_of_loaded == 6){
            $log.debug('AllImageLoaded');
            $scope.is_loading = false;

            var hide_milliseconds = HIDE_MILLISECONDS - $scope.num_of_pass * 100;
            if(hide_milliseconds<0){
                hide_milliseconds = 100;
            }
            $scope.num_of_loaded = 0;
            $scope.$apply();
            startTimer();

            $timeout(hideAll, hide_milliseconds);
        }
    });

    $scope.guess = function(photo_url, index){
        if(lock==2){
            return;
        }else{
            lock++;
        }
        $log.debug("index", index);
        $scope.show[index] = true;
        if(selected_photo==null){
            selected_photo = photo_url;
            pre_selected_photo_index = index;
        }else if(selected_photo==photo_url){
            $log.debug("congrats");
            selected_photo = null;
            pass++;
            lock = 0;
            if(pass==3){
                $scope.num_of_pass++;
                $scope.to_next = true;
                pass = 0;

                stopTimer();

                if($scope.auto_next_enabled){
                    $timeout($scope.init, AUTO_NEXT_MILLISECONDS);
                }
            }
        }else{
            $log.debug("wrong");
            $scope.num_of_wrong++;
            selected_photo = null;


            if($scope.num_of_wrong == $scope.num_of_total_hearts){
                $scope.is_failed = true;
                return;
            }

            $timeout(function(){
                $log.debug("hide two", pre_selected_photo_index, index);
                $scope.show[pre_selected_photo_index] = false;
                $scope.show[index] = false;
                lock = 0;
            }, 700);

        }
    }

    var getAlbums = function(){
        $.ajax({
              url: "http://api.kptaipei.tw/v1/albums/?accessToken="+API_KEY,
              success: function(resp){
                  $log.debug("albums", resp);
                  var rand = getRand(0, resp.pageInfo.totalResults-1);
                  var album_id = resp.data[rand].id;
                  getPhotosInAlbum(album_id);

              }
        });
    }

    var getPhotosInAlbum = function(album_id){
        $.ajax({
              url: "http://api.kptaipei.tw/v1/albums/"+album_id+"?accessToken="+API_KEY,
              success: function(resp){
                  if(resp.pageInfo.totalResults > 3){

                      numbers = getRands(0, resp.pageInfo.totalResults-1, 3);
                      $log.debug("numbers", numbers);
                      numbers = numbers.concat(numbers);
                      $log.debug("numbers double", numbers);

                      var shuffled_numbers = shuffle(numbers);
                      for(var i=0; i<shuffled_numbers.length; i++){
                          var photo_url = resp.data.photos[shuffled_numbers[i]].images.large_square;
                          $scope.photos[i] = photo_url;
                      }
                      $log.debug("photos", $scope.photos);
                      $scope.$apply();

                  }
              }
        });
    }

    var getRand = function(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var getRands = function(min, max, num){
        var arr = []
        while(arr.length < num){
            var randomnumber=Math.floor(Math.random() * (max - min + 1)) + min;
            var found=false;
            for(var i=0;i<arr.length;i++){
                if(arr[i]==randomnumber){found=true;break}
            }
            if(!found)arr[arr.length]=randomnumber;
        }
        return arr;
    }

    var shuffle = function(array) {
      var currentIndex = array.length, temporaryValue, randomIndex ;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }

    var showAll = function(){
        $scope.show = [true, true, true, true, true, true];
    }

    var hideAll = function(){
        $scope.show = [false, false, false, false, false, false];
    }


    $scope.getNumber = function(num) {
        return new Array(num);
    }

    $scope.init = function(){
        $scope.is_loading = true;
        getAlbums();
        showAll();
        $scope.to_next = false;
    }


    // timer
    var stopWatch = new jtl.stopWatch();

    function startTimer() {
        if(stopWatch.start()!=null){
            stopWatch.executeOnRefresh(refresh);
            var value= stopWatch.splittime();
            $('#timer').find('.value').text(toTime(value));
        }
    }

    function stopTimer(){
    	var value = stopWatch.stoptime();
    	if(value==null)return;
    	$('#timer').find('.value').text(toTime(value));
        $('#start_button').removeClass('disabled');
        //stopWatch.resettime();
    }


    function toTime(_time){
    	if(_time==null)return '';
    	if(_time.negative)return ('-'+_time.hh+':'+_time.mm+':'+_time.ss+'.'+_time.ms);
     	return (_time.hh+':'+_time.mm+':'+_time.ss+'.'+_time.ms);
    }

    function refresh(){
    	var value= stopWatch.splittime();
    	if (value!=null) $('#timer').find('.value').text(toTime(value));
    }
    // timer

    $scope.init();
});

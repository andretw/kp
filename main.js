"use strict"
function MainCtrl($scope, $timeout) {
    var API_KEY = "kp53f70d2f150798.04074610";
    var numbers = []
    var pre_selected_photo_index = null;
    var selected_photo = null;
    var pass = 0;

    $scope.num_of_pass = 0;
    $scope.num_of_wrong = 0;
    $scope.photos = [];
    $scope.show = [];
    $scope.to_next = false;

    $scope.guest = function(photo_url, index){
        console.log("index", index);
        $scope.show[index] = true;
        if(selected_photo==null){
            selected_photo = photo_url;
            pre_selected_photo_index = index;
        }else if(selected_photo==photo_url){
            console.log("congrats");
            selected_photo = null;
            pass++;
            if(pass==3){
                $scope.num_of_pass++;
                $scope.to_next = true;
                pass = 0;
            }
        }else{
            console.log("wrong");
            $scope.num_of_wrong++;
            selected_photo = null;

            $timeout(function(){
                console.log("hide two", pre_selected_photo_index, index);
                $scope.show[pre_selected_photo_index] = false;
                $scope.show[index] = false;
            }, 700);

        }
    }

    var getAlbums = function(){
        $.ajax({
              url: "http://api.kptaipei.tw/v1/albums/?accessToken="+API_KEY,
              success: function(resp){
                  console.log("albums", resp);
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
                      console.log("numbers", numbers);
                      numbers = numbers.concat(numbers);
                      console.log("numbers double", numbers);

                      var shuffled_numbers = shuffle(numbers);
                      for(var i=0; i<shuffled_numbers.length; i++){
                          var photo_url = resp.data.photos[shuffled_numbers[i]].images.large_square;
                          $scope.photos[i] = photo_url;
                      }
                      console.log("photos", $scope.photos);
                      $timeout(hideAll, 3000 - $scope.num_of_pass * 100);
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

    $scope.init = function(){
        getAlbums();
        showAll();
        $scope.to_next = false;
    }

    $scope.init();
}

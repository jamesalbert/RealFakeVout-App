angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, Voat, $cordovaInAppBrowser, $ionicActionSheet, $ionicSlideBoxDelegate, $ionicNavBarDelegate, $ionicScrollDelegate) {
  /*
    get functions
  */
  Voat.get_posts().then(function(posts) {
    /* initial settings */
    $scope.currentIndex = 1;
    $scope.cachedScroll = 0;
    $ionicSlideBoxDelegate.enableSlide(false);
    $ionicSlideBoxDelegate.slide($scope.currentIndex);
    $ionicNavBarDelegate.showBackButton(true)
    $scope.posts = posts;
    $scope.title ='<img class="title-image" src="img/voat-logo.png" />';
  })

  Voat.get_subverses().then(function(subverses) {
    console.log(subverses);
    $scope.subverses = subverses;
  })

  $scope.getVPosts = function(subverse) {
    Voat.get_v_posts(subverse).then(function(posts) {
      $scope.posts = posts;
      $scope.goToSlide(1);
    })
  }

  /*
  menu functions
  */

  $scope.showMenu = function() {
    var hidesheet = $ionicActionSheet.show({
      buttons: [
        {text: "User's Profile"}
      ],
      destructiveText: 'drop table',
      titleText: 'Voat',
      cancelText: 'cancel',
      cancel: function() {},
      buttonClicked: function(index) {
        if (index == 0) {
          name = $scope.focused_post.Name;
          Voat.get_userinfo(name).then(function(user) {
            $scope.focused_user = user;
          })
          $scope.goToSlide(3)
        }
        return true;
      }
    })
  }

  /*
  slide truth functions
  */
  $scope.manageSlides = function(i) {
    $scope.currentIndex = i;
  }

  $scope.canGoBack = function() {
    return $scope.currentIndex > 1;
  }

  $scope.onPosts = function() {
    return $scope.currentIndex == 1;
  }

  $scope.inSettings = function() {
    return $scope.currentIndex == 0;
  }

  /*
  slide control functions
  */

  $scope.goBack = function() {
    $ionicSlideBoxDelegate.slide($scope.currentIndex-1);
    $ionicScrollDelegate.scrollTo(0, $scope.cachedScroll);
    if ($scope.currentIndex == 1) {
      $scope.comments = [];
    }
  }

  $scope.goToSlide = function(slide) {
    $ionicSlideBoxDelegate.slide(slide);
  }

  $scope.goto = function(post) {
    if ($scope.isUrl(post.MessageContent)) {
      $cordovaInAppBrowser.open(post.MessageContent, '_system');
    }
    else {
      $scope.focus_on(post);
    }
  }

  /*
  focus functions (changes the current focus or state)
  */

  $scope.refocus_post = function(post) {
    /*
    brings up the comment page of any post
    */
    $scope.focused_post = post
    $scope.comments = Voat.get_comments(post.Id).then(function(comments) {
      $scope.comments = comments;
    })
    $scope.cachedScroll = $ionicScrollDelegate.getScrollPosition().top
    $ionicSlideBoxDelegate.next()
    $ionicNavBarDelegate.showBackButton(true)
    $ionicScrollDelegate.scrollTop();
  }

  $scope.focus_on = function(post) {
    /*
    focus_on gets called before refocus_post because
    it tries to open up a potential image/video without comments.
    If the post is entirely text or if a particular part of the
    post was clicked, it calls refocus_post.
    */
    if (!post.MessageContent) {
      $scope.refocus_post(post);
      return;
    }
    if ($scope.isUrl(post.MessageContent)) {
      $cordovaInAppBrowser.open(post.MessageContent, '_system');
    }
    else {
      post.MessageContent = post.MessageContent.replace(/\[(.+)\]\((.+?)\)/, "<a href='$2'>$1</a>");
      $scope.refocus_post(post);
    }
  }

  /*
  utility functions
  */
  $scope.isUrl = function(s) {
    /*
    asserts whether `s` is a url or not
    */
    var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(s);
  }

  $scope.timeDiff = function timeDifference(previous_timestamp) {
    /*
    takes a timestamp and returns an X unit ago
    */
    var current = new Date();
    var previous = new Date(previous_timestamp)
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;
    var elapsed = current - previous;
    if (elapsed < msPerMinute) {
      return Math.round(elapsed/1000) + ' seconds ago';
    }
    else if (elapsed < msPerHour) {
      return Math.round(elapsed/msPerMinute) + ' minutes ago';
    }
    else if (elapsed < msPerDay ) {
      return Math.round(elapsed/msPerHour ) + ' hours ago';
    }
    else if (elapsed < msPerMonth) {
      return Math.round(elapsed/msPerDay) + ' days ago';
    }
    else if (elapsed < msPerYear) {
      return Math.round(elapsed/msPerMonth) + ' months ago';
    }
    else {
      return Math.round(elapsed/msPerYear ) + ' years ago';
    }
  }
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});

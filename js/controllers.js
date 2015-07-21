angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, Voat, $sce, $ionicTabsDelegate, $ionicListDelegate, $ionicLoading, $cordovaProgress, $cordovaInAppBrowser, $ionicActionSheet, $ionicSlideBoxDelegate, $ionicNavBarDelegate, $ionicScrollDelegate) {
  /*
    starter function
  */

  function load_initial_app() {
    /*
    sets global variables:
      currentPage  - which page the user is on
      currentIndex - which slide the user is on
      cachedScroll - cached scroll value for main posts list

    loads initial posts list
    loads subverse list
    */
    $scope.currentSubverse = '_default';
    $scope.showPostMenu = false;
    $scope.currentPage = 1;
    $scope.previousIndex;
    $scope.currentIndex = 1;
    $scope.currentSubmissionTab = 0;
    $scope.cachedScroll = 0;
    $scope.isEditting = false;
    $scope.rightButton = {
      clickCallback: $scope.goToPosts,
      text: 'Voat <i class="ion-ios-arrow-forward"></i>'
    }
    $scope.defaultRightButton = $scope.rightButton;
    $scope.load_posts($scope.load_posts_callback);
    $scope.subverses = Voat.get_subverses();
  }

  /*
    navigation controls
  */

  $scope.goBack = function() {
    /*
    go to the previous slide
    */
    $ionicSlideBoxDelegate.previous();
    if ($scope.onPosts()) {
      // revert to previous scroll value
      $ionicScrollDelegate.scrollTo(0, $scope.cachedScroll);
      // clear comments if user goes back to posts list
      $scope.comments = [];
    }
    else if ($scope.onPost()) {
      // clear focused_user if user goes back to comments page
      $scope.focused_user = undefined;
    }
  }

  $scope.goToSlide = function(slide) {
    /*
      go to specified slide
    */
    $ionicSlideBoxDelegate.slide(slide);
  }

  $scope.goToPrevious = function() {
    /*
      go to previous slide; allows for jumping past many slides
    */
    $scope.goToSlide($scope.previousIndex);
  }

  $scope.clearAccountSlide = function() {
    /*
      ensure focused_user is cleared if sliding back from account
    */
    $scope.focused_user = undefined;
    $scope.userItems = undefined;
  }

  $scope.goToSettings = function() {
    /*
    go to settings
    */

    // cache current scroll position
    $scope.cachedScroll = $ionicScrollDelegate.getScrollPosition().top;
    // go to settings slide
    $scope.goToSlide(0);
    // clear account items
    $scope.clearAccountSlide();
    // scroll to the top of the page
    $ionicScrollDelegate.scrollTop();
  }

  $scope.goToPosts = function() {
    /*
      go to main posts
    */

    // go to the posts list slide
    $scope.goToSlide(1);
    // scroll back to the cached scroll position
    $ionicScrollDelegate.scrollTo(0, $scope.cachedScroll);
  }

  $scope.goToPost = function() {
    /*
      go to clicked post
    */

    // go to the post slide
    $scope.goToSlide(2);
    // clear account items
    $scope.clearAccountSlide();
    // scroll to the top of the page
    $ionicScrollDelegate.scrollTop();
    // open comments
    $scope.openPostComments($scope.focused_post);
  }

  $scope.goToAccount = function() {
    /*
      go to a specified user's account
    */

    if ($scope.onSettings()) {
      var name = $scope.focused_user.userName;
    }
    else {
      var name = $scope.focused_post.userName;
    }
    // go to the account slide
    $scope.goToSlide(3)
    Voat.get_user('submissions', name).then(function(result) {
      //console.log(result);
      $scope.userItems = result.items;
    })
    // scroll to the top of the page
    $ionicScrollDelegate.scrollTop();
  }

  $scope.goToMyAccount = function() {
    /*
      go to the logged-in user's account
    */

    // check if logged in
    if (window.localStorage['access_token']) {
      $scope.showLoading();
      // set focused_user
      name = window.localStorage['user']
      Voat.get_user('info', name).then(function(user) {
        $scope.focused_user = user;
        // go to account slide
        $scope.goToAccount();
        $scope.hideLoading();
      })
    }
    else {
      // if not logged in, go to login slide
      $scope.goToLogin();
    }
  }

  $scope.goToLogin = function() {
    /*
      go to login page
    */
    $scope.goToSlide(4);
  }

  $scope.goToSubmission = function() {
    /*
      go to submission page
    */
    $scope.cachedScroll = $ionicScrollDelegate.getScrollPosition().top;
    $scope.goToSlide(5);
  }

  /*
    toggle commands
  */

  $scope.togglePostMenu = function() {
    $scope.showPostMenu = !$scope.showPostMenu;
    console.log($scope.showPostMenu);
  }

  $scope.updateTabs = function(index) {
    $('.tab-item').removeClass('active');
    $('#tab_'+index).addClass('active');
  }

  $scope.updateAccountTabs = function(index) {
    $scope.updateTabs(index);
    $scope.currentSubmissionTab = index;
    $scope.userItems = undefined;
    name = $scope.focused_user.userName;
    if (index == 0) {
      Voat.get_user('submissions', name).then(function(result) {
        //console.log(result);
        $scope.userItems = result.items;
      })
    }
    else if (index = 1) {
      Voat.get_user('comments', name).then(function(result) {
        //console.log(result);
        $scope.userItems = result.items;
      })
    }
    // scroll to the top of the page
    $ionicScrollDelegate.scrollTop();
  }

  $scope.updateSubmissionTabs = function(index) {
    $scope.updateTabs(index);
  }

  $scope.onLinkSubmission = function() {
    return $('#tab_0').hasClass('active');
  }

  /*
    user commands
  */

  $scope.test = function() {
    alert('worked');
  }

  $scope.refresh = function() {
    /*
      overwrite the list of posts with new posts
    */
    if ($scope.onPosts()) {
      // refresh posts if on posts page
      $scope.load_posts($scope.load_posts_callback);
    }
    else {
      // refresh comments if on comments page
      $scope.load_comments($scope.focused_post.id);
    }
  }

  $scope.submitPost = function() {
    $scope.showLoading();
    payload = {
      title: $('#title').val(),
      subverse: $('#subverse').val()
    }
    if ($scope.onLinkSubmission()) {
      payload.url = $('#link').val();
    }
    else {
      payload.content = $('#content').val();
    }
    Voat.submit_post(payload).then(function(response) {
      console.log(response);
      if (!response.data.success) {
        alert(response.data.data.message);
        return;
      }
      $scope.focused_post = response.data.data;
      $scope.hideLoading();
      $scope.goToPost();
    });
  }

  $scope.showLoading = function() {
    $ionicLoading.show({
      template: '<ion-spinner class="ios"></ion-spinner>'
    });
  }

  $scope.hideLoading = function() {
    $ionicLoading.hide();
  }

  $scope.delete = function(type, id) {
    $scope.showLoading();
    Voat.delete(type, id).then(function(response) {
      console.log(response);
      post = $.grep($scope.posts, function(e){return e.id == id})[0];
      i = $scope.posts.indexOf(post);
      $scope.posts.splice(i, 1);
      $scope.hideLoading();
      $scope.goToPosts();
    })
  }

  $scope.comment = function() {
    $scope.showLoading();
    subverse = $scope.focused_post.subverse;
    postId = $scope.focused_post.id;
    comment = $scope.commentText;
    console.log('starting');
    Voat.comment(subverse, postId, comment).then(function(resp) {
      if (resp.data.success) {
        $('#commentText').val('');
        $('#commentText').blur();
        if ($scope.comments == 'empty') {
          $scope.comments = [resp.data.data];
        }
        else {
          $scope.comments = $scope.comments.concat([resp.data.data])
        }
      }
      else {
        if (resp.data == 'token') {
          alert('login to comment')
        }
        else {
          alert(JSON.stringify(resp.data));
        }
      }
      $scope.hideLoading();
    });
  }

  $scope.verbCallback = function(result) {

  }

  $scope.vote = function(type, id, vote) {
    types = type+'s';
    if (types == 'submissions') {
      types = 'posts'
    }
    desiredList = $scope[types];
    upVoteFunc = function(i){$scope[types][i].upVotes += vote};
    downVoteFunc = function(i){$scope[types][i].downVotes -= vote};
    if (type == 'comment') {
      var closeFunc = function(i){$ionicListDelegate.closeOptionButtons()};
    }
    else {
      if ($scope.onPosts()) {
        var closeFunc = function(i){$scope.posts[i].hideMenu = !$scope.posts[i].hideMenu};
      }
      else {
        var closeFunc = function(i){$scope.togglePostMenu()};
      }
    }
    entity = $.grep(desiredList, function(e){return e.id == id})[0];
    i = desiredList.indexOf(entity);
    Voat.vote(type, id, vote).then(function(result) {
      console.log(result);
      closeFunc(i);
      if (result.data == 'token') {
        alert('you are not logged in');
        return;
      }
      if (result.data.data.resultName == 'Denied') {
        alert(result.data.data.message);
        return;
      }
      else if (vote) {
        upVoteFunc(i)
      }
      else {
        upVoteFunc(i);
      }
    });
  }

  $scope.save = function(type, id) {
    Voat.save(type, id).then(function(result){
      console.log(result);
      if (result.data == 'token') {
        alert('you are not logged in');
        return;
      }
      alert('saved successfully');
    })
  }

  $scope.loadMore = function() {
    /*
      load more posts, callback for infinite scrolling
    */

    // increment the page index
    $scope.currentPage += 1;
    // get more posts
    Voat.get_posts($scope.currentSubverse, $scope.currentPage).success(function(data) {
      // concatenate the new posts to the current ones
      $scope.posts = $scope.posts.concat(data.posts);
      // tell angular to stop the loading icon
      $scope.$broadcast('scroll.infiniteScrollComplete');
    })
  }

  $scope.showOptions = function(id) {
    /*
      toggle options panel to edit, voat on, etc posts
    */
    $('#'+id).slideToggle();
  }

  $scope.showMenu = function() {
    /*
      bring up bottom menu for clicked-on posts,
      display it by clicking the voat logo at the top.
    */
    // don't show the menu if not on a post's comment section
    if ($scope.currentIndex == 1) {
      var buttons = [
        {text: 'Submit Post/Link'}
      ];
      var buttonClicked = function(index) {
        // button clicked callback
        if (index == 0) {
          // go to submission slide
          $scope.goToSubmission();
        }
        return true;
      }
    }
    else if ($scope.currentIndex == 2) {
      var buttons = [
        {text: $scope.focused_post.userName+"'s Profile"},
      ];
      var buttonClicked = function(index) {
        // button clicked callback
        if (index == 0) {
          // if user clicked `User's Profile` button
          // set focused_user
          name = $scope.focused_post.userName;
          Voat.get_user('info', name).then(function(user) {
            $scope.focused_user = user;
          })
          // go to account slide
          $scope.goToAccount();
        }
        return true;
      }
    }
    else {
      return;
    }
    // menu configuration
    var hidesheet = $ionicActionSheet.show({
      buttons: buttons,
      titleText: 'Voat',
      cancelText: 'cancel',
      cancel: function() {},
      buttonClicked: buttonClicked
    })
  }

  $scope.login = function() {
    /*
      login to voat
    */

    // get user/pass from input fields
    user = $('#user').val();
    pass = $('#pass').val();
    // make login request
    Voat.login(user, pass).then(function(data) {
      // if access_token is in response
      if (data.access_token) {
        // set token, username, and password locally
        window.localStorage['access_token'] = data.access_token;
        window.localStorage['user'] = user;
        window.localStorage['pass'] = pass;
        alert('logged in successfully')
        $scope.goToSettings();
      }
      else {
        alert('wrong username or password')
      }
    });
  }

  $scope.logout = function() {
    /*
      logout of voat
    */
    window.localStorage.removeItem('access_token');
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('pass');
    alert('logged out successfully')
    $scope.goToSettings();
  }

  /*
    boolean functions; primarily used for ng-show/ng-if/ng-switch
  */

  $scope.canRefresh = function() {
    /*
      returns true if on slides that can be refreshed
    */
    return $scope.onPosts() || $scope.onPost();
  }

  $scope.canGoBack = function() {
    /*
      returns true if on slide other than settings and posts
    */
    return $scope.currentIndex > 1;
  }

  $scope.canComment = function() {
    $scope.commentText = $('#commentText').val();
    return !(!$scope.commentText);
  }

  $scope.onSettings = function() {
    return $scope.currentIndex == 0;
  }

  $scope.onPosts = function() {
    return $scope.currentIndex == 1;
  }

  $scope.onPost = function() {
    return $scope.currentIndex == 2;
  }

  $scope.onAccount = function() {
    return $scope.currentIndex == 3;
  }

  $scope.onMyAccount = function() {
    /*
      return true if logged-in user is the focused_user
    */
    if ($scope.focused_user) {
      return window.localStorage['user'] == $scope.focused_user.userName;
    }
    else {
      return false;
    }
  }

  $scope.onLogin = function() {
    return $scope.currentIndex == 4;
  }

  $scope.onSubmission = function() {
    return $scope.currentIndex == 5;
  }

  $scope.loggedIn = function() {
    return window.localStorage['access_token'] != undefined;
  }

  $scope.onMySubmission = function() {
    return $scope.focused_post.userName == window.localStorage['user'];
  }

  $scope.isLink = function() {
    return $scope.focused_post.url;
  }

  /*
    load functions
  */

  $scope.load_posts = function(load_callback) {
    /*
      populate $scope.posts with voat posts
    */

    // get posts for the current page
    Voat.get_posts($scope.currentSubverse, $scope.currentPage).success(load_callback)
  }

  $scope.load_comments = function(postId) {
    /*
      populate $scope.comments with voat post comments
    */

    // get comments from specified post
    Voat.get_comments($scope.currentSubverse, postId).then(function(comments) {
      // fill comments list with returned comments
      var ci;
      console.log('---------')
      console.log(comments)
      for (ci = 0; ci < comments.length; ci++) {
        comment = comments[ci];
        //console.log(comment);
        if (comment.parentID) {
          parent = $.grep(comments, function(e){return e.id == comment.parentID})[0];
          pi = comments.indexOf(parent);
          comments.move(ci, pi+1);
          console.log(comments[pi+1].level);
          comments[pi+1].level *= 10;
          //$scope.comments[pi+1].formattedContent = '&nbsp;'.repeat(comment.level*4)+comment.formattedContent;
        }
        else {
          //console.log(comment);
        }
        //console.log(comments);
        $scope.comments = comments;
      }
      /*
      for (ci = 0; ci < $scope.comments.length; ci++) {
        commentHtml += sprintf(commentHtmlTemplate, $scope.comments[ci]);
      }
      $scope.commentHtml = commentHtml;
      console.log(commentHtml);
      */
      // if there aren't any comments
      if (!$scope.comments) {
        // comments is empty; used for ng-switch
        $scope.comments = 'empty';
      }
      // tell angular to stop refresh loading icon
      $scope.$broadcast('scroll.refreshComplete');
    })
  }

  $scope.getVPosts = function(subverse) {
    /*
      subverse - string - subverse to get posts from
      get posts from specified subverse
    */

    // clear the posts list
    $scope.posts = 'empty';
    // update current subverse
    $scope.currentSubverse = subverse
    $scope.currentPage = 1;
    // go to posts page
    $scope.goToPosts();
    // request posts from subverse
    Voat.get_posts(subverse, $scope.currentPage).success(function(data) {
      // overwrite posts list with new posts
      $scope.posts = data.posts;
      // tell angular to stop refresh loading icon
      $scope.$broadcast('scroll.refreshComplete');
    })
  }

  $scope.enoughPosts = function() {
    return $scope.posts.length > 7;
  }

  /*
    callback functions
  */

  $scope.buttonRouter = function() {
    if ($scope.canComment()) {
      return "canComment";
    }
    else if ($scope.onSettings()) {
      return "onSettings";
    }
  }

  $scope.toggleEdit = function() {
    $scope.isEditting = !$scope.isEditting;
  }

  $scope.edit = function(type, id) {
    $scope.showLoading();
    content = $('#edittedContent').val()
    Voat.edit(type, id, content).then(function(result) {
      console.log(result);
      $scope.toggleEdit();
      $scope.focused_post.formattedContent = result.data.data.formattedContent;
      $scope.focused_post.content = result.data.data.content;
      $scope.togglePostMenu();
      $scope.hideLoading();
    })
  }

  $scope.manageSlides = function(i) {
    /*
      callback when slide is changed
    */

    // update index tracker
    $scope.previousIndex = $scope.currentIndex;
    $scope.currentIndex = i;
    // lets angular know the slide has changed in index and/or length
    $ionicSlideBoxDelegate.update();
    // tell angular to resize the slide to accomodate new slide
    $ionicScrollDelegate.resize();
    console.log($scope.previousIndex, $scope.currentIndex);
    if ($scope.previousIndex == 3 && $scope.currentIndex == 2) {
      $scope.rightButton = {
        clickCallback: function() {
          $scope.goToMyAccount();
        },
        text: 'History <i class="ion-ios-arrow-forward"></i>'
      }
    }
    else if ($scope.previousIndex == 2) {
      $scope.rightButton = $scope.defaultRightButton;
      $scope.comments = undefined;
    }
  }

  /*
    open post functions
  */

  $scope.goToLink = function(post) {
    /*
      if user clicked thumbnail, take them directly to link
    */

    // MessageContent can either be a link or
    // the text body of a post
    // if MessageContent is just a link
    if (post.url) {
      // open link in the app browser
      $cordovaInAppBrowser.open(post.url, '_blank', {location: 'yes'});
      if ($scope.onPost()) {
        $scope.togglePostMenu();
      }
    }
    else if (!$scope.onPost()) {
      // open comments page
      $scope.focus_on(post);
    }
  }

  /*
  focus functions (changes the current focus or state)
  */

  $scope.openPostComments = function(post) {
    /*
    brings up the comment page of any post
    */
    $scope.focused_post = post
    $scope.load_comments(post.id);
    if ($scope.onPosts() || $scope.onAccount()) {
      $scope.cachedScroll = $ionicScrollDelegate.getScrollPosition().top;
      $scope.goToPost();
    }
    $ionicNavBarDelegate.showBackButton(true)
    $ionicScrollDelegate.scrollTop();
  }

  $scope.focus_on = function(post) {
    /*
    focus_on gets called before openPostComments because
    it tries to open up a potential image/video without comments.
    If the post is entirely text or if a particular part of the
    post was clicked, it calls openPostComments.
    */
    // open comments page
    $scope.openPostComments(post);
  }

  /*
  utility functions
  */

  $scope.load_posts_callback = function(data) {
    console.log(data)
    // disable sliding, buttons should trigger sliding only
    $ionicSlideBoxDelegate.enableSlide(false);
    // show the buttons on the header panel
    $ionicNavBarDelegate.showBackButton(true);
    // overwrite posts with new posts
    $scope.posts = data.posts;
    // tell angular to hide refresh loading icon
    $scope.$broadcast('scroll.refreshComplete');
  }

  $scope.timeDiff = function(previous_timestamp) {
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

  ionic.Platform.ready(function() {
    load_initial_app();
  });
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

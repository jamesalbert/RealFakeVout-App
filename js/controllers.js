angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, Voat, cancel, $q, $sce,
                                 $ionicTabsDelegate, $ionicListDelegate, $ionicLoading,
                                 $cordovaAppRate, $cordovaProgress, $cordovaInAppBrowser, $cordovaKeyboard,
                                 $ionicActionSheet, $ionicSlideBoxDelegate, $ionicNavBarDelegate, $ionicScrollDelegate) {

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
    $scope.loadingMore = false;
    $scope.currentPage = 1;
    $scope.previousIndex;
    $scope.currentIndex = 1;
    $scope.currentAccountTab = 0;
    $scope.cachedScroll = 0;
    $scope.isediting = false;
    $scope.lastViewedAccount = undefined;
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
      $scope.goToCachedScrollPosition();
      // clear comments if user goes back to posts list
      $scope.comments = [];
    }
    else if ($scope.onPost()) {
      // clear account slide
      $scope.clearAccountSlide();
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

  $scope.cancelRequests = function() {
    /*
      cancel other http requests
    */
    cancel.request.resolve(0);
    cancel.request = $q.defer();
  }

  $scope.goToSettings = function() {
    /*
    go to settings
    */

    $scope.cancelRequests();
    // cache current scroll position
    $scope.cacheScrollPosition();
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
    $scope.goToCachedScrollPosition();
  }

  $scope.goToPost = function() {
    /*
      go to clicked post
    */

    $scope.cancelRequests();
    // go to the post slide
    $scope.goToSlide(2);
    // clear account items
    $scope.clearAccountSlide();
    // scroll to the top of the page
    $ionicScrollDelegate.scrollTop();
    // open comments
    $scope.openPostComments($scope.focused_post);
  }

  $scope.goToContext = function(commentId, submissionId) {
    $scope.goToSlide(2);
    $scope.clearAccountSlide();
    Voat.get_post(submissionId).then(function(result) {
      $scope.openPostComments(result.data.submission);
      //$ionicScrollDelegate.scrollTo($('#'+commentId).offset().top)
    })
  }

  $scope.createCommentReply = function(comment) {
    commentRef = $.grep($scope.comments, function(e){
      return e.id == comment.id
    })[0];
    i = $scope.comments.indexOf(commentRef);
    $scope.comments.splice(i+1,0,{
      content: '',
      formattedContent: '',
      date: Date(),
      downVotes: 0,
      upVotes: 0,
      id: 'fakeid',
      level: comment.level+1*10,
      parentID: comment.id,
      submissionID: comment.submissionID,
      subverse: comment.subverse,
      userName: window.localStorage['user'],
      isEditing: true
    });
  }

  $scope.replyToComment = function(comment) {
    subverse = comment.subverse;
    submissionId = comment.submissionID;
    commentId = comment.parentID;
    value = comment.content;
    $scope.showLoading();
    Voat.replyToComment(subverse, submissionId, commentId, value).then(function(result) {
      comment.isEditing = false;
      comment.content = result.data.data.content;
      comment.formattedContent = result.data.data.formattedContent;
      comment.id = result.data.data.id;
      $scope.hideLoading();
    })
  }

  $scope.replyToMessage = function(message) {
    id = message.id;
    value = $('#message_'+id).val();
    $scope.showLoading();
    Voat.replyToMessage(id, value).then(function(result) {
      message.showMenu = false;
      $('#message_'+id).val('');
      $scope.hideLoading();
    })
  }

  $scope.goToAccount = function() {
    /*
      go to a specified user's account
    */

    if ($scope.onSettings() || $scope.previousIndex == 3) {
      var name = $scope.focused_user.userName;
    }
    else {
      var name = $scope.focused_post.userName;
    }
    $scope.lastViewedAccount = name;
    // go to the account slide
    $scope.goToSlide(3)
    $scope.getUserSubmissions(name, function(result) {
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
      // start loading spinner
      $scope.showLoading();
      // get name of logged in user
      name = window.localStorage['user']
      // get user info (name, registrating date)
      $scope.getUserInfo(name, function(user) {
        // user info is set globally
        $scope.focused_user = user;
        // stop loading
        $scope.hideLoading();
        // go to account slide
        $scope.goToAccount();
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

  $scope.cacheScrollPosition = function() {
    $scope.cachedScroll = $ionicScrollDelegate.getScrollPosition().top;
  }

  $scope.goToCachedScrollPosition = function() {
    $ionicScrollDelegate.scrollTo(0, $scope.cachedScroll);
  }

  $scope.goToSubmission = function() {
    /*
      go to submission page
    */
    $scope.cacheScrollPosition();
    $scope.goToSlide(5);
  }

  /*
    toggle commands
  */

  $scope.togglePostMenu = function() {
    $scope.showPostMenu = !$scope.showPostMenu;
  }

  $scope.closePostMenu = function() {
    $scope.showPostMenu = false;
  }

  $scope.updateTabs = function(index) {
    $('.tab-item').removeClass('active');
    $('#tab_'+index).addClass('active');
  }

  /*
    User GET functions
  */

  $scope.getLoggedInUser = function() {
    user = window.localStorage['user']
    if (!user) {
      return false;
    }
    return user;
  }

  $scope.onMyComment = function(name) {
    return name == $scope.getLoggedInUser();
  }

  $scope.getUser = function(name, type, customCallback) {
    if (!customCallback) {
      customCallback = function(result) {
        $scope.userItems = result.items;
      }
    }
    Voat.get_user(type, name).then(customCallback);
  }

  $scope.getUserInfo = function(name, customCallback) {
    $scope.getUser('info', name, customCallback);
  }

  $scope.getUserSubmissions = function(name) {
    $scope.getUser('submissions', name);
  }

  $scope.getUserComments = function(name) {
    $scope.getUser('comments', name);
  }

  /*
    Update Functions
  */

  $scope.updateAccountTabs = function(index) {
    $scope.cancelRequests();
    $scope.updateTabs(index);
    $scope.currentAccountTab = index;
    $scope.userItems = undefined;
    name = $scope.focused_user.userName;
    if (index == 0) {
      $scope.getUserSubmissions(name);
    }
    else if (index == 1) {
      $scope.getUserComments(name);
    }
    else if (index == 2) {
      Voat.get_messages('inbox', 'both').then(function(result) {
        $scope.userItems = result.data.messages.reverse();
        if ($scope.userItems.length == 0) {
          $scope.userItems = 'empty';
        }
      });
    }
    // scroll to the top of the page
    $ionicScrollDelegate.scrollTop();
  }

  $scope.updateSubmissionTabs = function(index) {
    $scope.updateTabs(index);
  }

  /*
    user commands
  */

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
    // start loading spinner
    $scope.showLoading();
    // request payload for /api/user
    payload = {
      title: $('#title').val(),
      subverse: $('#subverse').val()
    }
    if (Voat.get_subverses().indexOf(payload.subverse) < 0) {
      alert('Try a subverse that exists ;)');
    }
    if ($scope.onLinkSubmission()) {
      // if submitting a link
      payload.url = $('#link').val();
    }
    else {
      // other alternative is a self post
      payload.content = $('#content').val();
    }
    Voat.submit_post(payload).then(function(response) {
      if (!response.data.success) {
        // fail elegantly
        alert(response.data.data.message);
        return;
      }
      // set focused post
      $scope.focused_post = response.data.data;
      // stop loading
      $scope.hideLoading();
      // go to submitted post's page
      $scope.goToPost();
    });
  }

  $scope.delete = function(type, id) {
    // start loading spinner
    $scope.showLoading();
    // delete post or comment
    Voat.delete(type, id).then(function(response) {
      // get first result of matching post or comment
      entity = $.grep($scope[type], function(e){
        return e.id == id
      })[0];
      // remove from $scope.submissions for live update
      i = $scope[type].indexOf(entity);
      $scope[type].splice(i, 1);
      // stop loading
      $scope.hideLoading();
      if ($scope.onPost() && type == 'submissions') {
        $scope.togglePostMenu();
        // go back to posts
        $scope.goToMyAccount();
      }
    })
  }

  $scope.postComment = function(type) {
    /*
    subverse - subverse to comment on
    post id  - id on post to comment on
    comment  - user's comment
    */
    subverse = $scope.focused_post.subverse;
    postId = $scope.focused_post.id;
    comment = $scope.commentText;
    // comment on post
    Voat.comment(subverse, postId, comment).then(function(resp) {
      if (resp.data.success) {
        // clear comment box
        $('#commentText').val('');
        // unfocus comment box
        $('#commentText').blur();
        // add comment to post.comments instead of refreshing
        if ($scope.comments == 'empty') {
          $scope.comments = [resp.data.data];
        }
        else {
          $scope.comments = $scope.comments.concat([resp.data.data])
        }
      }
      else {
        // on error
        if (resp.data == 'token') {
          // user is not logged in
          alert('login to comment')
        }
        else {
          // general error message
          alert(JSON.stringify(resp.data));
        }
      }
      // hide loading
      $scope.hideLoading();
    });
  }

  $scope.comment = function() {
    // start loading icon
    $scope.showLoading();
    $scope.postComment('submission');
  }

  $scope.vote = function(type, id, vote) {
    // get either $scope.posts or $scope.comments
    types = type+'s';
    desiredList = $scope[types];
    // create upvote, downvote, and close menu callbacks
    upVoteFunc = function(i){$scope[types][i].upVotes += vote};
    downVoteFunc = function(i){$scope[types][i].downVotes -= vote};
    if (type == 'comment') {
      // if voting on a comment, close the comment menu
      var closeFunc = function(i){$ionicListDelegate.closeOptionButtons()};
    }
    else {
      if ($scope.onPosts()) {
        // if voting on a post from the front page, close the list post menu
        var closeFunc = function(i){$scope.submissions[i].hideMenu = !$scope.submissions[i].hideMenu};
      }
      else {
        // if voting on a post from the post's page, close the main post menu
        var closeFunc = function(i){$scope.togglePostMenu()};
      }
    }
    // entity is a alias for post or comment
    entity = $.grep(desiredList, function(e){return e.id == id})[0];
    i = desiredList.indexOf(entity);
    // vote on the post or comment
    Voat.vote(type, id, vote).then(function(result) {
      // close the menu
      closeFunc(i);
      if (result.data == 'token') {
        // if not logged in
        alert('you are not logged in');
        return;
      }
      if (result.data.data.resultName == 'Denied') {
        // usually errors due to lack of CPP
        alert(result.data.data.message);
        return;
      }
      else if (vote) {
        // upvote
        upVoteFunc(i)
      }
      else {
        // downvote
        downVoteFunc(i);
      }
    });
  }

  $scope.save = function(type, id) {
    /*
      save a post or comment
    */
    Voat.save(type, id).then(function(result){
      if (result.data == 'token') {
        // if not logged in
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
    $scope.loadingMore = true;
    // increment the page index
    $scope.currentPage += 1;
    // get more posts
    Voat.get_posts($scope.currentSubverse, $scope.currentPage, null).success(function(data) {
      // concatenate the new posts to the current ones
      $scope.submissions = $scope.submissions.concat(data.submissions);
      /*
      newSubmissions = $scope.submissions.concat(data.submissions);
      if (newSubmissions.length > 100) {
        $scope.submissions = newSubmissions.slice(25, newSubmissions.length);
      }
      else {
        $scope.submissions = newSubmissions;
      }
      */
      // tell angular to stop the loading icon
      $scope.loadingMore = false;
      //$scope.$broadcast('scroll.infiniteScrollComplete');
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
    if ($scope.onPosts()) {
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
    else if ($scope.onPost()) {
      var buttons = [
        {text: $scope.focused_post.userName+"'s Profile"},
      ];
      var buttonClicked = function(index) {
        // button clicked callback
        if (index == 0) {
          // if user clicked `User's Profile` button
          // set focused_user
          name = $scope.focused_post.userName;
          $scope.getUserInfo(name, function(user) {
            $scope.focused_user = user
          });
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

    // start loading icon
    $scope.showLoading();
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
        $scope.goToSettings();
      }
      else {
        alert('wrong username or password')
      }
      $scope.hideLoading();
    });
  }

  $scope.logout = function() {
    /*
      logout of voat
    */
    // remove all locally stored login credentials
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
    // show button if the user's typed something
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

  $scope.failIfNotLoggedIn = function() {
    if (!$scope.loggedIn) {
      alert('must be logged in to access this feature');
      throw "login error";
    }
  }

  $scope.onMySubmission = function() {
    return $scope.focused_post.userName == window.localStorage['user'];
  }

  $scope.onLinkSubmission = function() {
    return $('#tab_0').hasClass('active');
  }

  $scope.isLink = function() {
    return $scope.focused_post.url;
  }

  /*
    load functions
  */

  $scope.load_posts = function(load_callback) {
    /*
      populate $scope.submissions with voat posts
    */

    // get posts for the current page
    Voat.get_posts($scope.currentSubverse, $scope.currentPage, null).success(load_callback)
    $scope.$broadcast('scroll.infiniteScrollComplete');
  }

  $scope.searchPosts = function() {
    query = $('#search').val();
    if (!query) {
      return;
    }
    $scope.submissions = undefined;
    Voat.get_posts($scope.currentSubverse, 1, query).success($scope.load_posts_callback);
  }

  $scope.load_comments = function(postId) {
    /*
      populate $scope.comments with voat post comments
    */

    // get comments from specified post
    Voat.get_comments($scope.currentSubverse, postId).then(function(comments) {
      // fill comments list with returned comments
      var ci;
      /*
         takes shuffled comments and reorders like so:
         commentA:
          \_commentB, reply to commentA
            \_commentC, reply to commentB
            \_commentD, reply to commentB
          \_commentE, reply to commentA

          instead of a random mess of comments
      */
      for (ci = 0; ci < comments.length; ci++) {
        comment = comments[ci];
        if (comment.parentID) {
          // get parent comment
          parent = $.grep(comments, function(e){
            return e.id == comment.parentID
          })[0];
          pi = comments.indexOf(parent);
          // position comment after parent
          comments.move(ci, pi+1);
          // level is used for the comment's indention
          comments[pi+1].level *= 10;
        }
        $scope.comments = comments;
      }
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
    $scope.submissions = undefined;
    // update current subverse
    $scope.currentSubverse = subverse
    $scope.currentPage = 1;
    // go to posts page
    $scope.goToPosts();
    // request posts from subverse
    Voat.get_posts(subverse, $scope.currentPage, null).success(function(data) {
      // overwrite posts list with new posts
      $scope.submissions = data.submissions;
      // tell angular to stop refresh loading icon
      $scope.$broadcast('scroll.refreshComplete');
    })
  }

  $scope.enoughPosts = function() {
    /*
    the infinite reloader will triggers based
    on its position on the page. It auto triggers
    if there's not enough posts because it's positioned
    right beneath the posts. This disables infinite reloader
    if there isn't enough posts
    */
    return $scope.submissions.length > 7;
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
    $scope.isediting = !$scope.isediting;
  }

  $scope.toggleCommentMenu = function(comment) {
    if (comment.isEditing) {
      return false;
    }
    return !comment.hideMenu;
  }

  $scope.toggleCommentEdit = function(comment) {
    comment.isEditing = true;
  }

  $scope.getRowCount = function(s) {
    return (s.match(/(\n\r|\n|\r)/g) || [1,2]).length
  }

  $scope.edit = function(type, id) {
    /*
      edit existing post or comment
    */
    $scope.showLoading();
    // get the edited comment
    selector = type.replace(/(\w)/, function(m){return m.toUpperCase()}).replace(/s$/, '');
    if (type == 'comments') {
      selector += '_'+id;
    }
    else {
      $scope.toggleEdit();
      $scope.togglePostMenu();
    }
    content = $('#edited'+selector).val()
    Voat.edit(type, id, content).then(function(result) {
      entity = $.grep($scope[type], function(e){
        return e.id == id
      })[0];
      i = $scope[type].indexOf(entity);
      if (i > -1) {
        $scope[type][i].formattedContent = result.data.data.formattedContent;
        $scope[type][i].content = result.data.data.content;
        if (type == 'comments') {
          $scope[type][i].isEditing = false;
        }
      }
      else {
        $scope.focused_post.formattedContent = result.data.data.formattedContent;
        $scope.focused_post.content = result.data.data.content;
      }
      $scope.hideLoading();
    })
  }

  $scope.manageSlides = function(i) {
    /*
      callback when slide is changed
    */

    // quick dirty fix to hide history button on start up
    $('#historyButton').removeAttr('hidden');
    // update index tracker
    $scope.previousIndex = $scope.currentIndex;
    $scope.currentIndex = i;
    // lets angular know the slide has changed in index and/or length
    //$ionicSlideBoxDelegate.update();
    // tell angular to resize the slide to accomodate new slide
    //$ionicScrollDelegate.resize();
    if ($scope.previousIndex == 2) {
      $scope.comments = undefined;
      $scope.commentText = '';
      $scope.closePostMenu();
    }
    else if ($scope.currentIndex == 1) {
      $scope.closePostMenu();
    }
    else if ($scope.previousIndex == 3) {
      $scope.currentAccountTab = 0;
      console.log($scope.focused_post.userName)
      console.log(window.localStorage['user'])
    }
    //$cordovaKeyboard.show()

  }

  $scope.getUserName = function() {
    return window.localStorage['user'];
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
      $cordovaInAppBrowser.open(post.url, '_blank');
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
    loading functions
  */

  $scope.showLoading = function() {
    $ionicLoading.show({
      template: '<ion-spinner class="ios"></ion-spinner>'
    });
  }

  $scope.hideLoading = function() {
    $ionicLoading.hide();
  }

  /*
  focus functions (changes the current focus or state)
  */

  $scope.openPostComments = function(post) {
    /*
    brings up the comment page of any post
    */
    if (post.content) {
      post.content = post.content.replace(/(\r\n|\n|\r){2,}/gm,"\n\n")
    }
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
    // disable sliding, buttons should trigger sliding only
    $ionicSlideBoxDelegate.enableSlide(false);
    // show the buttons on the header panel
    $ionicNavBarDelegate.showBackButton(true);
    // overwrite posts with new posts
    $scope.submissions = data.submissions;
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
      return Math.round(elapsed/1000) + 's';
    }
    else if (elapsed < msPerHour) {
      return Math.round(elapsed/msPerMinute) + 'm';
    }
    else if (elapsed < msPerDay ) {
      return Math.round(elapsed/msPerHour ) + 'h';
    }
    else if (elapsed < msPerMonth) {
      return Math.round(elapsed/msPerDay) + 'd';
    }
    else if (elapsed < msPerYear) {
      return Math.round(elapsed/msPerMonth) + 'mo';
    }
    else {
      return Math.round(elapsed/msPerYear ) + 'y';
    }
  }

  ionic.Platform.ready(function() {
    load_initial_app();
    /*
    $cordovaAppRate.promptForRating(true).then(function (result) {
          // success
    });
    */
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

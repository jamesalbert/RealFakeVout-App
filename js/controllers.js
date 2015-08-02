angular.module('starter.controllers', [])

.controller('VoatCtrl', function($rootScope, $state, $rootScope, Voat, cancel, $q, $sce, $stateParams,
                                 $ionicTabsDelegate, $ionicListDelegate, $ionicLoading, $ionicViewSwitcher,
                                 $cordovaProgress, $cordovaInAppBrowser, $cordovaKeyboard,
                                 $ionicActionSheet, $ionicSlideBoxDelegate, $ionicNavBarDelegate, $ionicScrollDelegate) {

  /*
    starter function
  */

  function load_initial_app() {
    /*
    sets global variables:
      currentPage  - which page the user is on
      currentState - which slide the user is on
      cachedScroll - cached scroll value for main posts list

    loads initial posts list
    loads subverse list
    */

    if ($rootScope.configured) {
      return;
    }

    $rootScope.currentSubverse = '_default';
    $rootScope.showPostMenu = false;
    $rootScope.loadingMore = false;
    $rootScope.currentPage = 1;
    $rootScope.currentAccountTab = 0;
    $rootScope.isediting = false;
    $rootScope.isRequesting = false;
    $rootScope.lastViewedAccount = undefined;
    $rootScope.load_posts($rootScope.load_posts_callback);
    $rootScope.subverses = Voat.get_subverses();
    $rootScope.history = [];
    $rootScope.lastChange;
    $rootScope.configured = true;
  }

  /*
    navigation controls
  */

  $rootScope.goBack = function() {
    /*
    go to the previous slide
    */
    $rootScope.goToState('back', $rootScope.history[0], {goingBack: true});
    $rootScope.history.shift();
  }

  $rootScope.clearAccountSlide = function() {
    /*
      ensure focused_user is cleared if sliding back from account
    */
    $rootScope.focused_user = undefined;
    $rootScope.userItems = undefined;
    $rootScope.currentAccountTab = 0;
  }

  $rootScope.cancelRequests = function() {
    /*
      cancel other http requests
    */
    cancel.request.resolve(0);
    cancel.request = $q.defer();
    $rootScope.$broadcast('loading:finish');
  }

  $rootScope.$on('loading:progress', function() {
    $rootScope.isRequesting = true;
  })

  $rootScope.$on('loading:finish', function() {
    $rootScope.isRequesting = false;
  })

  $rootScope.goToSettings = function() {
    /*
    go to settings
    */

    // go to settings state
    $rootScope.goToState('back', 'voat.settings');
    // clear account items
    $rootScope.clearAccountSlide();
  }

  $rootScope.goToPost = function(post) {
    /*
      go to clicked post
    */

    $rootScope.comments = undefined;
    if (!post) {
      post = $rootScope.focused_post
      if (!post) {
        alert('no post to fallback on');
        return;
      }
    }
    try {
      if (post.formattedContent.startsWith('<img') &&
          post.formattedContent.endsWith('/>')) {
            img = $(post.formattedContent);
            // get width & height of image
            w = img[0].width;
            h = img[0].height;
            // set desired width
            img.attr('width', '340px');
            // get desired height
            ratio = parseFloat(340) / parseFloat(w);
            img.attr('height', h * ratio+'px');
            post.formattedContent = img[0].outerHTML;
          }
    } catch (err) {
      console.log(err);
    }
    // open comments
    $rootScope.goToState('forward', 'voat.post');
    $rootScope.openPostComments(post);
  }

  $rootScope.goToContext = function(commentId, submissionId) {
    Voat.get_post(submissionId).then(function(result) {
      $rootScope.goToPost(result.data.submission);
    })
  }

  $rootScope.createCommentReply = function(comment) {
    /*
      creates a comment block that will be added
      to the dom automatically via angular
    */
    commentRef = $.grep($rootScope.comments, function(e){
      return e.id == comment.id
    })[0];
    i = $rootScope.comments.indexOf(commentRef);
    $rootScope.comments.splice(i+1,0,{
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

  $rootScope.replyToComment = function(comment) {
    subverse = comment.subverse;
    submissionId = comment.submissionID;
    commentId = comment.parentID;
    value = comment.content;
    $rootScope.showLoading();
    Voat.replyToComment(subverse, submissionId, commentId, value).then(function(result) {
      console.log(result)
      comment.isEditing = false;
      comment.content = result.data.data.content;
      comment.formattedContent = result.data.data.formattedContent;
      comment.id = result.data.data.id;
      $rootScope.hideLoading();
    })
  }

  $rootScope.replyToMessage = function(message) {
    id = message.id;
    value = $('#message_'+id).val();
    $rootScope.showLoading();
    Voat.replyToMessage(id, value).then(function(result) {
      message.showMenu = false;
      $('#message_'+id).val('');
      $rootScope.hideLoading();
    })
  }

  $rootScope.goToAccount = function() {
    /*
      go to a specified user's account
    */

    if ($rootScope.onSettings()) {
      var name = $rootScope.focused_user.userName;
    }
    else {
      var name = $rootScope.focused_post.userName;
    }
    $rootScope.lastViewedAccount = name;
    // go to the account slide
    $rootScope.goToState('forward', 'voat.account')
    $rootScope.getUserSubmissions(name, function(result) {
      $rootScope.userItems = result.items;
    })
  }

  $rootScope.goToMyAccount = function() {
    /*
      go to the logged-in user's account
    */

    try {
      // check if logged in
      if (window.localStorage['access_token']) {
        // start loading spinner
        $rootScope.showLoading();
        // get name of logged in user
        name = window.localStorage['user']
        // get user info (name, registrating date)
        $rootScope.getUserInfo(name, function(user) {
          // user info is set globally
          $rootScope.focused_user = user;
          // stop loading
          $rootScope.hideLoading();
          // go to account slide
          $rootScope.goToAccount();
        })
      }
      else {
        // if not logged in, go to login slide
        $rootScope.goToLogin();
      }
    } catch (err) {
      alert(err);
    }
  }

  $rootScope.goToLogin = function() {
    /*
      go to login page
    */
    $rootScope.goToState('forward', 'voat.login');
  }

  $rootScope.goToSubmission = function() {
    /*
      go to submission page
    */
    $rootScope.goToSlide(5);
  }

  /*
    toggle commands
  */

  $rootScope.togglePostMenu = function() {
    $rootScope.showPostMenu = !$rootScope.showPostMenu;
  }

  $rootScope.closePostMenu = function() {
    $rootScope.showPostMenu = false;
  }

  $rootScope.updateTabs = function(index) {
    $('.tab-item').removeClass('active');
    $('#tab_'+index).addClass('active');
  }

  /*
    User GET functions
  */

  $rootScope.getLoggedInUser = function() {
    user = window.localStorage['user']
    if (!user) {
      return false;
    }
    return user;
  }

  $rootScope.onMyComment = function(name) {
    return name == $rootScope.getLoggedInUser();
  }

  $rootScope.getUser = function(name, type, customCallback) {
    if (!customCallback) {
      customCallback = function(result) {
        $rootScope.userItems = result.items;
      }
    }
    Voat.get_user(type, name).then(customCallback);
  }

  $rootScope.getUserInfo = function(name, customCallback) {
    $rootScope.getUser('info', name, customCallback);
  }

  $rootScope.getUserSubmissions = function(name) {
    $rootScope.getUser('submissions', name);
  }

  $rootScope.getUserComments = function(name) {
    $rootScope.getUser('comments', name);
  }

  /*
    Update Functions
  */

  $rootScope.updateAccountTabs = function(index) {
    $ionicScrollDelegate.scrollTop();
    $rootScope.cancelRequests();
    $rootScope.updateTabs(index);
    $rootScope.currentAccountTab = index;
    $rootScope.userItems = undefined;
    name = $rootScope.focused_user.userName;
    if (index == 0) {
      $rootScope.getUserSubmissions(name);
    }
    else if (index == 1) {
      $rootScope.getUserComments(name);
    }
    else if (index == 2) {
      Voat.get_messages('inbox', 'all').then(function(result) {
        $rootScope.userItems = result.data.messages.reverse();
        if ($rootScope.userItems.length == 0) {
          $rootScope.userItems = 'empty';
        }
      });
    }
  }

  $rootScope.updateSubmissionTabs = function(index) {
    $rootScope.updateTabs(index);
  }

  /*
    user commands
  */

  $rootScope.refresh = function() {
    /*
      overwrite the list of posts with new posts
    */
    if ($rootScope.onPosts()) {
      // refresh posts if on posts page
      $rootScope.load_posts($rootScope.load_posts_callback);
    }
    else if ($rootScope.onPost()) {
      // refresh comments if on comments page
      $rootScope.load_comments($rootScope.focused_post.id);
    }
    else {
      $rootScope.$broadcast('scroll.refreshComplete');
    }
  }

  $rootScope.submitPost = function() {
    // request payload for /api/user
    payload = {
      title: $('#title').val(),
      subverse: $('#subverse').val()
    }
    if (Voat.get_subverses().indexOf(payload.subverse) < 0) {
      alert('Try a subverse that exists ;)');
      return;
    }
    // start loading spinner
    $rootScope.showLoading();
    if ($rootScope.onLinkSubmission()) {
      // if submitting a link
      payload.url = $('#link').val();
    }
    else {
      // other alternative is a self post
      payload.content = $('#content').val();
    }
    if (payload.title.length < 5) {
      alert('title must be more than 5 letters');
      return;
    }
    Voat.submit_post(payload).then(function(response) {
      if (!response.data.success) {
        // fail elegantly
        console.log(response);
        return;
      }
      // set focused post
      $rootScope.focused_post = response.data.data;
      // stop loading
      $rootScope.hideLoading();
      // go to submitted post's page
      $rootScope.history.shift();
      $rootScope.goToPost();
    });
  }

  $rootScope.delete = function(type, id) {
    // start loading spinner
    $rootScope.showLoading();
    // delete post or comment
    Voat.delete(type, id).then(function(response) {
      try {
        // get first result of matching post or comment
        entity = $.grep($rootScope[type], function(e){
          return e.id == id
        })[0];
        // remove from $rootScope.submissions for live update
        i = $rootScope[type].indexOf(entity);
        $rootScope[type].splice(i, 1);
      } catch (err) {
        console.log('cannot simulate live delete')
      }

      // stop loading
      $rootScope.hideLoading();
      if ($rootScope.onPost() && type == 'submissions') {
        $rootScope.togglePostMenu();
        // go back to posts
        $rootScope.history.shift();
        $rootScope.goToMyAccount();
      }
    })
  }

  $rootScope.postComment = function(type) {
    /*
    subverse - subverse to comment on
    post id  - id on post to comment on
    comment  - user's comment
    */
    subverse = $rootScope.focused_post.subverse;
    postId = $rootScope.focused_post.id;
    comment = $rootScope.commentText;
    // comment on post
    Voat.comment(subverse, postId, comment).then(function(resp) {
      if (resp.data.success) {
        // clear comment box
        $('#commentText').val('');
        // unfocus comment box
        $('#commentText').blur();
        // add comment to post.comments instead of refreshing
        if ($rootScope.comments == 'empty') {
          $rootScope.comments = [resp.data.data];
        }
        else {
          $rootScope.comments.splice(0, 0, resp.data.data)
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
      $rootScope.hideLoading();
    });
  }

  $rootScope.comment = function() {
    // start loading icon
    $rootScope.showLoading();
    $rootScope.postComment('submission');
  }

  $rootScope.vote = function(type, id, vote) {
    // get either $rootScope.posts or $rootScope.comments
    types = type+'s';
    desiredList = $rootScope[types];
    // create upvote, downvote, and close menu callbacks
    upVoteFunc = function(i){$rootScope[types][i].upVotes += vote};
    downVoteFunc = function(i){$rootScope[types][i].downVotes -= vote};
    if (type == 'comment') {
      // if voting on a comment, close the comment menu
      var closeFunc = function(i){$ionicListDelegate.closeOptionButtons()};
    }
    else {
      if ($rootScope.onPosts()) {
        // if voting on a post from the front page, close the list post menu
        var closeFunc = function(i){$rootScope.submissions[i].hideMenu = !$rootScope.submissions[i].hideMenu};
      }
      else {
        // if voting on a post from the post's page, close the main post menu
        var closeFunc = function(i){$rootScope.togglePostMenu()};
      }
    }
    // entity is a alias for post or comment
    entity = $.grep(desiredList, function(e){return e.id == id})[0];
    i = desiredList.indexOf(entity);
    // close the menu
    closeFunc(i);
    // vote on the post or comment
    Voat.vote(type, id, vote).then(function(result) {
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

  $rootScope.save = function(type, id) {
    /*
      save a post or comment
    */
    $rootScope.closePostMenu();
    Voat.save(type, id).then(function(result){
      if (result.data == 'token') {
        // if not logged in
        alert('you are not logged in');
        return;
      }
      alert('saved successfully');
    })
  }

  $rootScope.loadMore = function() {
    /*
      load more posts, callback for infinite scrolling
    */
    $rootScope.loadingMore = true;
    // increment the page index
    $rootScope.currentPage += 1;
    // get more posts
    Voat.get_posts($rootScope.currentSubverse, $rootScope.currentPage, null).success(function(data) {
      // concatenate the new posts to the current ones
      $rootScope.submissions = $rootScope.submissions.concat(data.submissions);
    })
    .finally(function() {
      // tell angular to stop the loading icon
      $rootScope.loadingMore = false;
    })
  }

  $rootScope.showOptions = function(id) {
    /*
      toggle options panel to edit, voat on, etc posts
    */
    $('#'+id).slideToggle();
  }

  $rootScope.showMenu = function() {
    /*
      bring up bottom menu for clicked-on posts,
      display it by clicking the voat logo at the top.
    */
    // don't show the menu if not on a post's comment section
    if ($rootScope.onPosts()) {
      var buttons = [
        {text: 'submit post/link'},
        {text: 'get recent'},
        {text: 'get top'}
      ];
      var custom_opts = {
        destructiveText: 'go zen'
      }
      var buttonClicked = function(index) {
        // button clicked callback
        if (index == 0) {
          if ($rootScope.loggedIn()) {
            $rootScope.goToState('forward', 'voat.submission')
            return true;
            // go to submission slide
            $rootScope.goToSubmission();
          }
          else {
            alert('Login to submit')
          }
        }
        else if (index == 1) {
          $rootScope.showLoading();
          $rootScope.submissions = undefined;
          $rootScope.hideLoading();
        }
        return true;
      }
    }
    else if ($rootScope.onPost()) {
      var buttons = [
        {text: 'view '+$rootScope.focused_post.userName+"'s history"},
      ];
      var buttonClicked = function(index) {
        // button clicked callback
        if (index == 0) {
          // if user clicked `User's Profile` button
          // set focused_user
          name = $rootScope.focused_post.userName;
          $rootScope.getUserInfo(name, function(user) {
            $rootScope.focused_user = user
          });
          // go to account slide
          $rootScope.goToAccount();
        }
        return true;
      }
    }
    else {
      return;
    }
    opts = {
      buttons: buttons,
      titleText: 'Voat',
      cancelText: 'cancel',
      cancel: function() {},
      buttonClicked: buttonClicked
    }

    // menu configuration
    var hidesheet = $ionicActionSheet.show(opts)
  }

  $rootScope.login = function() {
    /*
      login to voat
    */

    // start loading icon
    $rootScope.showLoading();
    // get user/pass from input fields
    user = $('#user').val().replace(/ /g,'');
    pass = $('#pass').val().replace(/ /g,'');
    // make login request
    Voat.login(user, pass).then(function(data) {
      // if access_token is in response
      if (data.access_token) {
        // set token, username, and password locally
        window.localStorage['access_token'] = data.access_token;
        window.localStorage['user'] = user;
        window.localStorage['pass'] = pass;
        $rootScope.goToSettings();
      }
      else {
        alert('wrong username or password')
      }
      $rootScope.hideLoading();
    });
  }

  $rootScope.logout = function() {
    /*
      logout of voat
    */
    // remove all locally stored login credentials
    window.localStorage.removeItem('access_token');
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('pass');
    alert('logged out successfully')
    $rootScope.goToSettings();
  }

  /*
    boolean functions; primarily used for ng-show/ng-if/ng-switch
  */

  $rootScope.canRefresh = function() {
    /*
      returns true if on slides that can be refreshed
    */
    return $rootScope.onPosts() || $rootScope.onPost();
  }

  $rootScope.canGoBack = function() {
    /*
      returns true if on slide other than settings and posts
    */
    return $rootScope.currentIndex > 1;
  }

  $rootScope.canComment = function() {
    // show button if the user's typed something
    $rootScope.commentText = $('#commentText').val();
    return !(!$rootScope.commentText);
  }

  $rootScope.onSettings = function() {
    return $state.current.name == 'voat.settings';
  }

  $rootScope.onPosts = function() {
    return $state.current.name == 'voat.posts';
  }

  $rootScope.onPost = function() {
    return $state.current.name == 'voat.post';
  }

  $rootScope.onAccount = function() {
    return $state.current.name == 'voat.account';
  }

  $rootScope.onMyAccount = function() {
    /*
      return true if logged-in user is the focused_user
    */
    if ($rootScope.focused_user) {
      return window.localStorage['user'] == $rootScope.focused_user.userName;
    }
    else {
      return false;
    }
  }

  $rootScope.onLogin = function() {
    return $state.current.name == 'voat.login';
  }

  $rootScope.onSubmission = function() {
    return $state.current.name == 'voat.submission'
  }

  $rootScope.loggedIn = function() {
    return window.localStorage['access_token'] != undefined;
  }

  $rootScope.failIfNotLoggedIn = function() {
    if (!$rootScope.loggedIn) {
      alert('must be logged in to access this feature');
      throw "login error";
    }
  }

  $rootScope.onMySubmission = function() {
    return $rootScope.focused_post.userName == window.localStorage['user'];
  }

  $rootScope.onLinkSubmission = function() {
    return $('#tab_0').hasClass('active');
  }

  $rootScope.isLink = function() {
    return $rootScope.focused_post.url;
  }

  $rootScope.goToState = function(dir, state, params) {
    if (!params) {
      params = {};
    }
    $ionicViewSwitcher.nextDirection(dir);
    $state.go(state, params);
  }

  /*
    load functions
  */

  $rootScope.load_posts = function(load_callback) {
    /*
      populate $rootScope.submissions with voat posts
    */

    // get posts for the current page
    Voat.get_posts($rootScope.currentSubverse, $rootScope.currentPage, null).success(load_callback)
    $rootScope.$broadcast('scroll.infiniteScrollComplete');
  }

  $rootScope.searchPosts = function() {
    query = $('#search').val();
    if (!query) {
      return;
    }
    $rootScope.submissions = undefined;
    Voat.get_posts($rootScope.currentSubverse, 1, query).success($rootScope.load_posts_callback);
  }

  $rootScope.load_comments = function(postId) {
    /*
      populate $rootScope.comments with voat post comments
    */

    // get comments from specified post
    Voat.get_comments($rootScope.currentSubverse, postId).then(function(comments) {
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
        $rootScope.comments = comments;
      }
      // if there aren't any comments
      if (!$rootScope.comments) {
        // comments is empty; used for ng-switch
        $rootScope.comments = 'empty';
      }
      // tell angular to stop refresh loading icon
      $rootScope.$broadcast('scroll.refreshComplete');
    })
  }

  $rootScope.getVPosts = function(subverse) {
    /*
      get posts from specified subverse

      subverse - string - subverse to get posts from
    */
    // clear the posts list
    $rootScope.submissions = undefined;
    // update current subverse
    $rootScope.currentSubverse = subverse
    $rootScope.currentPage = 1;
    // go to posts page
    $rootScope.goToPosts('forward');
    // request posts from subverse
    Voat.get_posts(subverse, $rootScope.currentPage, null).success(function(data) {
      // overwrite posts list with new posts
      $rootScope.submissions = data.submissions;
      // tell angular to stop refresh loading icon
      $rootScope.$broadcast('scroll.refreshComplete');
    })
  }

  $rootScope.enoughPosts = function() {
    /*
    the infinite reloader will triggers based
    on its position on the page. It auto triggers
    if there's not enough posts because it's positioned
    right beneath the posts. This disables infinite reloader
    if there isn't enough posts
    */
    return $rootScope.submissions.length > 7;
  }

  /*
    callback functions
  */

  $rootScope.buttonRouter = function() {
    if ($rootScope.canComment()) {
      return "canComment";
    }
    else if ($rootScope.onSettings()) {
      return "onSettings";
    }
  }

  $rootScope.toggleEdit = function() {
    $rootScope.isediting = !$rootScope.isediting;
  }

  $rootScope.toggleCommentMenu = function(comment) {
    if (comment.isEditing) {
      return false;
    }
    return !comment.hideMenu;
  }

  $rootScope.toggleCommentEdit = function(comment) {
    comment.isEditing = true;
  }

  $rootScope.getRowCount = function(s) {
    return (s.match(/(\n\r|\n|\r)/g) || [1,2]).length
  }

  $rootScope.edit = function(type, id) {
    /*
      edit existing post or comment
    */
    $rootScope.showLoading();
    // get the edited comment
    selector = type.replace(/(\w)/, function(m){return m.toUpperCase()}).replace(/s$/, '');
    if (type == 'comments') {
      selector += '_'+id;
    }
    else {
      $rootScope.toggleEdit();
      $rootScope.togglePostMenu();
    }
    content = $('#edited'+selector).val()
    Voat.edit(type, id, content).then(function(result) {
      entity = $.grep($rootScope[type], function(e){
        return e.id == id
      })[0];
      i = $rootScope[type].indexOf(entity);
      if (i > -1) {
        $rootScope[type][i].formattedContent = result.data.data.formattedContent;
        $rootScope[type][i].content = result.data.data.content;
        if (type == 'comments') {
          $rootScope[type][i].isEditing = false;
        }
      }
      else {
        $rootScope.focused_post.formattedContent = result.data.data.formattedContent;
        $rootScope.focused_post.content = result.data.data.content;
      }
      $rootScope.hideLoading();
    })
  }

  $rootScope.shouldScrollTop = function(comingFrom, goingTo) {
    //console.log('coming from '+comingFrom+', going to '+goingTo);
    if (comingFrom == 'voat.post' && goingTo == 'voat.posts') {
      return false;
    }
    return true;
  }

  $rootScope.$on('$stateChangeError', function(evt, state, toParams, previousState, fromParams) {
    $rootScope.goToState('forward', 'voat.posts');
  })

  $rootScope.$on('$stateChangeStart', function(evt, state, toParams, previousState, fromParams) {
    /*
      callback when state is changed
    */
    if ($rootScope.lastChange == [state.name, previousState.name]) {
      alert('ping')
      evt.preventDefault();
      return;
    }
    $rootScope.lastChange = [state.name, previousState.name]
    $rootScope.cancelRequests();
    if ($rootScope.shouldScrollTop(state.name, previousState.name)) {
      $ionicScrollDelegate.scrollTop();
    }

  })

  $rootScope.clearPost = function() {
    $rootScope.comments = undefined;
    $rootScope.focused_post = undefined;
    $rootScope.commentText = '';
    $rootScope.closePostMenu();
  }

  $rootScope.$on('$stateChangeSuccess', function(evt, state, toParams, previousState, fromParams) {
    /*
      callback when state is changed
    */

    // prevents this event from being triggered twice
    if ($rootScope.history[0] == previousState.name) {
      evt.preventDefault();
      return;
    }

    // update history
    if (!toParams.goingBack) {
      $rootScope.history.splice(0, 0, previousState.name);
    }

    if (previousState.name == 'voat.post' && state.name != 'voat.account') {
      $rootScope.clearPost();
    }

    if (state.name == 'voat.posts') {
      $rootScope.closePostMenu();
      if (!$rootScope.isRequesting && !$rootScope.submissions) {
        $rootScope.refresh();
      }
    }
  })

  $rootScope.getUserName = function() {
    return window.localStorage['user'];
  }

  /*
    open post functions
  */

  $rootScope.goToLink = function(post) {
    /*
      if user clicked thumbnail, take them directly to link
    */

    // MessageContent can either be a link or
    // the text body of a post
    // if MessageContent is just a link
    if (post.url) {
      // open link in the app browser
      $cordovaInAppBrowser.open(post.url, '_blank');
      $rootScope.closePostMenu();
    }
    else {
      // open comments page
      $rootScope.goToPost(post);
    }
  }

  /*
    loading functions
  */

  $rootScope.showLoading = function() {
    $ionicLoading.show({
      template: '<ion-spinner class="ios"></ion-spinner>'
    });
  }

  $rootScope.hideLoading = function() {
    $ionicLoading.hide();
  }

  /*
  focus functions (changes the current focus or state)
  */

  $rootScope.openPostComments = function(post) {
    /*
    brings up the comment page of any post
    */

    if (post.content) {
      post.content = post.content.replace(/(\r\n|\n|\r){2,}/gm,"\n\n")
    }
    $rootScope.focused_post = post
    $rootScope.load_comments(post.id);
  }

  $rootScope.goToPosts = function(dir) {
    $rootScope.goToState(dir, 'voat.posts');
  }

  /*
  utility functions
  */

  $rootScope.load_posts_callback = function(data) {
    // overwrite posts with new posts
    $rootScope.submissions = data.submissions;
    // tell angular to hide refresh loading icon
    $rootScope.$broadcast('scroll.refreshComplete');
  }

  $rootScope.timeDiff = function(previous_timestamp) {
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
});

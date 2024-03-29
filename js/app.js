// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

// ADD REACT
angular.module('starter', ['ionic', 'dcbImgFallback', 'starter.controllers', 'starter.services', 'ngCordova', 'ngResource'])

.run(function($ionicPlatform, $cordovaStatusbar) {
  $ionicPlatform.ready(function() {;
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {

      scope.$watch(function() {
          return attrs['ngSrc'];
        }, function (value) {
          if (!value) {
            element.attr('src', attrs.errSrc);
          }
      });

      element.bind('error', function() {
        element.attr('src', attrs.errSrc);
      });
    }
  }
})

.directive('focusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {

      $timeout(function() {
        element[0].focus();
      });
    }
  };
})

.config(function($stateProvider, $httpProvider, $urlRouterProvider, $cordovaInAppBrowserProvider, $cordovaAppRateProvider) {
  document.addEventListener("deviceready", function () {
    var defaultOptions = {
      location: 'yes',
      clearcache: 'no',
      toolbar: 'yes'
    };
    $cordovaInAppBrowserProvider.setDefaultOptions(defaultOptions)
    var prefs = {
     language: 'en',
     appName: 'voatjuice'
   };
   /*
   iosURL: '<my_app_id>',
   androidURL: 'market://details?id=<package_name>',
   windowsURL: 'ms-windows-store:Review?name=<...>'
   */
   //$cordovaAppRateProvider.setPreferences(prefs)
  }, false);
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('voat', {
    url: "/voat",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  .state('voat.posts', {
    url: '/posts?goingBack',
    views: {
      'voat-posts': {
        templateUrl: 'templates/voat.html',
        controller: 'VoatCtrl'
      }
    }
  })

  .state('voat.post', {
    url: '/post?goingBack',
    views: {
      'voat-post': {
        templateUrl: 'templates/voat-post.html',
        controller: 'VoatPostCtrl'
      }
    }
  })

  .state('voat.settings', {
    url: '/settings?goingBack',
    views: {
      'voat-settings': {
        templateUrl: 'templates/voat-settings.html',
        controller: 'VoatSettingsCtrl'
      }
    }
  })

  .state('voat.account', {
    url: '/account?goingBack',
    views: {
      'voat-account': {
        templateUrl: 'templates/voat-account.html',
        controller: 'VoatAccountCtrl'
      }
    }
  })

  .state('voat.login', {
    url: '/login?goingBack',
    views: {
      'voat-login': {
        templateUrl: 'templates/voat-login.html',
        controller: 'VoatLoginCtrl'
      }
    }
  })

  .state('voat.submission', {
    url: '/submission?goingBack',
    views: {
      'voat-submission': {
        templateUrl: 'templates/voat-submission.html',
        controller: 'VoatSubmissionCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/voat/posts');

});

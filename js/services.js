angular.module('starter.services', [])

.factory('Voat', function($http) {
  var posts;
  return {
    get_posts: function() {
      return $http.get('http://192.168.0.5:5000/api/frontpage')
                  .then(function(result) {
                    return result.data.posts;
                  })
      },
    get_subverses: function() {
      return $http.get('http://192.168.0.5:5000/api/topsubverses')
                  .then(function(result) {
                    return result.data.subverses;
                  })
      },
    get_userinfo: function(user) {
      return $http.get('http://192.168.0.5:5000/api/userinfo/'+user)
                  .then(function(result) {
                    return result.data;
                  })
      },
    get_v_posts: function(subverse) {
      return $http.get('http://192.168.0.5:5000/api/subversefrontpage/'+subverse)
                  .then(function(result) {
                    console.log(result.data);
                    return result.data.posts;
                  })
      },
    get_comments: function(id) {
      return $http.get('http://192.168.0.5:5000/api/comments/'+id)
                  .then(function(result) {
                    return result.data.comments;
                  })
    }};
})

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  },{
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 3,
    face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png',
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});

angular.module('starter.services', [])

.factory('cancel', function($q) {
  return {request: $q.defer()};
})

.factory('Voat', function($http, $rootScope, cancel) {
  //cancel.request.resolve('make way gentlemen');
  var ip = 'https://relurk.com';
  return {
    get_posts: function(subverse, page, search) {
      console.log('loading posts...');
      $rootScope.$broadcast('loading:progress');
      url = ip+'/api/posts/'+subverse+'/'+page+'/'+search;
      req = {
        url: url,
        timeout: cancel.request.promise
      }
      return $http(req)
                  .success(function(data) {
                    return data.submissions;
                  })
                  .error(function() {
                    return {type: 'error', message: 'Either your network is weak or Voat is down.'}
                  })
      },
      get_post: function(id) {
        console.log('loading post...');
        url = ip+'/api/post/'+id;
        req = {
          url: url,
          timeout: cancel.request.promise
        }
        return $http(req)
                    .success(function(data) {
                      return data.submission;
                    })
                    .error(function() {
                      return {type: 'error', message: 'Either your network is weak or Voat is down.'}
                    })
        },
    get_subverses: function() {
      return [
        "Api",
        "AskFakeVout",
        "playground",
        "Universall",
        "Test",
        "Anon",
        "funnystuff",
        "VOAT",
        "MinCCP",
        "Private",
        "nsfw",
        "announcements",
        "FirstLetterRed",
        "DogeTipRobot",
        "UpVoat",
        "fuerve",
        "metang800",
        "Luk3",
        "jordanarydev",
        "dogecoin",
        "Fakevout",
        "fatpeoplehate",
        "NotDisliked",
        "squ1dland",
        "QuantumWannabe",
        "nascar",
        "Neilv",
        "No",
        "Nonillion",
        "Mateon1",
        "Jotboard",
        "kingemocut",
        "KJ4TIP",
        "Krutonium",
        "KyuBotTest",
        "Leonelf",
        "lisbot",
        "gatorstestaccount",
        "geckoTier",
        "ggbnny",
        "girlswearingvs",
        "GK",
        "goatherd",
        "goatreader",
        "GunOfSod",
        "healdb",
        "hkr8",
        "human",
        "humansbeingbros",
        "itsmatt",
        "iVoater",
        "jabza",
        "Jawnnypoo",
        "Jayden",
        "jcharv",
        "jerv",
        "johnska7",
        "FFXIV",
        "FirstLetterBig",
        "dogecointesting",
        "dogesmithtest",
        "frame11",
        "frontpage",
        "DonDavio",
        "donkeypie",
        "doomrah",
        "DtheZombie",
        "edgymurphy",
        "ells1231",
        "Euphoric",
        "EVE",
        "Arkells",
        "0fux",
        "404",
        "51rH0n3y84d93r",
        "AdamTheBuizel",
        "admin",
        "akuta",
        "andromeda5e",
        "assguardian",
        "balmanator",
        "bd452",
        "bot",
        "bottest",
        "Bugs",
        "Cake",
        "CassiekinTestbed",
        "chubs",
        "cillroy",
        "CoatTest",
        "dankestmemerinos",
        "dcistestingthings",
        "rch",
        "RealNigzOnly",
        "redchanit",
        "RickyContra",
        "roboreuters",
        "RunningShoes",
        "runswithscissors",
        "ryan",
        "Scaarus",
        "schwiz",
        "SCP",
        "SexyBleach",
        "ShinsekaiYori",
        "Siege",
        "sjwcoin",
        "spacedicks",
        "Spunky",
        "storr",
        "subverserequest",
        "synnyster",
        "tehyosh",
        "termosapi",
        "projectgoatalot",
        "PurpleGoat",
        "PutinLovesCats",
        "PuttItOutPlease",
        "PythonisFun",
        "nulldev",
        "OldPeopleThings",
        "Ooer",
        "oranges13",
        "phroa",
        "piratenaapje2",
        "Pnoexz",
        "pondnetic",
        "poop",
        "mydickismassive",
        "n60storm4",
        "VulcanBy123",
        "watersnake",
        "whatever",
        "woofcat",
        "X0x5F0x5F05xF05xF5FX",
        "XvvvvvX",
        "Xyrann",
        "yayamateurs",
        "yee",
        "Yes",
        "zeonin",
        "vanin",
        "varNinja",
        "veuwer",
        "viralstories",
        "Voater4iOS",
        "volcanodev",
        "test2",
        "testbot",
        "testpwr",
        "theultimat",
        "thisisbot",
        "tlam",
        "Towelie",
        "Trimth",
        "TypograDark",
        "TysonMcNeal",
        "undone",
        "vulcan"
      ]
      /*
      return [
        "newsubverses",
        "introductions",
        "news",
        "videos",
        "technology",
        "science",
        "music",
        "gaming",
        "aww",
        "books",
        "gifs",
        "sports",
        "tv",
        "programming",
        "goats",
        "movies",
        "politics",
        "AskVoat",
        "pics",
        "religion",
        "atheism",
        "ideasforvoat",
        "funny",
        "announcements",
        "subverserequest",
        "whatever",
        "IAMA"
      ]*/
    },
    get_user: function(user, type) {
      console.log('loading user...');
      url = ip+'/api/user/'+user+'/'+type
      req = {
        url: url
      }
      if (type != 'info') {
        req.timeout = cancel.request.promise;
      }
      return $http(req)
                  .then(function(result) {
                    return result.data;
                  })
    },
    login: function(user, pass) {
      console.log('logging in...');
      req = {
        url: ip+'/api/token',
        method: 'POST',
        data: {
          grant_type: 'password',
          username: user,
          password: pass
        }
      }
      return $http(req)
              .then(function(result) {
                return result.data;
              })
    },
    comment: function(subverse, postId, comment) {
      console.log('commenting...');
      req = {
        url: ip+'/api/comment',
        method: 'POST',
        data: {
          subverse: subverse,
          postId: postId,
          comment: comment
        },
        headers: {
          Authorization: window.localStorage['access_token']
        }
      }
      return $http(req)
              .then(function(result) {
                return result;
              })
    },
    replyToComment: function(subverse, subId, commentId, value) {
      console.log('replying...');
      req = {
        url: ip+'/api/reply/comment',
        method: 'POST',
        data: {
          subverse: subverse,
          postId: subId,
          commentId: commentId,
          content: value
        },
        headers: {
          Authorization: window.localStorage['access_token']
        }
      }
      return $http(req)
              .then(function(result) {
                return result;
              })
    },
    replyToMessage: function(id, value) {
      console.log('replying...');
      req = {
        url: ip+'/api/reply/message',
        method: 'POST',
        data: {
          id: id,
          content: value
        },
        headers: {
          Authorization: window.localStorage['access_token']
        }
      }
      return $http(req)
              .then(function(result) {
                console.log(result);
                return result;
              })
    },
    delete: function(type, id) {
      console.log('deleting...');
      req = {
        url: ip+'/api/delete',
        method: 'DELETE',
        data: {
          type: type,
          id: id
        },
        headers: {
          Authorization: window.localStorage['access_token']
        }
      }
      return $http(req)
              .then(function(result) {
                return result;
              })
    },
    edit: function(type, id, content) {
      console.log('editing...');
      req = {
        url: ip+'/api/edit',
        method: 'PUT',
        data: {
          type: type,
          id: id,
          content: content
        },
        headers: {
          Authorization: window.localStorage['access_token']
        }
      }
      return $http(req)
              .then(function(result) {
                return result;
              })
    },
    submit_post: function(payload) {
      console.log('submitting...');
      req = {
        url: ip+'/api/post',
        method: 'POST',
        data: payload,
        headers: {
          Authorization: window.localStorage['access_token']
        }
      }
      return $http(req)
              .then(function(result) {
                return result;
              })
    },
    vote: function(type, id, vote) {
      console.log('voting...');
      req = {
        url: ip+'/api/vote',
        method: 'POST',
        data: {
          type: type,
          id: id,
          vote: vote
        },
        headers: {
          Authorization: window.localStorage['access_token']
        }
      }
      return $http(req)
              .then(function(result) {
                return result;
              })
    },
    get_messages: function(type, state) {
      console.log('loading messages...');
      token = window.localStorage['access_token'];
      req = {
        url: ip+'/api/messages/'+type+'/'+state,
        method: 'GET',
        timeout: cancel.request.promise,
        headers: {
          Authorization: token
        }
      }
      return $http(req)
              .then(function(result) {
                console.log(result);
                return result;
              })
    },
    save: function(type, id) {
      console.log('saving...');
      req = {
        url: ip+'/api/save',
        method: 'POST',
        data: {
          type: type,
          id: id
        },
        headers: {
          Authorization: window.localStorage['access_token']
        }
      }
      return $http(req)
              .then(function(result) {
                return result;
              })
    },
    get_comments: function(subverse, id) {
      console.log('loading comments...');
      return $http.get(ip+'/api/comments/'+subverse+'/'+id, {timeout: cancel.request.promise})
                  .then(function(result) {
                    return result.data.comments;
                  })
    }};
});

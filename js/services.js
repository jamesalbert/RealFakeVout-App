angular.module('starter.services', [])

.factory('Voat', function($http) {
  var ip = 'http://192.168.0.15:5000';
  return {
    get_posts: function(subverse, page) {
      return $http.get(ip+'/api/posts/'+subverse+'/'+page)
                  .success(function(data) {
                    console.log(data.posts);
                    return data.posts;
                  })
                  .error(function() {
                    console.log('error');
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
    },
    get_user: function(type, user) {
      return $http.get(ip+'/api/user/'+type+'/'+user)
                  .then(function(result) {
                    console.log(result);
                    return result.data;
                  })
    },
    login: function(user, pass) {
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
      req = {
        url: ip+'/api/comment',
        method: 'POST',
        data: {
          token: window.localStorage['access_token'],
          subverse: subverse,
          postId: postId,
          comment: comment
        }
      }
      return $http(req)
              .then(function(result) {
                return result;
              })
    },
    delete: function(type, id) {
      req = {
        url: ip+'/api/delete',
        method: 'DELETE',
        data: {
          token: window.localStorage['access_token'],
          type: type,
          id: id
        }
      }
      return $http(req)
              .then(function(result) {
                return result;
              })
    },
    edit: function(type, id, content) {
      req = {
        url: ip+'/api/edit',
        method: 'PUT',
        data: {
          token: window.localStorage['access_token'],
          type: type,
          id: id,
          content: content
        }
      }
      return $http(req)
              .then(function(result) {
                return result;
              })
    },
    submit_post: function(payload) {
      payload.token = window.localStorage['access_token']
      console.log(payload);
      req = {
        url: ip+'/api/post',
        method: 'POST',
        data: payload
      }
      return $http(req)
              .then(function(result) {
                return result;
              })
    },
    vote: function(type, id, vote) {
      req = {
        url: ip+'/api/vote',
        method: 'POST',
        data: {
          token: window.localStorage['access_token'],
          type: type,
          id: id,
          vote: vote
        }
      }
      return $http(req)
              .then(function(result) {
                return result;
              })
    },
    save: function(type, id) {
      req = {
        url: ip+'/api/save',
        method: 'POST',
        data: {
          token: window.localStorage['access_token'],
          type: type,
          id: id
        }
      }
      return $http(req)
              .then(function(result) {
                return result;
              })
    },
    get_comments: function(subverse, id) {
      return $http.get(ip+'/api/comments/'+subverse+'/'+id)
                  .then(function(result) {
                    console.log('comments: ' + JSON.stringify(result));
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

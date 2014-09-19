var say = require('say')
  , CircleCI = require('circleci')
  , phrases = require('./phrases.json')
  , config = require('./config.json')
  , ci
  , seenBuilds = []
  , worker
  , pool = []
  , drainPool
  , randomInsult
  , randomPraise;

console.log('Booting Bruno v1.0\nBringing embarassment and joy to software engineers!')

ci = new CircleCI({
  auth: config.auth
});


drainPool = function(){
  if(pool.length > 0){
    pool.pop()(drainPool);
  }
};

randomInsult = function(){
  return phrases.insult[Math.floor(Math.random() * phrases.insult.length)];
};

randomPraise = function(){
  return phrases.praise[Math.floor(Math.random() * phrases.praise.length)];
};


worker = function(){
  ci.getBuilds({username: config.username, project: config.project, limit: 5}).then(function(builds){
    var i,
        build;
    for(i = 0; i < builds.length; i++){
      build = builds[i];
      if(seenBuilds.indexOf(build.build_num) === -1){
        seenBuilds.push(build.build_num);
        if(build.status === 'failed'){
          pool.push(function(cb){
            say.speak('Alex', 'Hum... looks like I found a good one.  Let me see who broke the build.  Oh, it was '  + build.committer_name +  ' ... ' + randomInsult() , function(){
              cb();
            });
          });
        }
        else{
          pool.push(function(cb){
            say.speak('Alex', 'Good news, a passing build!  Wow, it was ' + build.committer_name + ' ... ' + randomPraise() , function(){
              cb();
            })
          });
        }
      }
    }
    drainPool();
  });
};

setInterval(function(){
  if(pool.length < 1){
    worker();
  }
}, 10000);

worker();

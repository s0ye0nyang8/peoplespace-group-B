var express = require('express');
var fb = require('firebase')
var router = express.Router();
var dateFormat = require('dateformat');

/*config 안에있는 정보가 유출되면 안되서 
.env 파일에 넣고 변수 느낌으로 넣어주는 부분*/
const dotenv = require('dotenv')
  dotenv.config()
    var firebaseConfig = {
        apiKey:   process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket:process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSD_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId:process.env.FIREBASE_MEASUREMENT_ID
    };
    /* Initialize Firebase*/
   fb.initializeApp(firebaseConfig);
   /*firestore 에서 디비 가져왔다*/ 
   var db = fb.firestore();

/* GET home page. */
router.get('/', function(req, res, next) {
  /*fb 는 로그인 페이지 */
  res.render('fb');
});

router.post('/loginChk', function(req, res, next) {
  /* 로그인 상태이면 .then 을 실행 하고 아니면 .catch를 실행*/
  fb.auth().signInWithEmailAndPassword(req.body.id, req.body.passwd)
     .then(function(firebaseUser) {
       /* 아직까지 메인 페이지 */
         res.render('index');
     })
    .catch(function(error) {
        res.render('fb');
    });    
});
router.get('/index', function(req, res, next) {
  if (!fb.auth().currentUser) {
    res.redirect('fb');
    return;
  }
  res.render('index');
});
/* 임의 페이지 그냥 가져다 쓴거임 -> 디비에서 데이터 가져올수 있나 보기 위함 */
router.get('/generic', function(req, res, next) {
  if (!fb.auth().currentUser) {
    res.redirect('fb');
    return;
}
   /* 디비에서 정보를 가져온다 people-space 테이블에서  "time", "desc" 정렬로*/
   db.collection('people-space').where('teacherID', '==', fb.auth().currentUser.email).get()
   //.orderBy("time", "desc").get() -> orderBy 하면 인덱스 오류가 난다 왜지....
   .then((snapshot) => {
    // console.log(fb.auth().currentUser.email);
       var rows = [];
       snapshot.forEach((doc) => {
          /* 가져온 정보 row 라는 배열에 저장 */
           var childData = doc.data();
           childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
           rows.push(childData);
       });
       /* 정보를 가져갈 페이지로 각 배열(row)을 보내나 */
       res.render('generic', {rows: rows});
   })
   .catch((err) => {
       console.log('Error getting documents', err);
   });

});

/* 임의 페이지 그냥 가져다 쓴거임 -> 디비에서 데이터 가져올수 있나 보기 위함 */
router.post('/generic', function(req, res, next) {
  if (!fb.auth().currentUser) {
    res.redirect('fb');
    return;
}
var post = req.body;
console.log(post['lectureID']);
   /* 디비에서 정보를 가져온다 people-space 테이블에서  "time", "desc" 정렬로*/
   db.collection('people-space')
   .where('teacherID', '==', fb.auth().currentUser.email)
   .where('lectureID','==',post['lectureID']).get()
   //.orderBy("time", "desc").get() -> orderBy 하면 인덱스 오류가 난다 왜지....
   .then((snapshot) => {
    // console.log(fb.auth().currentUser.email);
       var rows = [];
       snapshot.forEach((doc) => {
          /* 가져온 정보 row 라는 배열에 저장 */
           var childData = doc.data();
           childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
           rows.push(childData);
       });
       /* 정보를 가져갈 페이지로 각 배열(row)을 보내나 */
       res.render('generic', {rows: rows});
   })
   .catch((err) => {
       console.log('Error getting documents', err);
   });

});
router.get('/logOut', function(req, res, next) {
  if (!fb.auth().currentUser) {   

    res.redirect('fb');
    return;
}
  fb.auth().signOut().then(() => {
    // Sign-out successful.
      res.redirect('/');
      return;
  }).catch((error) => {
    // An error happened.
    res.redirect('error');
  });
});

const querystring = require('querystring');    
router.get('/element', function(req, res, next) {
  if (!fb.auth().currentUser) {
    res.redirect('loginForm');
    return;
} 
  var teacher = fb.auth().currentUser.email;
  res.render('elements', {query: teacher});
  
});

/* 회원 가입 페이지 
 * -> 정보 제출하면 아래의 signup으로 가도록 html에서 설정 */
router.get('/new', function(req,res){
    res.render('newUser');
});

/* newUser.ejs 에서 사용자 정보를 보낸다 여기로 ->res 에 저장된다
 * 그걸 변수에 저장하고 firebase에 저장 한다음
 * 성공시 -> fb 로
 * 실패 할 경우 -> 해당 페이지 다시 */
router.post('/signup', function(req,res,next){
  var post = req.body;
    var email = post['new_email']
    var new_pw_1 =post['new_pw_1'] 
    var new_pw_2 =post['new_pw_2'] 

    /* 비밀 번호 2개 다르게 친 경우 -> 해당 페이지 다시*/
    if (new_pw_1!=new_pw_2){
      res.render('newUser')
    } else{
      /* firebase 함수 이용해 우저 생성 */
    fb.auth().createUserWithEmailAndPassword(email, new_pw_2)
        .then(() => {
         /* 성공시 로그인 페이지 */
          res.render('fb')
        })
        .catch(function (error) {
          /* 실패할 경우 해당 페이지 다시 */
            res.render('newUser')
        });
    }
});
/**************************************************************************************************************************** 여기부터 가은 추가 */
router.get('/realtime', function(req, res, next) {        // realtime 페이지에 쓰임.
  if (!fb.auth().currentUser) {
    res.redirect('fb');
    return;
}
   /* 디비에서 정보를 가져온다 people-space 테이블에서  "time", "desc" 정렬로*/    
   var now  = new Date();   // 현재 시간          
   db.collection('people-space').where('teacherID', '==', fb.auth().currentUser.email).get()  // 어자피 동시에 수업 두개를 할 순 없으니까.. teacherID로 유니크할수있을듯.
   //.orderBy("time", "desc").get() -> orderBy 하면 인덱스 오류가 난다 왜지....
   .then((snapshot) => {
      //  now = dateFormat(now, "yyyy-mm-dd");
      //  console.log(now);
       var rows = [];
       snapshot.forEach((doc) => {
          /* 가져온 정보 rows 라는 배열에 저장 */
          var childData = doc.data();
          childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
          console.log(childData.start)
          if (childData.start !=null && (childData.start.toMillis() <= now.getTime() && now.getTime() <= childData.end.toMillis())){    // 지금. 현재. 진행중인 수업만 차트로 나타낼거니까!
               rows.push(childData);
          }
          
          // console.log(childData.attendance);
       });
       /* 정보를 가져갈 페이지로 각 배열(row)을 보내나 */
       res.render('realtime', {rows: rows});
   })
   .catch((err) => {
       console.log('Error getting documents', err);
   });
  
});
//jjeong -> 이렇게 해도 되게찌..?
router.post('/realtime', function(req, res, next) {        // realtime 페이지에 쓰임.
  if (!fb.auth().currentUser) {
    res.redirect('fb');
    return;
}
   /* 디비에서 정보를 가져온다 people-space 테이블에서  "time", "desc" 정렬로*/    
   var now  = new Date();   // 현재 시간          
   var post = req.body;
   /* 디비에서 정보를 가져온다 people-space 테이블에서  "time", "desc" 정렬로*/
   console.log(post['lectureID']);
   db.collection('people-space')
   .where('teacherID', '==', fb.auth().currentUser.email)
   .where('lectureID','==',post['lectureID']).get() // 어자피 동시에 수업 두개를 할 순 없으니까.. teacherID로 유니크할수있을듯.
   //.orderBy("time", "desc").get() -> orderBy 하면 인덱스 오류가 난다 왜지....
   .then((snapshot) => {
      //  now = dateFormat(now, "yyyy-mm-dd");
      //  console.log(now);
       var rows = [];
       snapshot.forEach((doc) => {
          /* 가져온 정보 rows 라는 배열에 저장 */
          var childData = doc.data();
          childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
          console.log(childData.start)
          {    // 지금. 현재. 진행중인 수업만 차트로 나타낼거니까!
               rows.push(childData);
          }
          
          // console.log(childData.attendance);
       });
       /* 정보를 가져갈 페이지로 각 배열(row)을 보내나 */
       res.render('realtime', {rows: rows});
   })
   .catch((err) => {
       console.log('Error getting documents', err);
   });
  
});

/***************************************************************************************************************************************** 여기까지 가은 추가 */
/***민주 추가*****************************/
router.get('/history', function(req, res, next) {
  if (!fb.auth().currentUser) {
    res.redirect('fb');
    return;
  }
    /* 디비에서 정보를 가져온다 history collection에서*/
    db.collection("history").get().then((snapshot) =>{
      var rows = [];
      snapshot.forEach((doc) => {
        var dateData = doc.data();
        dateData.brddate = dateFormat(dateData.brddate, "yyyy-mm-dd");
        rows.push(dateData);

        //console.log( dateData.brddate);
      });
      /* 정보를 가져갈 페이지로 각 배열(row)을 보내나 */
      res.render('history', {rows: rows});
    })
    .catch((err) => {
        console.log('Error getting documents: history', err);
    });
});
router.get('/dailyreport', function(req, res, next) {
  if (!fb.auth().currentUser) {
    res.redirect('fb');
    return;
  }
  
  res.render('dailyreport')
});
//tmp~~~~~~~~~~
router.get('/byClass', function(req, res, next) {
  if (!fb.auth().currentUser) {
    res.redirect('fb');
    return;
  }
  var rows = [];
  db.collection("history").get().then((snapshot) =>{
    snapshot.forEach((doc) => {
      var dateData = doc.data();
      dateData.brddate = dateFormat(dateData.brddate, "yyyy-mm-dd");
      rows.push(dateData);
      
    });
  });
  res.render('byClass', {rows: rows});

});

/*************************************** */
//realtime에서 teacherID와 start time을 post로 받아옴.
router.post('/total', function(req, res, next){
  if(!fb.auth().currentUser){
      res.redirect('loginForm');
      return;
  }
  var post = req.body.start;
  console.log(post);
  /* 디비에서 정보를 가져온다 people-space 테이블에서  "time", "desc" 정렬로, 받아온 teacherID와 start time이 일치하는 정보들만*/
  db.collection('people-space')
      .where('teacherID', '==', fb.auth().currentUser.email)
      .where('start', '==', post['start'])
      .get().then((snapshot) => {
          var rows = [];
          snapshot.forEach((doc) => {
              /* 가져온 정보 row 라는 배열에 저장 */
              var childData = doc.data();
              childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
              rows.push(childData);
          });
          /* 정보를 가져갈 페이지로 각 배열(row)을 보내나 */
          res.render('total_statistics', {rows: rows});

      })
      .catch((err) => {
          console.log('Error getting documents', err);
      });


});



module.exports = router;

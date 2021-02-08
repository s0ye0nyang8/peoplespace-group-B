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
/* 나중에 쓸까바~ */
router.get('/element', function(req, res, next) {
  if (!fb.auth().currentUser) {
    res.redirect('loginForm');
    return;
}
  res.render('elements');
});

/* 회원 가입 페이지 
 * -> 정보 제출하면 아래의 signup으로 가도록 html에서 설정 */
router.get('/new', function(req,res,next){
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
        //console.log(`${doc.id} => ${doc.data()}`);
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
  res.render('/dailyreport')
});
router.get('/byClass', function(req, res, next) {
  if (!fb.auth().currentUser) {
    res.redirect('fb');
    return;
  }
  res.render('/byClass')

});


module.exports = router;
//db를 딴 파일에서도 쓰려고 수출? 
//export const dbService = firebase.firestore();


//const docRef = db.doc("sample/messageData");
//const inputTextfiled = document.querySelector("latestEapilogue");
//const saveButton = document.querySelector("saveButton");
//const loadButton = document.querySelector("saveButton");

// router.get('/dailyreport', function(req, res, next) {
//   if (!fb.auth().currentUser) {
//     res.redirect('fb');
//     return;
// }
//    /* 디비에서 정보를 가져온다 people-space 테이블에서  "time", "desc" 정렬로*/
// var docRef = db.collection("cities").doc("SF");

// docRef.get().then(function(doc) {
//     if (doc.exists) {
//         console.log("Document data:", doc.data());
//     } else {
//         // doc.data() will be undefined in this case
//         console.log("No such document!");
//     }
// }).catch(function(error) {
//     console.log("Error getting document:", error);
// });


  
// });

// loadButton.addEventListener("click", function(){
//   docRef.get().then(function (doc){
//     if(doc && doc.exists){
//       const myData = doc.data();
//       outputHeader.innerText = "Message status: " + myData.messageStatus;
//     }
//   }).catch(function (error){
//     console.log("Got an error: ", error);
//   });
// });

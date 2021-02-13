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
// console.log(post['lectureID']);
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
const { render } = require('ejs');
router.get('/element', function(req, res, next) {
  if (!fb.auth().currentUser) {
    res.redirect('loginForm');
    return;
}  
var start =0;
  db.collection('on-air').where('teacherID', '==', fb.auth().currentUser.email).get()
  .then((snapshot) => {
    
    snapshot.forEach((doc) => {
      /* 가져온 정보 rows 라는 배열에 저장 */
      var childData = doc.data();
      childData.brddate = dateFormat(childData.brddate,"yyyy-mm-dd");
          // 지금. 현재. 진행중인 수업만 차트로 나타낼거니까!
            if( childData.start!=null)
                  start = 1;
        });
        /* 정보를 가져갈 페이지로 각 배열(row)을 보내나 */
        
      })
      .catch((err) => {
          console.log('Error getting documents', err);
      });
  var teacher = fb.auth().currentUser.email;
  res.render('elements', {query: teacher , start:start});
  
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
 var now  = new Date();   // 현재 시간          
   var post = req.body;
   var start ="";
  
   /* 디비에서 정보를 가져온다 people-space 테이블에서  "time", "desc" 정렬로*/
  //  console.log(post['lectureID']);
   db.collection('on-air').where('teacherID', '==', fb.auth().currentUser.email).get()
   .then((snapshot) => {
     var rows = [];
     snapshot.forEach((doc) => {
        /* 가져온 정보 rows 라는 배열에 저장 */
        var childData = doc.data();
        childData.brddate = dateFormat(childData.brddate,"yyyy-mm-dd");
            // 지금. 현재. 진행중인 수업만 차트로 나타낼거니까!
             start = childData.start;
            //  start = childData.start;
            
             if (childData.end !=null && now.getTime() > childData.end.toMillis()) {
              // console.log(now,end);
              var rows = [];
              start = null;
              // console.log("111111111111.")
              res.render('realtime',
               {rows: rows,
                user: fb.auth().currentUser.email,
                start : start
              });
                   return ;
            }
          });
          /* 정보를 가져갈 페이지로 각 배열(row)을 보내나 */
          
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
      
  
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
          console.log(childData.start);
          console.log(start.toString());
          if ( childData.start!=null && childData.start.toString() == start.toString() && now.getTime().toString() <= childData.end.toMillis().toString() ){    // 지금. 현재. 진행중인 수업만 차트로 나타낼거니까!
               rows.push(childData);
             
               console.log(childData);
          }
         
       });
       /* 정보를 가져갈 페이지로 각 배열(row)을 보내나 */
      //  console.log(rows);
       res.render('realtime', {rows: rows,
        user: fb.auth().currentUser.email,
        start : start});
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
   var start ="";
  
   /* 디비에서 정보를 가져온다 people-space 테이블에서  "time", "desc" 정렬로*/
  //  console.log(post['lectureID']);
   db.collection('on-air').where('teacherID', '==', fb.auth().currentUser.email).get()
   .then((snapshot) => {
    //  now = dateFormat(now, "yyyy-mm-dd");
    //  console.log(now);
     var rows = [];
     snapshot.forEach((doc) => {
        /* 가져온 정보 rows 라는 배열에 저장 */
        var childData = doc.data();
        childData.brddate = dateFormat(childData.brddate,"yyyy-mm-dd");
        if(childData.start ==null){
            var rows = [];
            start = null;
            res.render('realtime',
            {rows: rows,
              user: fb.auth().currentUser.email,
              start : childData.start
            });
           return ;
        }
       
            // 지금. 현재. 진행중인 수업만 차트로 나타낼거니까!
             start = childData.start;
            
             if (childData.end !=null && now.getTime() > childData.end.toMillis()) {
              // console.log(now,end);
              var rows = [];
              start = null;
              // console.log("111111111111.")
              res.render('realtime',
               {rows: rows,
                user: fb.auth().currentUser.email,
                start : start
              });
                   return ;
            }
        
        // console.log(childData.attendance);
     });
     /* 정보를 가져갈 페이지로 각 배열(row)을 보내나 */
     
  })
  .catch((err) => {
      console.log('Error getting documents', err);
  });
 
  

   db.collection('people-space')
   .where('teacherID', '==', fb.auth().currentUser.email).get()
    // 어자피 동시에 수업 두개를 할 순 없으니까.. teacherID로 유니크할수있을듯.
   //.orderBy("time", "desc").get() -> orderBy 하면 인덱스 오류가 난다 왜지....
   .then((snapshot) => {
      //  now = dateFormat(now, "yyyy-mm-dd");
      //  console.log(now);
       var rows = [];
       
       snapshot.forEach((doc) => {
          /* 가져온 정보 rows 라는 배열에 저장 */
          var childData = doc.data();
          childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
          if ( childData.start.toString() == start.toString() && now.getTime() <= childData.end.toMillis() ) // 지금. 현재. 진행중인 수업만 차트로 나타낼거니까!
          {    // 지금. 현재. 진행중인 수업만 차트로 나타낼거니까!
            
               rows.push(childData);
          }
          
          // console.log(childData.attendance);
       });
       /* 정보를 가져갈 페이지로 각 배열(row)을 보내나 */
       res.render('realtime', {rows: rows,
        user: fb.auth().currentUser.email,
        start : start});
        return ;
   })
   .catch((err) => {
       console.log('Error getting documents', err);
   });
  
});

router.post('/makeclass', function(req,res,next){ // makeclass에서 입력된 값을 디비에 넣는다.
  if (!fb.auth().currentUser) {
    res.redirect('fb');
    return;
  }
// time으로 입력받은 start와 end를 timestamp 형식으로 고쳐준다.
  var tmpStart = req.body.start;
  var tmpEnd = req.body.end;
  var today = new Date;
  var year = today.getFullYear();
  var month = today.getMonth();   
  month = parseInt(month) + 1;
  var date = today.getDate();
  var sec = ":00";
  var tmp1 = year + "-" + month + "-" + date + " " + tmpStart + sec;
  var tmp2 = year + "-" + month + "-" + date + " " + tmpEnd + sec;
  var saveStart = new Date(tmp1);
  var saveEnd = new Date(tmp2);

  db.collection("on-air").add({     // 디비에 넣는다. 문서 이름은 랜덤이다. 
    subject: req.body.subject,
    teacherID: fb.auth().currentUser.email,
    stdNum: parseInt(req.body.stdNum),    // 숫자 안치면 Nan 들어감.
    start: saveStart,   
    end: saveEnd
  })
  .then(function(docRef) {
    
    res.redirect('realtime');           // realtime 페이지로 리다이렉션 해준다.
  })
  .catch(function(error) {
    console.error("Error adding document: ", error);
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
    db.collection('people-space').orderBy("start", "desc").get() //내림차순
      .then((snapshot) => {
          var rows = [];
          snapshot.forEach((doc) => {
              /* 가져온 정보 row 라는 배열에 저장 */
              var childData = doc.data();
              childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
              rows.push(childData);
          });
         
          /* 정보를 가져갈 페이지로 각 배열(row)을 보내나 */
          res.render('history', {rows: rows});

      })
      .catch((err) => {
          console.log('Error getting documents', err);
      });
   
});
router.get('/dailyreport', function(req, res, next) {
  if (!fb.auth().currentUser) {
    res.redirect('fb');
    return;
  }
  db.collection('people-space').orderBy("time", "desc").get()
      .then((snapshot) => {
          var rows = [];
          snapshot.forEach((doc) => {
              /* 가져온 정보 row 라는 배열에 저장 */
              var childData = doc.data();
              childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
              rows.push(childData);
          });
          /* 정보를 가져갈 페이지로 각 배열(row)을 보내나 */
          res.render('dailyreport', {rows: rows});

      })
      .catch((err) => {
          console.log('Error getting documents', err);
      });
});

router.get('/byClass', function(req, res, next) {
  if (!fb.auth().currentUser) {
    res.redirect('fb');
    return;
  }
  
  /* 디비에서 정보를 가져온다 history collection에서*/
  db.collection("subject").get().then((snapshot) =>{
    var rows = [];
    var ids = [];
    snapshot.forEach((doc) => {
      var dateData = doc.data();
      var idData = doc.id;
      dateData.brddate = dateFormat(dateData.brddate, "yyyy-mm-dd");
      rows.push(dateData);
      ids.push(idData);
      //console.log(`${doc.id} => ${doc.data()}`);
    });
    /* 정보를 가져갈 페이지로 각 배열(row)을 보내나 */
    res.render('byClass', {rows: rows, ids: ids});
  })
  .catch((err) => {
      console.log('Error getting documents: history', err);
      process.exit()
  });
});

router.post('/byClass', function(req, res, next) {
  if (!fb.auth().currentUser) {
    res.redirect('fb');
    return;
  }
  /*중복 코드라서 다른 방법이 없을까*/
  var rows = [];
  db.collection("subject").get().then((snapshot) =>{
    snapshot.forEach((doc) => {
      var dateData = doc.data();
      dateData.brddate = dateFormat(dateData.brddate, "yyyy-mm-dd");
      rows.push(dateData);
      //console.log(`${doc.id} => ${doc.data()}`);
    });
    /* 정보를 가져갈 페이지로 각 배열(row)을 보내나 */
    res.render('byClass', {rows: rows});
  })
  .catch((err) => {
      console.log('Error getting documents: history', err);
      process.exit()
  });
  if (req.body.subject == ""){
    return;
  }
  let flag = false;
  //중복 이름 이 코드로 해결 못함. 
  for(var i=0; i<rows.length; i++) {
    if (rows[i].name == req.body.subject){
        flag = true;
    }
  }
  if (flag != true){
    //문서 추가-자동생성 ID로  
    db.collection('subject').add({
      name: req.body.subject
    })
    .catch(function(error) {
      console.log('Error getting documents: subject', error);
    });
  }

  res.redirect('byClass') //에러를 위해서 if나 then, catch 문 안에 넣고 싶음. 
});


router.post('/delete_category', function(req, res, next) {
  if (!fb.auth().currentUser) {
    res.redirect('fb');
    return;
  }

  console.log(req.body.remove);
  //문서 삭제 버튼
  db.collection("subject").doc(req.body.remove).delete().then(function() {
    console.log("Document successfully deleted!");
    res.render('byClass');
  }).catch(function(error) {
      console.error("Error removing document: ", error);
  });

  res.redirect('byClass') 
});

/*************************************** */
router.get('/total', function(req, res, next){
  if(!fb.auth().currentUser){
      res.redirect('loginForm');
      return;
  }
  //var imgName = req.query.imgName;
  //var file = firebaseAdmin.storage().bucket().file(imgName);
  /* 디비에서 정보를 가져온다 people-space 테이블에서  "time", "desc" 정렬로*/
  var start ="";
  /* 디비에서 정보를 가져온다 people-space 테이블에서  "time", "desc" 정렬로, 받아온 teacherID와 start time이 일치하는 정보들만*/
  db.collection('people-space').where('teacherID', '==', fb.auth().currentUser.email).orderBy("start", "asc")
      .get().then((snapshot) => {
        snapshot.forEach((doc) => {
          /* 가져온 정보 row 라는 배열에 저장 */
          var childData = doc.data();
          childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
          start = childData.start;
          console.log(start);
      });
          db.collection('people-space')
          .where('teacherID', '==', fb.auth().currentUser.email)
          .where('start', '==', start)
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
    }) .catch((err) => {
      console.log('Error getting documents', err);
  });
   //.get()
 
  

  // db.collection('people-space').orderBy("time", "desc").get()
  //     .then((snapshot) => {
  //         var rows = [];
  //         snapshot.forEach((doc) => {
  //             /* 가져온 정보 row 라는 배열에 저장 */
  //             var childData = doc.data();
  //             childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
  //             rows.push(childData);
  //         });
  //         /* 정보를 가져갈 페이지로 각 배열(row)을 보내나 */
  //         res.render('total_statistics', {rows: rows});

  //     })
  //     .catch((err) => {
  //         console.log('Error getting documents', err);
  //     });

});
router.post('/total', function(req, res, next){
  
  if(!fb.auth().currentUser){
      res.redirect('loginForm');
      return;
  }
  var post = req.body;
  // console.log(post);
  var start ="";
  /* 디비에서 정보를 가져온다 people-space 테이블에서  "time", "desc" 정렬로, 받아온 teacherID와 start time이 일치하는 정보들만*/
  db.collection('people-space').orderBy("time", "asc").where('teacherID', '==', fb.auth().currentUser.email)
      .get().then((snapshot) => {
        snapshot.forEach((doc) => {
          /* 가져온 정보 row 라는 배열에 저장 */
          var childData = doc.data();
          childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
          start = childData.start;
          console.log(start);
      });
      db.collection('people-space')
      .where('teacherID', '==', fb.auth().currentUser.email)
      .where('start', '==', start)
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
   //.get()
  


});
module.exports = router;

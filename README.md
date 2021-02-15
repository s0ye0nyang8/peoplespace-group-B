# README

Status: In progress

# Welcome to BooM

> BooM helps to detect the people who are not paying attention for your speech.

# Installing

## NodeJS

- node - v14.15.4
- npm - v6.14.10
- express - v4.16.1
- ejs - v2.6.1
- firebase
- firebaseui
- dotenv

## Firebase

- Auth
- Firestore
- Hosting

## For load & run model realted code  
- flask - 
- pyautogui - 
- fast.ai - v1.0.61

## .env

Before using firebase to your nodeJS you need to make .env file with your firebase keys in.

```jsx
FIREBASE_API_KEY = xxxxx
FIREBASE_AUTH_DOMAIN = xxxxx
FIREBASE_PROJECT_ID = xxxxx
FIREBASE_STORAGE_BUCKET = xxxxx
FIREBASE_MESSD_ID = xxxxx
FIREBASE_APP_ID =  xxxxx
FIREBASE_MEASUREMENT_ID =  xxxxx
```

# About Boom Webpage

In BooM webpage you could experience the following functions :

- Make class
- Real-time attention statistics
- Total attention statistics
- History of attention statistics for your class

# Run

To run our code you should type a command like below : 

```jsx
node bin/www
```

OR

```jsx
npm start
```

Or If you want to run the app code ( python code )
python flask-screenshot.py

```
python flask-screenshot.py
```

# Code

## Index.js

- This act as router, redirecting each page. Also it could send and receive datas for page or firebase-database.

## fb.ejs

- This is a first page when you come to our website. You must login to use our website. When you succeed the login process then router will render you to **index.ejs**, which is our main page.
- But if you don't have an account you should click then button for making account. Then router will redirect you to **newUser.ejs** for making account.
- This sends email and passwords to firebase and check if it is existing user.

## index.ejs

- This is our main page after login process.
- If you click the start button, the router will send you to **element.ejs** page for allow you to make new class.
- If you click the buttons of sidebar, the router will send you to page that you clicked for.

## realtime.ejs

- Get data from DB through index.js.
- Only the current user's current class data fetches.
- This data pushed into array called rows.
- Used google charts to represent the data.
- If the calss has not started yet, not the chart but the message comes up.

## elements.ejs → makeclas 페이지에 대한 .ejs인데, 이름이 일케 돼있음.

- Enter the information of a class here. (information : subject, number of students, when the class starts, when the clas end)
- This information goes go "/makeclass".
- At "/makeclass"(which is in index.js ) , add input data to DB.
- Then, redirect to Real-Time page.

## newUser.ejs

- This page is for making new account.
- There is format for account 
ID has to be email format and Password has to be over 6 character.
- After clicking submit button. The router sends this information to firebase and check the format of ID and Password. And also check if the ID(email) is already in use. After it is successfully submitted it rendirect to **fb.ejs** which is the login page.

## element.ejs

- This page gets the information of class (subject, number of student, class time, etc..) from user, generates class by opening the app and redirects to **realtime.ejs** page which shows real-time attention gauge of class.
- This page gets userID as input and send this information to app with randomly generated classID and some inputs form user. Then apps stores information to database based on this informations.

## Total_statistics.ejs


## flask-screenshot.py

- This file is script for overall features of app team.
- We take some screen shots of clients' display, and analayze the attention figures of video conference meetings by loading our learnde model for detecting attention status.
- After calculate the figures, it sends them to our firebase database so our clients can see them through the graphs. 

## sam_models_func.py

- There are customized  predict function for our model, so you can import this file for module on the flask-screenshot.py file and use it for prediction.
- It will return the result of detecting attention status, for labels. 

## index.html

- Users can click the start button on this page to start analyze their video conference meeting. 

## capturing.html

- After click the start button, users have to wait on this page if they want to analyze their meeting. 
- If you want to stop analyzing it, you can just click the stop button and go back to the previous page.


### Enter

sidebar - click 'after class'

when the application terminates, the user will be automatically redirected to this page.

---

### Usage

1. You can see the total attention gauge of the session you just finished in the form of line graph.
2. if you put your mouse on the chart, you can click the point and see the screenshot taken by the application.

---

### DB Usage

Class information

- class id
- class start time

Chart

- realtime (time that screenshot was taken)
- attention gague
- fileID (url to screenshot)

## **history.ejs**

- Previous classes are sorted by date. If you take the link connected to each class, you can see the statistics of class concentration in a chart.
- Retrieve the document from the'people-space' collection from firestore. Users can only view their currently logged-in class, not other users' classes.

## byClass.ejs

- It has a function that can be seen in the to do list app. Classes were grouped and categorized by subject. Classrooms are created for each subject.
- You can add/delete documents from the subject collection in firestore. Each document has a subject name, name.

## classroom.ejs

- When you enter the classroom created by subject, you can see classes sorted by group and date. Like the history page, you can check the total gauge chart for each class.
- firestore에는 사용자 당 하나의 컬랙션을 가지는 것이 아니다.

## dailyreport.ejs

- This is a page that moves when you press the total gauge button located in each class column on the'/history' and'/byClass' pages.
- Use the Google Chart API for concentration statistics. You can toggle between line, table, bar, pie, and area charts.

```jsx
<!--GOOGLE CHART API-->
<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
```

### deployed web address
-> https://final-9ac8a.firebaseapp.com

import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials
from firebase_admin import initialize_app
# from firebase_admin import storage
# import storage as storage
import pyrebase
import uuid


firebaseConfig = {
    "apiKey": "AIzaSyAvjHClecVWEHei8FxDwZB3EBTuBqY9XEo",
    "authDomain": "final-9ac8a.firebaseapp.com",
    "databaseURL": "https://final-9ac8a-default-rtdb.firebaseio.com/",
    "projectId": "final-9ac8a",
    "storageBucket": "final-9ac8a.appspot.com",
    "messagingSenderId": "836802909691",
    "appId": "1:836802909691:web:4ad8bdb101da6adf5d675e",
    "measurementId": "G-GKY7Q2GLE9"
}


cred = credentials.Certificate('final-9ac8a-firebase-adminsdk-sn5p5-abb177668f.json')
firebase_admin.initialize_app(cred)
fbase = pyrebase.initialize_app(firebaseConfig)
auth = fbase.auth()

# print(auth.currentUser)
database = fbase.database()
db = firestore.client()
storage = fbase.storage()

email = "dlwjddms@cau.ac.kr"
password = "123456"
user = auth.sign_in_with_email_and_password(email, password)

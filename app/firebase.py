import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials
from firebase_admin import initialize_app
from firebase_admin import storage
import storage as storage
import pyrebase
import uuid


firebaseConfig = {
    "apiKey": "AIzaSyB-LvIsxuee_a-STvtrSO_vhgQl4tcVYX8",
    "authDomain": "peoplespace-test.firebaseapp.com",
    "databaseURL": "https://peoplespace-test-default-rtdb.firebaseio.com",
    "projectId": "peoplespace-test",
    "storageBucket": "peoplespace-test.appspot.com",
    "messagingSenderId": "619443014529",
    "appId": "1:619443014529:web:93ed39bb1d09654a227680",
    "measurementId": "G-PZLEB8DKRS"
}

cred = credentials.Certificate('C:/Users/selmo/Desktop/people_space/repo/flaskapp/boom-b900b-firebase-adminsdk-s6iqg-1bb9969ad3.json')
firebase_admin.initialize_app(cred)
fbase = pyrebase.initialize_app(firebaseConfig)
auth = fbase.auth()
# print(auth.currentUser)
database = fbase.database()
db = firestore.client()
storage = fbase.storage()

email = "sanghwaann@gmail.com"
password = "sanghwa0618"
user = auth.sign_in_with_email_and_password(email, password)

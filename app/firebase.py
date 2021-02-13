import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials
from firebase_admin import initialize_app
from firebase_admin import storage
import storage as storage
import pyrebase
import uuid


firebaseConfig = {
    "apiKey": "AIzaSyAK9Bc9Dk3sRxjqnVjHWm6kcJkUAY1JK7c",
    "authDomain": "boom-b900b.firebaseapp.com",
    "databaseURL": "https://boom-default-rtdb.firebaseio.com",
    "projectId": "boom-b900b",
    "storageBucket": "boom-b900b.appspot.com",
    "messagingSenderId": "90431175931",
    "appId": "1:90431175931:web:cd4c513c3db7dbb5cf845e",
    "measurementId": "G-Y087ST1ZNH"
}

cred = credentials.Certificate('boom-b900b-firebase-adminsdk-gjau1-58f8a07aa5.json')
firebase_admin.initialize_app(cred)
fbase = pyrebase.initialize_app(firebaseConfig)
auth = fbase.auth()
# print(auth.currentUser)
database = fbase.database()
db = firestore.client()
storage = fbase.storage()

email = "a@a.com"
password = "aaaaaa"
user = auth.sign_in_with_email_and_password(email, password)

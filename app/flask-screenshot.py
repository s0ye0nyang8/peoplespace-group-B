# import pandas as pd
# import numpy as np
# from fastai.core import *
# from PIL import Image
# from fastai.script import *
# from fastai.vision import *
# from fastai.callbacks import *
# from fastai.distributed import *
# from fastprogress import fastprogress
# from torchvision.models import *
# from firebase_admin import initialize_app
# from firebase_admin import storage
# from firebase_admin import db

import storage as storage
from flask import Flask, request, make_response
from flask import render_template
import pyautogui

from time import gmtime, strftime
from threading import Event, Thread

import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials
from firebase_admin import initialize_app
from firebase_admin import storage
import pyrebase
import sys, os
import tempfile
import uuid

from fastai.tabular import *
import numpy as np
import os
import pickle
from models_func import *

import firebase_admin
from firebase_admin import credentials

from flask import redirect

anno_train = Path('annotation/_annotations.coco.json')

with open(anno_train) as f:
    train_json = json.load(f)

cwd = os.getcwd()
path = cwd + '/'
model = load_learner(path, 'model.pkl')

img = open_image('test.jpg')

# Err/ new predict 함수 :  y = newreconstruct(ds.y, _pred, x) if has_arg(ds.y.reconstruct, 'x') else ds.y.reconstruct(_pred)
label, positive_pred_clas, positive_prob_clas,bbox = newpredict(model, img, train_json, return_x=False, batch_first=True, with_dropout=False)


#peoplespace-test-firebase-adminsdk-dawk1-a7fad79476
cred = credentials.Certificate('boom-b900b-firebase-adminsdk-s6iqg-c78a8cd251.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

config = {
    "apiKey": "AIzaSyB-LvIsxuee_a-STvtrSO_vhgQl4tcVYX8",
    "authDomain": "peoplespace-test.firebaseapp.com",
    "databaseURL": "https://peoplespace-test-default-rtdb.firebaseio.com",
    "projectId": "peoplespace-test",
    "storageBucket": "peoplespace-test.appspot.com",
    "messagingSenderId": "619443014529",
    "appId": "1:619443014529:web:93ed39bb1d09654a227680",
    "measurementId": "G-PZLEB8DKRS"
}

firebase = pyrebase.initialize_app(config)
storage = firebase.storage()

auth = firebase.auth()
email = "sanghwaann@gmail.com"
password = "sanghwa0618"
user = auth.sign_in_with_email_and_password(email, password)

#db = firebase.database()

#dir = db.reference()


def call_repeatedly(interval, func, *args):
    stopped = Event()
    def loop():
        while not stopped.wait(interval): # the first call is in `interval` secs
            func(*args)
    Thread(target=loop).start()
    return stopped.set


app = Flask(__name__)
capture_thread_stop = None


# start 버튼 클릭
@app.route('/start/')
def start_page():
    start()
    return render_template('capturing.html')

def start():
    global capture_thread_stop
    if capture_thread_stop:
        return "Already started"
    capture_thread_stop = call_repeatedly(1, capture)
    return "Started"


# stop 버튼 클릭 
@app.route('/stop/')
def turn_to_index():
     stop()
     return render_template('index.html')

def stop():
    global capture_thread_stop
    if capture_thread_stop:
        capture_thread_stop()
        capture_thread_stop = None
        return "Stopped"
    else:
        return "Not running"


# 기본 idex 페이지 
@app.route('/')
def index():
    return render_template('index.html')


# 웹 팀 리다이렉트 
@app.route('/web/') 
def redirect_web_team(): 
    return redirect("https://www.naver.com")


def capture():
    myScreenshot = pyautogui.screenshot()
    filename = strftime("%Y%m%d%H%M%S", gmtime())+'.png'
    myScreenshot.save(filename)
    upload(filename)
    temp = tempfile.NamedTemporaryFile(delete=False)


n = 0


def upload(filename):
    #bucket = storage.bucket()
    #blob = bucket.blob(filename)
    #blob.upload_from_filename(filename)
    storage.child(filename).put(filename)

    url = storage.child(filename).get_url(user['idToken'])
    print(url)

    global n
    doc_ref = db.collection(u'screenshots').document(u'{}'.format(n))
    doc_ref.set({
        u'{}'.format(filename): url
    })
    n += 1
    #db.child().push({"screenshot": url})


if __name__ == "__main__":
    app.run()



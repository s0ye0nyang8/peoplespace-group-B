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

import time
from time import gmtime, strftime
from threading import Event, Thread

import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials
from firebase_admin import initialize_app
from firebase_admin import storage
from firebase import *
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
model = load_learner(path, 'model-v50.pkl')
img = open_image('test.jpg')


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


userInfo = {}

# 기본 idex 페이지
@app.route('/')
def index():
    global userInfo
    values = request.values
    userInfo = {
        "end" : values["end"],
        "subject" : values["subject"],
        "teacherID" : values["teacherID"],
        "start" : values["start"],
        "stuNum" : values["stuNum"]
    }
    return render_template('index.html')


# 웹 팀 리다이렉트 
@app.route('/web/') 
def redirect_web_team(): 
    return redirect("https://www.naver.com")


@app.route('/create/<first_name>/<last_name>')
def create(first_name=None, last_name=None):
  return 'Hello ' + first_name + ',' + last_name


def capture():
    myScreenshot = pyautogui.screenshot()
    filename = strftime("%Y%m%d%H%M%S", gmtime())+'.png'
    myScreenshot.save(filename)
    upload(filename)
    temp = tempfile.NamedTemporaryFile(delete=False)


def attentiongauge():
    img = open_image('test.jpg')
    # Err/ new predict 함수 :  y = newreconstruct(ds.y, _pred, x) if has_arg(ds.y.reconstruct, 'x') else ds.y.reconstruct(_pred)
    bboxes, labels, scores = newpredict(model,img,train_json)
    lb = labels == "front"
    return len(lb)/user["stuNum"] *100


n = 0


def upload(filename):
    storage.child(filename).put(filename)

    url = storage.child(filename).get_url(user['idToken'])
    print(url)
    gauge = attentiongauge()

    global n
    doc_ref = db.collection(u'screenshots').document('user2')
    doc_ref.set({
            u"attention": gauge,
            u"createdAt": time.strftime('%c', time.localtime(time.time())),
            u"creatorId": userInfo["teacherID"],
        })
    n += 1


if __name__ == "__main__":
    app.run()



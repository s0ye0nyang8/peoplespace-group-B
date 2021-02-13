from firebase import *
# from attentionguage import gauge
from flask import Flask, request, make_response
from flask import render_template
import pyautogui
from time import gmtime, strftime
from threading import Event, Thread
import sys, os
import tempfile
import uuid
from fastai.tabular import *
import numpy as np
import os
import time
import pickle
from models_func import *
from flask import redirect


anno_train = Path('annotation/_annotations.coco.json')

with open(anno_train) as f:
    train_json = json.load(f)

cwd = os.getcwd()
path = cwd + '/'
model = load_learner(path, 'model-v50.pkl')
# dir = db.reference()

n = 0

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
@app.route('/<end>/<subject>/<teacherID>/<start>/<stuNum>')
# @app.route('/')
def index():
    global userInfo
    userInfo = {
    "end" = end
    "subject" =subject
    "teacherID" = teacherID
    "start" = start
    "stuNum" = stuNum
    }
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


def attentiongauge(): 
    img = open_image('test.jpg')
    # Err/ new predict 함수 :  y = newreconstruct(ds.y, _pred, x) if has_arg(ds.y.reconstruct, 'x') else ds.y.reconstruct(_pred)
    bboxes, labels, scores = newpredict(model,img,train_json)
    lb = labels == "front"
    return len(lb)/user[stuNum] *100 

def upload(filename):
#     bucket = storage.bucket()
#     blob = bucket.blob(filename)
#     blob.upload_from_filename(filename)
#     storage.child(filename).put(filename)
    url = storage.child(filename).get_url(user['idToken'])
#     print(url)
    gauge = attentiongauge()
    
    global n
    doc_ref = db.collection(u'screenshots').document()
    doc_ref.set({
            u"attention": gauge,
            u"createdAt": time.strftime('%c', time.localtime(time.time())),      
            u"creatorId": userInfo["teacherID"],
        })
    n += 1
    database.child().push(doc_ref)


if __name__ == "__main__":
    app.run()



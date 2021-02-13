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
from models_func import *
from sam_models_func import *



cwd = os.getcwd()
path = cwd + '/'
model = load_learner(path, 'sam_final_onlyface.pkl')

n = 0

img_path = cwd + '/test_images'

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


global userInfo

# 기본 idex 페이지
@app.route('/')
def index():
    global userInfo
    if request.method == 'GET':
        print()
    else :
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
    # boom-b900b.firebaseapp.com
    return redirect("https://www.naver.com")


global detect_image
def capture():
    myScreenshot = pyautogui.screenshot()
    filename = strftime("%Y%m%d%H%M%S", gmtime())+'.png'
    global detect_image
    detect_image = filename
    # myScreenshot.save(filename)
    myScreenshot.save(img_path + '/' + filename)
    upload(img_path + '/' + filename)
    temp = tempfile.NamedTemporaryFile(delete=False)


def attentiongauge():
    # bboxes, labels, scores = newpredict(model,img,train_json)
    
    bbox, label = predict(img_path, model)
 
    rv_path = img_path + '/' + detect_image
    os.remove(rv_path)

    lb = label == "front"
    if len(label) == 0 :
        print("None face detection")
    else :
        # return len(lb)/user["stuNum"] *100
        return len(label)/user["stuNum"] *100


global user

def upload(filename):
#     bucket = storage.bucket()
#     blob = bucket.blob(filename)
#     blob.upload_from_filename(filename)
#     storage.child(filename).put(filename)

    global user
    global n
    url = storage.child(filename).get_url(user['idToken'])
#     print(url)
    gauge = attentiongauge()
    
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


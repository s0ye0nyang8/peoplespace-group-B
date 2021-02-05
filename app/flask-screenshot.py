{
 "cells": [
  {
   "cell_type": "code",
   "execution_count": 13,
   "id": "artificial-insider",
   "metadata": {},
   "outputs": [],
   "source": [
    "# all the imports\n",
    "from flask import Flask\n",
    "from flask import render_template\n",
    "import pyautogui\n",
    "import sys"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 14,
   "id": "attractive-affairs",
   "metadata": {},
   "outputs": [],
   "source": [
    "# create our little application :)\n",
    "app = Flask(__name__)"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 15,
   "id": "shaped-copper",
   "metadata": {},
   "outputs": [],
   "source": [
    "app.route('/')\n",
    "def index():\n",
    "    return render_template('index.html')"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 16,
   "id": "material-district",
   "metadata": {},
   "outputs": [],
   "source": [
    "@app.route('/capture/')\n",
    "def capture():\n",
    "    myScreenshot = pyautogui.screenshot()\n",
    "    myScreenshot.save(r'C:\\Users\\sangh\\OneDrive\\문서\\PeopleSpace\\test.png')"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "id": "becoming-memphis",
   "metadata": {},
   "outputs": [],
   "source": [
    "if __name__ == \"__main__\":\n",
    "    app.run()"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "id": "aerial-place",
   "metadata": {},
   "outputs": [],
   "source": []
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.9.1"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 5
}

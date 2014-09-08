from flask import Flask, request, render_template
from bs4 import BeautifulSoup
import urllib2
import json
#from django.utils import simplejson

app = Flask(__name__)

@app.route("/")
def main():
    url = request.args.get('url', None)
    if url:
        req = urllib2.Request(url)
        req.add_header('User-Agent', 'Recipe/1.0 +https://github.com/jossoco/recipe-thing')
        res = res.open = urllib2.urlopen(req)
        data = _parse(res.read())
        data['url'] = url
    return render_template("index.html", data=json.dumps(data))

def _parse(content):
    soup = BeautifulSoup(content)
    data = {}
    data['title'] = soup.title.string
    data['steps'] = []

    inst_els = soup.find_all(class_="instruction")
    for el in inst_els:
        data['steps'].append(el.get_text())
    return data


if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0')

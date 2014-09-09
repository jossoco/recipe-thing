from flask import Flask, request, render_template
from bs4 import BeautifulSoup
import urllib2
import json

app = Flask(__name__)

@app.route("/")
def main():
    url = request.args.get('url', None)
    data = None
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

    title_parts = _parseTitle(soup.title.string)
    if type(title_parts) is tuple:
      data['title'], data['sourceName'] = _parseTitle(soup.title.string)
    else:
      data['title'] = title_parts
      data['sourceName'] = ''

    data['steps'] = _parseTextList(soup, "instruction")
    data['ingredients'] = _parseTextList(soup, "ingredient")
    return data

def _parseTitle(title):
    parts = title.split(' - ')
    if len(parts) == 2:
      return (parts[0], parts[1])
    return title

def _parseTextList(soup, class_name):
    list = []
    els = soup.find_all(class_=class_name)
    for el in els:
        list.append(el.get_text())
    return list


if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0')

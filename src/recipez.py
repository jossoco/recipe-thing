from flask import Flask, request, render_template
from recipe.parser import parse_recipe
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
        data = parse_recipe(res.read())
        data['url'] = url

    return render_template("index.html", data=json.dumps(data))


if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0')

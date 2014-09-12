from flask import Flask, request, render_template, redirect, url_for
from recipe.parser import parse_recipe
import urllib2
import json
import os

app = Flask(__name__)
session = {
    'error':  None
}

@app.route("/")
def main():
    url = request.args.get('url', None)
    if url:
        return redirect(url_for('recipe', url=url))
    else:
        return redirect(url_for('form'))

@app.route('/recipe')
def recipe():
    url = request.args.get('url')
    try:
        req = urllib2.Request(url)
        req.add_header('User-Agent', 'Recipe/1.0 +https://github.com/jossoco/recipe-thing')
        res = res.open = urllib2.urlopen(req)
        data = parse_recipe(res.read())
        if os.environ.get('DEBUG') or len(data['steps']) > 0:
            data['url'] = url
            return render_template('recipe.html', data=json.dumps(data))
        else:
            return render_template('parser.html', data=json.dumps(data))

            session['error'] = "Recipe could not be read"
            return redirect(url_for('form'))
    except urllib2.HTTPError as httpError:
        session['error'] = "URL Error"
        return redirect(url_for('form'))
    except Exception as exc:
        raise(exc)

@app.route('/form', methods=['GET', 'POST'])
def form():
    if request.method == 'POST':
        input_url = request.form['url']
        return redirect(url_for('recipe', url=input_url))
    if session['error']:
        form_error = session['error']
        session['error'] = None
        return render_template('form.html', error=form_error)

    return render_template('form.html')


if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0')

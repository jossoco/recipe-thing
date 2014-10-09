from flask import Flask, request, render_template, redirect, url_for
from mongoengine import connect
from flask.ext.mongoengine import MongoEngine
from recipe.parser import parse_recipe, parse_recipe_image
import json
import os

DB_NAME = 'recipez'
DB_USERNAME = 'recipez'
DB_PASSWORD = '1234'
DB_HOST_ADDRESS = '0.0.0.0:27017/recipez'

app = Flask(__name__)
app.config.from_object(__name__)

app.config['MONGODB_SETTINGS'] = {'DB': DB_NAME}
app.config['SECRET_KEY'] = 'dev key'
app.debug = True

db = MongoEngine()
db.init_app(app)

session = {
    'error':  None
}

class Recipe(db.DynamicDocument):
    title = db.StringField(required=True)
    imageUrl = db.StringField(required=True)
    ingredients = db.ListField(required=True)
    steps = db.ListField(required=True)
    sourceName = db.StringField(required=True)
    recipeUrl = db.StringField(required=True)

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
    recipe = Recipe.objects(recipeUrl=url)
    if recipe:
        recipe = recipe[0]
        return render_template('recipe.html', data=json.dumps({
            'title': recipe.title,
            'url': recipe.recipeUrl,
            'imageUrl': recipe.imageUrl,
            'sourceName': recipe.sourceName,
            'steps': recipe.steps,
            'ingredients': recipe.ingredients
        }))
    else:
        try:
            data = parse_recipe(url)
            data['url'] = url
            if os.environ.get('DEBUG') or len(data['steps']) > 0:
                return render_template('recipe.html', data=json.dumps(data))
            else:
               return redirect(url_for('extension', recipe_url=url))
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

@app.route('/extension', methods=['GET', 'POST'])
def extension():
    if request.method == 'POST':
      try:
          data = request.get_json()
          image_url = parse_recipe_image(data['url'])['imageUrl']
          Recipe(title=data['title'], sourceName=data['sourceName'], imageUrl=image_url,
                 recipeUrl=data['url'], steps=data['steps'], ingredients=data['ingredients']).save()
          return 'SUCCESS'
      except Exception as exc:
          raise(exc)

    recipe_url = request.args.get('recipe_url')
    return render_template('extension.html', recipeUrl=recipe_url)


if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0')

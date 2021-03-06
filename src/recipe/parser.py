from bs4 import BeautifulSoup
from exceptions import AttributeError
import urllib2

class RecipeParser():

    def parse_data(self, url, image_only=False):
        req = urllib2.Request(url)
        req.add_header('User-Agent', 'Recipe/1.0 +https://github.com/jossoco/recipe-thing')
        input = urllib2.urlopen(req)

        soup = BeautifulSoup(input)
        data = {}
        data['imageUrl'] = self._parse_image(soup)

        if image_only:
            return data

        data['title'], data['sourceName'] = self._parse_title_and_source(soup)
        data['steps'] = self._parse_text_list(soup, 'instruction', ['recipeInstructions', 'instructions'])
        data['ingredients'] = self._parse_text_list(soup, 'ingredient', ['ingredient', 'ingredients'])

        if len(data['steps']) == 0:
            data['recipeHtml'] = self._parse_recipe_html(soup)

        return data

    def _parse_title_and_source(self, soup):
        try:
            title = soup.title.string
            if title is None:
                title = ''
        except AttributeError:
            title = ''

        parts = title.split(' - ')
        if len(parts) == 2:
            return (parts[0], parts[1])

        parts = title.split(' | ')
        if len(parts) == 2:
            return (parts[0], parts[1])

        return (title, '')

    def _parse_text_list(self, soup, class_name, item_props):
        list = []
        els = soup.find_all(class_=class_name)
        if len(els) == 0:
            child_els = []
            for item_prop in item_props:
                els = soup.find_all(attrs={'itemprop': item_prop})
                if len(els) == 1:
                    child_type = None
                    for c in els[0].contents:
                        if c.name:
                            if child_type is None:
                                child_type = c.name
                                child_els.append(c)
                            elif c.name == child_type:
                                child_els.append(c)
                else:
                    child_els = els

                if len(child_els) > 0:
                    els = child_els
                    break

        for el in els:
            text = el.get_text()
            if text.strip() != '':
                list.append(text)
        return list

    def _parse_image(self, soup):
        item_props = ['image', 'photo']
        images = None 
        for prop in item_props:
            tagged_images = soup.find_all(attrs={'itemprop': prop})
            if len(tagged_images) == 1 and 'src' in tagged_images[0].attrs:
                return tagged_images[0].attrs['src']
            elif len(tagged_images) > 1:
                images = tagged_images
                break
        if not images:
            images = soup.find_all('img')

        if len(images) > 1:
            target_image = None
            max_area = 0
            for image in images:
                if 'src' in image.attrs and str.startswith(str(image.attrs['src']), 'http'):
                    area = self._get_image_area(image)
                    if area > max_area:
                        max_area = area
                        target_image = image
            if max_area == 0 and images[0].attrs and images[0].attrs['src']:
                # If images don't have dimensions just return first one
                # (usually logo so maybe not best)
                return images[0].attrs['src']
            if target_image:
                return target_image.attrs['src']
        elif len(images) == 1 and 'src' in images[0].attrs:
            return images[0].attrs['src']
        return ''

    def _get_image_area(self, image):
        if image.attrs and 'width' in image.attrs and 'height' in image.attrs:
            width = self._get_int(image.attrs['width'])
            height = self._get_int(image.attrs['height'])
            return width * height
        return 0

    def _get_int(self, attr):
        for char in ['px', '%', ';', ':']:
            attr = attr.replace(char, '')
        try:
            return int(attr)
        except:
            return 0

    def _parse_recipe_html(self, soup):
        # Remove page head
        soup.head.decompose()

        # Remove elements with these classes or ids
        strip_tags = ['comments', 'sidebar', 'nav']
        for tag in strip_tags:
            class_el = soup.find(class_=tag)
            if class_el:
                class_el.decompose()
            id_el = soup.find(id=tag)
            if id_el:
                id_el.decompose()

        # Remove elements of these types
        strip_types = ['script', 'img', 'form']
        for type in strip_types:
            [s.extract() for s in soup(type)]

        # Try to remove empty elements -- needs some work
        def is_empty(text):
            return len(text.strip()) == 0
        [s.extract() for s in soup.find_all(text=is_empty)]

        return str(soup)


def parse_recipe(input):
    parser = RecipeParser()
    return parser.parse_data(input)

def parse_recipe_image(recipe_url):
    parser = RecipeParser()
    return parser.parse_data(recipe_url, image_only=True)

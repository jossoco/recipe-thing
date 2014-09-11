from bs4 import BeautifulSoup
from exceptions import AttributeError

class RecipeParser():

    def parse_data(self, input):
        soup = BeautifulSoup(input)
        data = {}
        data['title'], data['sourceName'] = self._parse_title_and_source(soup)
        data['steps'] = self._parse_text_list(soup, 'instruction', ['recipeInstructions', 'instructions'])
        data['ingredients'] = self._parse_text_list(soup, 'ingredient', ['ingredient', 'ingredients'])
        data['imageUrl'] = self._parse_image(soup)
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
                if len(els) > 0:
                    if len(els) == 1:
                        child_type = None
                        for c in els[0].contents:
                            if c.name:
                                if child_type is None:
                                    child_type = c.name
                                    child_els.append(c)
                                elif c.name == child_type:
                                    child_els.append(c)
                    break
            if len(child_els) > 0:
                els = child_els

        for el in els:
            text = el.get_text()
            if text.strip() != '':
                list.append(text)
        return list

    def _parse_image(self, soup):
        images = soup.find_all('img')
        image_src = ''
        if len(images) > 1:
            target_image = ''
            max_width = 0
            for image in images:
                if image.attrs and 'width' in image.attrs:
                    try:
                        width = int(image.attrs['width'].replace('px', '').replace(';', '').replace('%', ''))
                    except:
                        width = 0
                    if width > max_width:
                        max_width = width
                        target_image = image
            if target_image and 'src' in target_image.attrs:
                image_src = target_image.attrs['src']
        elif len(images) == 1 and 'src' in images[0].attrs:
            image_src = images[0].attrs['src']
        return image_src


def parse_recipe(input):
    parser = RecipeParser()
    return parser.parse_data(input)

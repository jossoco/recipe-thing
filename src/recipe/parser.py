from bs4 import BeautifulSoup
from exceptions import AttributeError

class RecipeParser():

    def parse_data(self, input):
        soup = BeautifulSoup(input)
        data = {}
        data['title'], data['sourceName'] = self._parse_title_and_source(soup)
        data['steps'] = self._parse_text_list(soup, 'instruction', ['recipeInstructions', 'instructions'])
        data['ingredients'] = self._parse_text_list(soup, 'ingredient', ['ingredient', 'ingredients'])
        return data

    def _parse_title_and_source(self, soup):
        try:
            title = soup.title.string
        except AttributeError:
            title = ''

        parts = title.split(' - ')
        if len(parts) == 2:
            return (parts[0], parts[1])
        else:
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


def parse_recipe(input):
    parser = RecipeParser()
    return parser.parse_data(input)

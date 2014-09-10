from bs4 import BeautifulSoup
from exceptions import AttributeError

class RecipeParser():

    def parse_data(self, input):
        soup = BeautifulSoup(input)
        data = {}
        data['title'], data['sourceName'] = self._parse_title_and_source(soup)
        data['steps'] = self._parse_text_list(soup, "instruction")
        data['ingredients'] = self._parse_text_list(soup, "ingredient")
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

    def _parse_text_list(self, soup, class_name):
        list = []
        els = soup.find_all(class_=class_name)
        for el in els:
            text = el.get_text()
            if text.strip() != '':
                list.append(text)
        return list


def parse_recipe(input):
    parser = RecipeParser()
    return parser.parse_data(input)

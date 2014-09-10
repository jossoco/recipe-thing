from bs4 import BeautifulSoup
import re

class RecipeParser():

    def parse_data(self, input):
        soup = BeautifulSoup(input)
        data = {}

        title_parts = self._parseTitle(soup.title.string)
        if type(title_parts) is tuple:
            data['title'], data['sourceName'] = self._parseTitle(soup.title.string)
        else:
            data['title'] = title_parts
            data['sourceName'] = ''

        data['steps'] = self._parseTextList(soup, "instruction")
        data['ingredients'] = self._parseTextList(soup, "ingredient")
        return data

    def _parseTitle(self, title):
        parts = title.split(' - ')
        if len(parts) == 2:
            return (parts[0], parts[1])
        return title

    def _parseTextList(self, soup, class_name):
        list = []
        els = soup.find_all(class_=class_name)
        for el in els:
            list.append(el.get_text())
        return list


def parse_recipe(input):
    parser = RecipeParser()
    return parser.parse_data(input)

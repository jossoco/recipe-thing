from bs4 import BeautifulSoup
from exceptions import AttributeError

class RecipeParser():

    def parse_data(self, input):
        soup = BeautifulSoup(input)
        data = {}
        data['title'], data['sourceName'] = self._parse_title_and_source(soup)
        data['steps'] = self._parse_text_list(soup, "instruction")
        data['ingredients'] = self._parse_text_list(soup, "ingredient")
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

    def _parse_text_list(self, soup, class_name):
        list = []
        els = soup.find_all(class_=class_name)
        for el in els:
            text = el.get_text()
            if text.strip() != '':
                list.append(text)
        return list

    def _parse_image(self, soup):
        tagged_images = soup.find_all(attrs={'itemprop': 'image'})
        if len(tagged_images) == 1 and 'src' in tagged_images[0].attrs:
            return tagged_images[0].attrs['src']

        images = soup.find_all('img')
        if len(images) > 1:
            target_image = ''
            max_area = 0
            for image in images:
                area = self._get_image_area(image)
                if area > max_area:
                    max_area = area
                    target_image = image
            if target_image and 'src' in target_image.attrs:
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


def parse_recipe(input):
    parser = RecipeParser()
    return parser.parse_data(input)

#!/usr/bin/env python

import os
from liquidluck.writers.base import BaseWriter
from liquidluck.writers.core import PostWriter
from liquidluck.readers.base import Post
from liquidluck.options import g
try:
    import json
    _json_decode = json.loads
except ImportError:
    import simplejson
    _json_decode = simplejson.loads


class PackageWriter(BaseWriter):
    writer_name = 'package'

    def __init__(self):
        path = os.path.join(g.source_directory, 'package.json')
        if os.path.exists(path):
            f = open(path)
            g.resource['package'] = _json_decode(f.read())
            f.close()
        else:
            g.resource['package'] = {}

    def start(self):
        "We don't write anything."
        pass


class AraleWriter(PostWriter):
    writer_name = 'arale'

    def __init__(self):
        self._template = 'post.html'
        self._posts = {}
        for post in g.public_posts:
            if post.category:
                if post.category not in self._posts:
                    self._posts[post.category] = [post]
                else:
                    self._posts[post.category].append(post)

        g.resource['category'] = self._posts

    def start(self):
        for post in g.public_posts:
            self._arale_write(post)

    def _arale_write(self, post):
        template = post.template or self._template
        if post.clean_filepath == 'README.md':
            template = 'readme.html'
            dest = os.path.join(g.output_directory, 'index.html')
        else:
            dest = self._dest_of(post)

        self.render({'post': post}, template, dest)


class AralePost(Post):
    @property
    def date(self):
        try:
            order = int(self.meta.get('order', 0))
        except:
            order = 0
        return 100 - order

    @property
    def category(self):
        return self.clean_folder

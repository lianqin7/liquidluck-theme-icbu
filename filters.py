def read_more(content):
    import re
    from liquidluck.options import g
    tpl = g.jinja.get_template('more.html')
    html = tpl.render({'writer': {'filepath': 'index.html'}})
    return html + content

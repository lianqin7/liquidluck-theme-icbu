;(function() {
  if (location.href.indexOf('examples') > 0 || location.href.indexOf('tests') > 0 ||
      location.href.indexOf('docs') > 0) {
    var PAGE_ROOT = '..'
  } else {
    var PAGE_ROOT = '.'
  }

  var CDN_MODULES = [
    'jquery', 'zepto', 'json', 'jasmine', 'underscore', 'handlebars',
    'seajs', 'moment', 'async', 'store', 'swfobject', 'backbone', 'raphael'
  ]

  var ALIPAY_BASE = 'http://static.alipayobjects.com/static/arale/'
  var GITHUB_BASE = 'https://raw.github.com/aralejs/'
  var PACKAGE = {}

  var mapRules = []
  mapRules.push(function(url) {

    // CDN_MODULES 直接从 alipay 的 cdn 上加载
    for (var i = 0; i < CDN_MODULES.length; i++) {
      if (url.indexOf(CDN_MODULES[i] + '/') > 0) {
        return url.replace(GITHUB_BASE, ALIPAY_BASE)
      }
    }

    // 将 "/master/xxx.js" 转换成 "/master/dist/xxx.js"
    url = url.replace(/\/master\/([^\/]+\.js)$/, '/master/dist/$1')

    // 将 "/1.0.2/xxx.js" 转换成 "/1.0.2/dist/xxx.js"
    url = url.replace(/\/([\d\.]+)\/([^\/]+\.js)$/, '/$1/dist/$2')

    // 本地开发中的文件，直接从本地加载
    if (url.indexOf('src') < 0 && url.indexOf('dist') < 0) {
      var module = url.replace(GITHUB_BASE, '')
      url = url.replace(GITHUB_BASE, PAGE_ROOT + '/src/')
    }

    // 如果访问 alipay.im 则从 git.alipay.im 加载
    if ((location.hostname.indexOf('alipay.im') != -1 || location.hostname.indexOf('127.0.0.1') != -1 || location.hash == '#gitlab')
        && url.indexOf(GITHUB_BASE) != -1) {
      // 链接转换成 http://git.alipay.im/overlay/0.9.9/dist/overlay.js
      url = url.replace(GITHUB_BASE, 'http://git.alipay.im/')

      // 将 alipay/xbox 这样的链接转成 alipay_xbox
      var match = url.match(/http:\/\/git\.alipay\.im\/(.*?)\/[\d\.|master]+/)
      if (match && match.length == 2) {
        var m = match[1]
        url = url.replace(m, m.split('/').join('_'))
      }

      // http://git.alipay.im/overlay/0.9.9/blob?path=dist/overlay.js
      url = url.replace('dist', 'blob?path=dist')
    }

    return url
  })


  seajs.config({
    base: GITHUB_BASE,
    alias: {
      '$': 'jquery/1.7.2/jquery',
      '$-debug': 'jquery/1.7.2/jquery-debug',

      'jquery': 'jquery/1.7.2/jquery',
      'jquery-debug': 'jquery/1.7.2/jquery-debug',

      'zepto': 'https://a.alipayobjects.com/static/handy/zepto/0.9.0/zepto.js',
      '_': 'underscore/1.3.3/underscore'

    },
    map: mapRules,
    preload: [
      'seajs/plugin-json',
      'seajs/plugin-text'
    ]
  })

  var aliasIsParsed = false
  var _use = seajs.use

  if (location.href.indexOf('/tests/runner.html') > -1 ||
      location.href.indexOf('/examples') > -1) {
    seajs.use = function(ids, callback) {
      _use(PAGE_ROOT + '/package.json', function(data) {

        if (aliasIsParsed === false) {
          PACKAGE = data
          // 有可能存在 { '$': '$' } 配置，需排除掉
          data.dependencies && (delete data.dependencies['$'])
          data.devDependencies && (delete data.devDependencies['$'])

          seajs.config({ alias: data.dependencies })
          seajs.config({ alias: data.devDependencies })

          aliasIsParsed = true
          seajs.use = _use
        }

        _use(ids, callback)
      })
    }
  }
})();

seajs.use(['$', '_'], function($, _) {

  if (location.hostname.indexOf('alipay.im') === -1) {
    return;
  }

  var GitlabBaseUrl = "http://git.alipay.im";

  // 增加一个全局导航触发点
  var search = $('<input placeholder="搜索组件，回车到达" type="text" id="search" />' +
    '<button id="update">更新文档</button>');
  if ($('.document-list').length) {
    search.appendTo($('.document-list'));
  } else {
    search.appendTo($('.sidebar-components'));
  }

    $('#update').click(function() {
      $(this).html('更新中...').attr('disabled', 'disabled');
      $.get('/-webhook', function() {
        location.reload();
      });
    });

    // 载入组件信息
    $.get('/json/info.json', function(data) {
      $(['infrastructure', 'utility', 'widget', 'alipay']).each(function(i, item) {
        var html = '<div class="document-item"><h3>' + item + '</h3><ul class="document-section fn-clear">',
        projects = data[item];
        if(!projects.length) {
          html += '<li class="' + item + '"><a href="#">暂无</a></li>';
        }
        for(var i=0; i<projects.length; i++) {
          var name = (item !== 'alipay') ? projects[i].name : item + '_' + projects[i].name;
          html += '<li class="' + item + '">';
          html += '<a class="name" href="http://' + location.hostname + '/' + name + '">' + projects[i].name + '</a>';
          html += '<p class="version" title="当前版本">' + projects[i].version + '</p>';          
          html += '<p class="desc" title="' + (projects[i].description||'No description') + '">' + (projects[i].description||'No description') + '</p>';
          html += '<p class="link">\
                   <a href="' + GitlabBaseUrl + '/' + name + '">源码</a> \
                   <a href="http://' + location.hostname + '/' + name + '/history.html">历史</a> \
                   <a href="http://' + location.hostname + '/' + name + '/tests/runner.html">用例</a></p>';
          var tagsHtml = '';
          $(projects[i].tags).each(function(i, item) {
            tagsHtml += '<a href="' + GitlabBaseUrl + '/' + name + '/' + item + '/tree">' + item + '</a>';
          });
          html += '<p class="tags">' + (tagsHtml?('Tags: '+tagsHtml):'No tags') + '</p>';
          html += '</li>';
        }
        html += '</ul></div>';
        $('#update').before($(html));

        $('.sidebar').show();
        $('#search').focus();
      });
    }, 'json');

    // 搜索功能
    $('#search').on('keyup', function(e) {
      var str = $(this).val();
      $('.document-item li > a').each(function(i, item) {
        $(item).parent()[ ($(item).html().indexOf(str) !== -1) ? 'show' : 'hide' ]();
      });
    }).on('keypress', function(e) {
      if (e.keyCode === 13) {
        location.href = $('.document-item li:visible a')[0].getAttribute('href');
      }
    });

    // 在文档显示 CDN
    var cdn = $('.entry-cdn');
    if (cdn.length) {
        var url = [location.origin, 'source'];
        var name = cdn.data('name').split('_');
        var root = (name.length == 1) ? 'arale' : 'alipay';
        var module = name.pop();
        url = url.concat(name).concat('info.json');

        $.get('/json/' + root + '.json', function(data) {
            var versions = _.keys(data[module]).sort();
            var lastest = versions.pop();
            var files = data[module][lastest];

            var fileExist = true, fileList = [];
            $.each(_.keys(files), function(i, o) {
                var u = ['https://a.alipayobjects.com/static', root, module, lastest, o].join('/');
                fileList.push(u);
                if (files[o].online === 404) {
                    fileExist = false;
                }
            });

            if (fileExist) {
                var fileList = $.map(fileList, function(o, i) {
                    return '<br><a href="' + o + '" target="_blank">' + o + '</a>';
                });
                cdn.html('最新版本: ' + fileList.join(''));
            } else {
                cdn.html('最新版本: ' + lastest + ' 暂未发布');
            }

        }, 'json');
    }
});

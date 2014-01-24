from django.conf.urls import patterns, url
from polls import views

''' Version 1: manually generate view pages.

urlpatterns = patterns('',
                       url(r'^$', views.index, name                           = "index"),
                       url(r'^(?P<pollid>\d+)/$', views.detail, name          = "detail"),
                       url(r'^(?P<pollid>\d+)/results/$', views.results, name = "results"),
                       url(r'^(?P<pollid>\d+)/vote/$', views.vote, name       = "vote"),
)

'''

''' Version 2: generic views '''

urlpatterns                                                                              = patterns('',
                       url(r'^$', views.IndexView.as_view(), name                        = "index"),
                       url(r'^(?P<pk>\d+)/$', views.DetailView.as_view(), name         = "detail"),
                       url(r'^(?P<pk>\d+)/results/$', views.ResultView.as_view(), name = 'results'),
                       url(r'^(?P<pollid>\d+)/vote/$', views.vote, name = 'vote'),
                                                          
)
    



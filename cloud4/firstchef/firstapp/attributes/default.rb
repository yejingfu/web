#apache configuration
default['firstapp']['server_name'] = 'firstapp.localdomain'
default['firstapp']['docroot'] = '/home/user/firstapp'

#deploy
default['firstapp']['deploydir'] = '/home/user/firstapp/deploy'   # no need to create deploy firstly
#default['firstapp']['deployrepo'] = 'git@github.com/yejingfu/firstrepo'    # private repos
default['firstapp']['deployrepo'] = 'git://github.com/yejingfu/firstrepo' # public repos  #https://github.com/yejingfu/firstrepo.git
default['firstapp']['deploybranch'] = 'master'  # HEAD?

#default['firstapp']['deploydir'] = '/srv/firstapp'
#default['firstapp']['deployrepo'] = 'git@github.com:jasongrimes/hello_app' # Format for private repos
#default['firstapp']['deployrepo'] = 'git://github.com/jasongrimes/hello_app' # Format for public repos
#default['firstapp']['deploybranch'] = 'HEAD'
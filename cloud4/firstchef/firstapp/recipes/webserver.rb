#
# Cookbook Name:: firstapp
# Recipe:: webserver
#
# Copyright 2013, YOUR_COMPANY_NAME
#
# All rights reserved - Do Not Redistribute
#

appName = 'firstapp'
appConf = node[appName]

include_recipe "apache2"
include_recipe "apache2::mod_php5"

# call resource "web_app" which is defined under definations of apache2
web_app appName do
    server_name appConf['server_name']
    docroot appConf['docroot']
    template "#{appName}.conf.erb"
    log_dir node['apache']['log_dir']
end

#deploy
deploy_revision node[appName]['deploydir'] do
    scm_provider Chef::Provider::Git
    repo node[appName]['deployrepo']
    revision node[appName]['deploybranch']
    enable_submodules true
    shallow_clone false
    symlink_before_migrate({}) # Symlinks to add before running db migrations
    purge_before_symlink %w{tmp public config}    # same to: ["tmp" "public" "config"]    #Directories to delete before adding symlinks
    create_dirs_before_symlink ["tmp", "public", "config"] #  same to:%w{tmp public config} #Directories to create before adding symlinks
    symlinks({"config/dd.txt" => "aa.txt"})  # first value is {deployDir}/shared/config/dd.txt 
                                                                # second value is {deployDir}/current/Breadcrumb.txt
                                                                # linker: second point to first
    action :force_deploy    # force_deploy, deploy, rollback
end

# todo
# again
bash 'runprint' do
    cwd "#{node['firstapp']['docroot']}"
    code <<-EOH
        ./print.sh
        EOH
end

#restart service
service "apache2" do
    action :restart
end
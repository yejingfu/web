#
# Cookbook Name:: cloudgroup4
# Recipe:: webserver
#
# Copyright 2013, YOUR_COMPANY_NAME
#
# All rights reserved - Do Not Redistribute
#

appName = 'cloudgroup4'
appConf = node[appName]

include_recipe "apache2"
include_recipe "apache2::mod_php5"

directory "#{node['cloudgroup4']['root']}" do
    owner "ubuntu"
    group "ubuntu"
    mode  00777
    action :create
end

directory node['cloudgroup4']['docroot'] do
    owner "ubuntu"
    group "ubuntu"
    mode  00777
    action :create
end

directory node['cloudgroup4']['services'] do
    owner "ubuntu"
    group "ubuntu"
    mode  00777
    action :create
end

# call resource "web_app" which is defined under definations of apache2
web_app appName do
    server_name appConf['servername']
    docroot appConf['docroot']
    template "#{appName}.conf.erb"
    log_dir node['apache']['log_dir']
end


template "#{node['cloudgroup4']['docroot']}/index.html" do
  source "#{appName}.index.erb"
  mode "0644"
end

template "#{node['cloudgroup4']['services']}/install.sh" do
  source "#{appName}.installn2h2.erb"
  mode "0755"
end

bash 'runprint' do
    cwd "#{node['cloudgroup4']['services']}"
    code <<-EOH
        ./install.sh -v -mo -z -h
        EOH
end

#restart service
service "apache2" do
    action :restart
end
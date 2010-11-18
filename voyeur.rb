require 'rubygems'
require 'bundler'
Bundler.setup :default, ENV['RACK_ENV']

require 'json'
require 'sinatra'
require 'haml'
require 'httparty'

set :views, File.expand_path('views', File.dirname(__FILE__))
set :public, File.expand_path('public', File.dirname(__FILE__))
set :haml, { format: :html5 }

helpers do
  def url(neighbor)
    "http://#{neighbor}.ci.moneydesktop.com"
  end
  
  def ping_url(neighbor)
    url(neighbor)+'/ping'
  end
  
  def build_url(neighbor)
    url(neighbor)
  end
end

get '/?' do
  haml :index
end

get '/:neighbor/update.json' do
  content_type :json
  response = HTTParty.get(ping_url(params[:neighbor]))
  {
    :code => response.code,
    :body => response.body
  }.to_json
end

post '/:neighbor/build' do
  `curl -X POST #{build_url(params[:neighbor])}`
end
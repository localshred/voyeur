require 'rubygems'
require 'bundler'
Bundler.setup :default, ENV['RACK_ENV']

require 'json'
require 'sinatra'
require 'haml'
require 'httparty'
require 'digest/md5'

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
  
  def get_commit_info(ping_response)
    info = {}
    return info if ping_response.body =~ /building/
    
    begin
      head_log = nil
      if ENV['RACK_ENV'] == 'development'
        head_log = "/code/src/md/#{params[:neighbor]}/.git/logs/HEAD"
      else
        head_log = "/home/git/#{params[:neighbor]}.git/logs/HEAD"
      end
      
      log = File.read(head_log)
      current_commit = ping_response.body.gsub(/\s+/, '')
      if log.match(/^[^\s]+\s+(#{current_commit})\s+([^<]+)\s+<([^>]+)>\s+(\d+) -\d+\s+([^:]+:\s+.*)(?:^0)?$/)
        info = {
          :sha => current_commit,
          :author => {
            :name => $2,
            :email => $3,
            :email_hash => Digest::MD5.hexdigest($3.downcase.strip)
          },
          :time => Time.at($4.to_i).strftime('%F %T'),
          :message => $5
        }
      end
    rescue
      puts 'unable to load commit info for %s: %s' % [params[:neighbor], $!.message]
    end
    
    info
  end
  
end

get '/?' do
  haml :index
end

get '/:neighbor/update.json' do
  content_type :json
  ping_response = HTTParty.get(ping_url(params[:neighbor]))
  {
    :code => ping_response.code,
    :body => ping_response.body,
    :commit => get_commit_info(ping_response)
  }.to_json
end

post '/:neighbor/build' do
  HTTParty.post(build_url(params[:neighbor]))
  # `curl -X POST #{build_url(params[:neighbor])}`
end

require 'rubygems'
require 'bundler'
Bundler.setup :default, ENV['RACK_ENV']

require 'json'
require 'sinatra'
require 'haml'
require 'httparty'
require 'grit'
require 'digest/md5'

set :views, File.expand_path('views', File.dirname(__FILE__))
set :public, File.expand_path('public', File.dirname(__FILE__))
set :haml, { format: :html5 }
enable :can_ping

get '/?' do
  haml :index
end

get '/:neighbor/update.json' do
  content_type :json
  if settings.can_ping?
    ping_response = HTTParty.get(ping_url(params[:neighbor]))
    {
      :code => ping_response.code,
      :body => ping_response.body,
      :commit => get_commit_info(ping_response)
    }.to_json
  else
    states = %w(ok building failed)
    which = rand(states.size) - 1
    code = states[which] != 'ok' ? 412 : 200
    body = states[which] == 'building' ? 'building' : nil
    {
      :code => code,
      :body => body,
      :commit => get_commit_info(OpenStruct.new(:code => code, :body => body), states[which])
    }.to_json
  end
end

post '/:neighbor/build' do
  HTTParty.post(build_url(params[:neighbor]))
end

helpers do
  def url(neighbor)
    "http://#{neighbor}.ci.myapp.com"
  end
  
  def ping_url(neighbor)
    url(neighbor)+'/ping'
  end
  
  def build_url(neighbor)
    url(neighbor)
  end
  
  def get_commit_info(ping_response, status=nil)
    info = {}
    repo = git_repo(params[:neighbor])
    
    begin
      if ping_response.body =~ /building/ || ping_response.body.nil? || status == 'failed'
        commit = repo.commits.first
      else
        sha = ping_response.body.gsub(/\s+/, '')
        commit = repo.commits(sha, 1).first
      end
      
      info = {
        :sha => commit.id,
        :author => {
          :name => commit.author.name,
          :email => commit.author.email,
          :email_hash => Digest::MD5.hexdigest(commit.author.email.downcase)
        },
        :time => commit.committed_date,
        :message => commit.message
      }
    rescue
      puts 'Unable to load commit info for %s: %s' % [params[:neighbor], $!.message]
    end
    
    info
  end
  
  def git_repo(neighbor)
    path = development? ? "/code/src/md/#{neighbor}" : "/home/git/#{neighbor}.git"
    Grit::Repo.new(path)
  end
  
end

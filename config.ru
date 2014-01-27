require 'rubygems'
require 'bundler'
Bundler.setup :default, ENV['RACK_ENV']

require 'sinatra'
 
Sinatra::Application.set(
  :run => false,
  :env => :production
)
 
require './voyeur'
run Sinatra::Application
# unicorn -c /srv/voyeur/config/unicorn.rb -E production -D

env = ENV['RACK_ENV'] || 'production'

# 1 worker and 1 master
worker_processes 1
preload_app true
timeout 30
pid "/srv/voyeur/tmp/pids/abacus.pid"
listen '/srv/voyeur/tmp/sockets/abacus.sock', :backlog => 2048
stderr_path "/srv/voyeur/log/unicorn.log"
stdout_path "/srv/voyeur/log/unicorn.log"

before_fork do |server, worker|
  old_pid = "#{server.config[:pid]}.oldbin"
  if File.exists?(old_pid) && server.pid != old_pid
    begin
      Process.kill("QUIT", File.read(old_pid).to_i)
    rescue Errno::ENOENT, Errno::ESRCH
      # someone else did our job for us
    end
  end
end

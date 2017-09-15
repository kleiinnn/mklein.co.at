---

title: Automatic Deployment of Middleman Applications
date: 2017-09-14 10:53 UTC
tags:

---


As I have already mentioned in the [introductory post](blog/2017/06/03/hello-world.html), my website and its blog is not dynamic webpage powered by a traditional blogging software or any other kind of backend software. Instead, I decided to use the static site generator called [Middleman](https://middlemanapp.com/).

## Static site generators
Before I continue, I briefly want to outline how static site generators work and why continuous deployment is necessary (or at least very convenient) for such webpages.

Static site generators like Middleman or Jekyll are web template systems whose output are static web pages (just HTML, CSS and maybe JavaScript files). Those can be directly deployed to a web server without needing any additional backend software. All web page rendering is done prior to deployment on the editor’s local system (or any CI or CD server).

This also means that the site needs to be newly deployed every time the content changes (e.g. a new blog post has been added). Especially with frequent website changes, manual deployment quickly gets annoying. It also means a big convenience drawback compared to blogging software where post can be published with a single click.

## Deployment Process
I use git for versioning my website, the repository is hosted on GitHub while the real website run on my [Uberspace](https://uberspace.de). The idea was to automatically build and deploy the Middleman app every time I push changes to GitHub as it would allow me to seamlessly integrate the deployment into my development workflow.

There are many great (often free) CI and CD services that allow setups just like I described above. However, involving a third party service for such a simple task appears overly complex to me. Fortunately, GitHub allows to setup [web-hooks](https://developer.github.com/webhooks/) which automatically get called on certain events (like pushes).
This enables me to clone, build and deploy the website directly on my server. The result is a neat Ruby script that runs a [Sinatra](http://www.sinatrarb.com/) webserver implementing a single endpoint.

```ruby
require 'sinatra'

require 'thread'

SECRET = 'secret!'
TARGET = './deploy'
BRANCH = 'new'

set :port, 1234

mutex = Mutex.new

post '/' do
    raw_body = request.body.read
    body = JSON.parse(raw_body)
    verify_signature(raw_body)

    if body['ref'] == 'refs/heads/' + BRANCH
        Thread.new do
            mutex.synchronize do
                system 'git', 'clone', '-b', BRANCH, body['repository']['url'], 'build'
                Bundler.with_clean_env do
                    system 'cd build && bundle install && npm install && bundle exec middleman build'
                end
                system 'cp', '-r', 'build/build', TARGET
                system 'rm -rf build'
            end
        end
    end
    'done'
end

def verify_signature(payload_body)
  signature = 'sha1=' + OpenSSL::HMAC.hexdigest(OpenSSL::Digest.new('sha1'), SECRET, payload_body)
  return halt 500, "Signatures didn't match!" unless Rack::Utils.secure_compare(signature, request.env['HTTP_X_HUB_SIGNATURE'])
end
```

The deployment process consists of cloning the repo, installing middleman and all other dependencies, building the app and deploying it to the document root of the webserver. As all those steps take some time and, due to HTTP request timeout, cannot be processed directly in the Sinatra handler function. Therefore, the actual deployment is handled in a separate thread, a common mutex ensures that no more than one thread is active at a time.

For security reasons, we want to make sure to handle only request coming directly from GitHub (an attacker could easily trigger a high number of deployments by simply sending a massive flood of HTTP requests). In order to do so, GitHub offers signing the requests with an HMAC. The `verify_signature` function compares the server-generated and the request signatures and if they do not match, the request is being terminated.

With this script running on my webserver, my website (which includes this blog) is automatically deployed as soon as I push changes to the corresponding repository. Maybe this helps you with implementing your own deployment process. Feel free to used the script as you like, I dedicate it to the [public domain](http://unlicense.org/).

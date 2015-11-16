---
layout: docs
title: Securing Quasar
permalink: /docs/securingquasar/
docs_navbar: true
---

There are several methods of restricting access to Quasar.  This Quick Guide
focuses on configuring Quasar to run on a specific host with Nginx providing
basic http authorization on a separate host.

This quick guide does not give detailed instructions on how to setup
firewall rules or configure applications other than Quasar and Nginx.

This guide covers:

* Assumptions
* Architecture Overview
* Installing Quasar Manually
* Testing Quasar
* Installing Nginx
* Configuring Nginx
{:toc}


## Assumptions

For the example in this quick guide, we'll continue with the following
assumptions:

* 192.168.138.220: IP address of MongoDB host, already running on port 27017
* 192.168.138.210: IP address of Quasar host
* 192.168.138.200: IP address of Nginx host
* If network security policy dictates, then network communication between hosts is
  restricted via ipchains or other firewall mechanism.  This allows
  simpler Quasar and Nginx configuration files.
* The reader has at least a basic understanding of JSON formatting and the Linux OS
* Running on Ubuntu 14.04 or similar.  If using RedHat, use 'yum' rather than 'apt-get' for software management.
* You have version 2.2.1 or newer of the Quasar source code.

If your IP addresses differ, change as appropriate.


## Architecture Overview

![Architecture Overview](/img/restrict-quasar.png)

As can be noted from the above diagram, the network communications path is straight forward:

1. A request comes into the Nginx proxy.  Note that the proxy in this configuration
   has no special restrictions about who can access it.
2. Nginx first authenticates the user via standard http auth.  More about this in the
   authorization section below.
3. After appropriate authentication, Nginx acts as a proxy for the request and will send the
   request to Quasar on behalf of the client.
4. Quasar runs the appropriate tasks on the data source, MongoDB in this case, and
   returns the results back upstream, through Nginx to the client.


## Installing Quasar Manually

The first step is to download Quasar and build the source:

### Download and Build Quasar

<pre class="code-snippet">
git clone https://github.com/quasar-analytics/quasar
cd quasar
./sbt test
./sbt 'project web' oneJar
./sbt 'project core' oneJar
</pre>

These commands will download the latest source code, run the test suite,
and build both the Web and Core projects jar files.

### Configure Quasar

Configure the Quasar server to connect to MongoDB.  Assuming there is a MongoDB
databased called 'testdb' running on 192.168.138.220, your configuration file may
be called quasar-config.json and look like this:

    {
      "mountings": {
          "/local": {
              "mongodb": {
                  "connectionUri": "mongodb://192.168.138.220/testdb"
              }
          }
      },
      "server": { "port": 8080 }
    }

For further details on the format of the configuration file, please see the
Quasar [Configuration](/docs/quasarconfiguration) documentation.


## Testing Quasar

### Start the Core jar file

From the Quasar server, run the core jar file to verify you have connectivity and your mounting is correct:

<pre class="code-snippet">
java -jar 
  ~/quasar/core/target/scala-2.11/core_2.11-2.2.1-SNAPSHOT-one-jar.jar
  ~/quasar-config.json
</pre>

Once launched, a [REPL](https://en.wikipedia.org/wiki/Read–eval–print_loop) console will appear representing
a virtual file system where each MongoDB database is a directory, and each database directory contains one
or more MongoDB collections.

Notice how the the OS-like file system commands and SQL commands are executed directly after the $ prompt:

  💪 $ ls
  local@
  💪 $ cd local
  💪 $ ls
  local/
  quasar-test/
  testdb/
  💪 $ cd testdb
  💪 $ ls
  coll1
  💪 $ select * from coll1;
  Mongo
  db.coll1.find();


Results:

  Query time: 0.0s
   name    | age   | gender  | minor  |
  ---------|-------|---------|--------|
   Johnny  |  42.0 | male    |  false |
   Jenny   |  27.0 | female  |  false |
   Deb     |  33.0 | female  |  false |
   Billy   |  15.0 | male    |   true |


### Start the Web jar file

Once you have verified proper connectivity between Quasar and MongoDB, stop the Core jar file
and now start the Web jar file with a slightly different syntax to point to the configuration file:

<pre class="code-snippet">
java -jar
  ~/quasar/web/target/scala-2.11/web_2.11-2.2.1-SNAPSHOT-one-jar.jar
  -c ~/quasar-config.json
</pre>

Congratulations!  You now have two of the three necessary systems up and running for this configuration.


## Installing Nginx

### OS X
On OS X systems, consider using [HomeBrew](http://brew.sh/) to install Nginx:

<pre class="code-snippet">
brew install nginx
</pre>


### Redhat / CentOS
On RedHat or CentOS systems:

<pre class="code-snippet">
sudo yum install nginx
</pre>

### Ubuntu / Debian
On Ubuntu or Debian systems:

<pre class="code-snippet">
sudo apt-get install nginx
</pre>


## Configuring Nginx

There are two main reasons we'll modify the Nginx configuration file in this guide:

1. To force user authentication, thus restricting access to known individuals
2. To redirect queries to the Quasar engine on another host, thus limiting the
   access path to the Quasar API to individuals authenticated with Nginx.

By combining firewall rules on the Quasar server that only allow HTTP
requests from the Nginx server, we essentially limit all communication
to the Quasar API from only a single system which also forces user
authentication.

This example will use the 'default' Nginx site configuration. Nginx has many
configuration files and is a versatile tool, please contact your Nginx
application administrator if you have questions, or visit the Nginx web site.

If Nginx is already running, stop it:

<pre class="code-snippet">
sudo service nginx stop
</pre>


### Setting up Authentication

To allow http authentication, we'll need to create a file which stores the
names and passwords of allowed individuals.  To do this, use the apache2-utils
package which provides those tools:

<pre class="code-snippet">
sudo apt-get install apache2-utils
</pre>

Now create the htpasswd file we'll use to store the encrypted data:

<pre class="code-snippet">
sudo htpasswd -c /etc/nginx/.htpasswd exampleuser
</pre>

Replace 'exampleuser' with a real username.  You'll then be prompted for
a password and verification password.

This creates the file /etc/nginx/.htpasswd which we will reference in the
Nginx configuration file below.

Assuming the Nginx site configuration file is located at
/etc/nginx/sites-available/default, paste the following code directly after the
'server {' declaration, somewhere around line 20:

    listen 80;
    server_name your_nginx_server_name;
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    location / {
            auth_basic "Restricted";
            auth_basic_user_file /etc/nginx/.htpasswd;
            proxy_set_header X-Forwarder-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $http_host;
            proxy_redirect off;
            proxy_pass http://192.168.138.210:8080;
    }

The configuration above ensures the following important actions:

1. Nginx runs on port 80
2. Enables http authentication (lines beginning with 'auth_basic')
3. Nginx acts as a reverse proxy to the Quasar service, requesting data for the client

Save the configuration and start or restart Nginx:

<pre class="code-snippet">
sudo service nginx restart
</pre>

At this point the Quasar application should be shielded from all requests
except those coming directly from the Nginx host.  Additionally all requests
coming from the Nginx host should only originate from authenticated users via
http authentication.

Test authentication with a browser.  Use the URL based on the quasar-config.json
file above:

    http://192.168.138.210/fs/data/local/testdb/coll1

An authentication prompt should appear.  Enter the username and password you
specified with the htpasswd command above.  If successful, Quasar should then
you the entire 'coll1' collection in JSON format

Note that you are sending the request to Nginx (IP .210), which authenticates
a username, sends the request to Quasar, then returns the results directly to
the browser.  The browser itself is not redirected as that would defeat the purpose
of securing with Nginx.







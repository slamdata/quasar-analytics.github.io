---
layout: docs
title:  Quasar Configuration
permalink: /docs/quasarconfiguration
docs_navbar: true
---

This manual describes how to install and configure Quasar on a server. 

The manual covers:

* Prerequisites
* Building from the Source Code
* Configuration
* Obtaining the Web JAR File
* Running the JAR Files
* Troubleshooting
{:toc}


## Prerequisites

Java 8 or higher is required. The most recent version of Java can be 
downloaded for Windows, Mac, and Linux
at the [Java download page](https://java.com/en/download/manual.jsp).


## Building from the Source Code

Source code for both the the REPL (i.e., command-line) and web JAR files are available on 
GitHub, as well as the compiled web JAR file. This section
describes how to build from the source code. If you don't wish to build from source code,
you can use the instructions in the next section, which describe how to obtain the
[the compiled web JAR file](#obtaining-the-web-jar-file).

You can download the source code from GitHub using git, which requires a Bash shell
(standard terminal for Unix and Mac OS X, and Cygwin with the git package for Windows). 
Use the following command:

<pre class="code-snippet">
git clone git@github.com:quasar-analytics/quasar.git
</pre>

You can also visit the [Quasar GitHub web page](https://github.com/quasar-analytics/quasar)  
and download the zip file from the **Download ZIP** button.


### Compile and Run Tests

To compile the project and run tests, execute the following command:

<pre class="code-snippet">
./sbt test
</pre>

If successful, there should be no failed tests and the last line will begin with
`[success]`.

**Note:** Some tests involve making connections to a sample MongoDB instance. 
If the instance is not working, you may see some failures, but this doesn't mean
that the build was not successful.


### REPL Jar

To build a JAR for the REPL, which allows entering commands at a command-line prompt, execute the following command:

<pre class="code-snippet">
./sbt 'project core' oneJar
</pre>

The path of the JAR will be ./core/target/scala-2.11/core_2.11-\<version\>-SNAPSHOT-one-jar.jar, where \<version\> is the Quasar version number.


### Web JAR

To build a JAR containing a lightweight HTTP server that allows you to programmatically interact with Quasar through API requests, execute the following command:

<pre class="code-snippet">
./sbt 'project web' oneJar
</pre>

The path of the JAR will be ./web/target/scala-2.11/web_2.11-\<version\>-SNAPSHOT-one-jar.jar, where \<version\> is the Quasar version number.


## Obtaining the Web JAR File

Instead of building the web JAR file, you can download it directly from 
the [Quasar Releases](https://github.com/quasar-analytics/quasar/releases) page.
Download the most recent JAR file in the section with this format: 
**Web v\<version\>-web**, where \<version\>
is the version number and extract it in a directory.


## Configuration

The Quasar JAR files can be configured by using a command-line argument to indicate the 
location of a JSON configuration file. If no config file is specified, it is assumed 
to be quasar-config.json, in one of the following locations:

* On Windows, it searches for the file in the following locations in this order:
    1. `%USERPROFILE%\AppData\Local\quasar\quasar-config.json`
    2. `%USERPROFILE%\quasar\quasar-config.json`
* On Mac OS X, it searches for the file in the following location:
    $HOME/Library/Application Support/quasar/quasar-config.json
* On Linux systems, it searches for the file in the following location:
    $HOME/.config/quasar/quasar-config.json

The JSON configuration file has the following format:

    {
      "server": {
        "port": <port>
      },

      "mountings": {
        "<path>": {
          "mongodb": {
            "connectionUri": "<connectionURI>"
          },
        "<path>": {
          "mongodb": {
            "connectionUri": "<connectionURI>"
          },
          ...
        }
      }
    }

where \<port\> is the port number, \<path\> is a unique path where the database will 
be mounted, and \<connectionURI\> is the MongoDB connection URI. There can be one or
more objects in the mountings, as long as they each have a unique path as the key value.

\<connectionURI\> is a [standard MongoDB](http://docs.mongodb.org/manual/reference/connection-string/)
connection string. Only the primary host is required to be present. 
The database name inside the connection URI is required if and only if a username and
password are required. Additional hosts and options may be included as 
specified in the linked documentation.

For example, say a MongoDB instance is running on the default port on the same machine as 
the Quasar sever, which is to use port 8080. Then the configuration file might 
look like this:

    {
      "server": {
        "port": 8080
      },

      "mountings": {
        "/local": {
          "mongodb": {
          "connectionUri": "mongodb://localhost/test"
          }
        }
      }
    }

The Quasar file system would then contain the path `/local/test/`.


## Running the JAR Files

Open up a terminal and navigate to where the JAR files are either build or extracted.


### REPL JAR

To run the REPL (i.e., command-line) JAR, type this command:

<pre class="code-snippet">
java -jar <path> [<config file>]
</pre>

where \<path\> is the path to the JAR file and \<config file/> is an optional path
to the configuration file. See the [Configuration](#configuration) section for details
on the default path of the configuration file.


### Web JAR

To run the a lightweight HTTP server that allows you to programmatically interact with Quasar through API requests, type the following command:

<pre class="code-snippet">
java -jar <path> [-c <config file>]
</pre>

where \<path\> is the path to the JAR file and \<config file/> is an optional path
to the configuration file. See the [Configuration](#configuration) section for details
on the default path of the configuration file.

If successful, you will see the message:

    Embedded server listening at port <port>

where \<port\> is the port number specified in the configuration file.


## Troubleshooting

First, make sure that the Quasar Github repo is building correctly (the status is displayed at the top of the README).

Then, you can try the following command:

<pre class="code-snippet">
./sbt test
</pre>

This will ensure that your local version is also passing the tests.

Check to see if the problem you are having is mentioned in
[JIRA](https://slamdata.atlassian.net/issues/?filter=-4&jql=component%20%3D%20Quasar%20ORDER%20BY%20createdDate%20DESC)
and, if it isn't, feel free to create a new issue.

Chat directly with our team of Quasar contributors on
[Gitter](https://gitter.im/quasar-analytics/quasar)

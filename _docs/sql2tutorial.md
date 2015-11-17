---
layout: docs
title: SQL² Tutorial
permalink: /docs/sqltutorial/
docs_navbar: true
---

* Setup
* Running the REPL Console
* Changing Collections
* Basic Queries
* String and Math Operations
* Grouping Data
* String Matching
* Date and Time Data
{:toc}


## A Brief Introduction to SQL<sup>2</sup>

This is a short tutorial on how to use SQL<sup>2</sup> to query a MongoDB data source. For more
details on SQL<sup>2</sup>, read the 
[SQL<sup>2</sup> Reference Guide](/docs/sqlreference).

SQL<sup>2</sup> is a subset of ANSI SQL, with support for every major SQL SELECT clause
(`AS`, `WHERE`, `JOIN`, `GROUP BY`, `HAVING`, `LIMIT`, `OFFSET`, `CROSS`, etc.) and many SQL functions
and operators. It follows Postgres where SQL dialects diverge.

This tutorial will walk through importing sample data, running the Quasar
REPL console and executing various query types against the data inside the
console.


## Setup

You will use several sample datasets for this tutorial.  Right-click on the following
links to save them.

The following file contains latitude, longitude and population data for various cities in the US.


* The [MongoDB 'Zips' dataset](http://media.mongodb.org/zips.json?_ga=1.138295545.8598417.1408291048)

The following file contains nested data in arrays as well as Date and Time values.

* The [Slamengine 'Commits' dataset](https://raw.githubusercontent.com/damonLL/tutorial_files/master/slamengine_commits)

<br/>
Now use `mongoimport` to import the data, as an example:

<pre class="code-snippet">
mongoimport --host mdbserver -d tutorial -c zips zips.json
</pre>

output:

    2015-11-17T11:15:40.028-0600  connected to: mdbserver
    2015-11-17T11:15:40.339-0600  imported 29353 documents

<pre class="code-snippet">
mongoimport --host mdbserver -d tutorial -c commits commits.json
</pre>

output:

    2015-11-17T11:37:35.279-0600  connected to: mdbserver
    2015-11-17T11:37:35.287-0600  imported 30 documents

<br/>
Verify your data within MongoDB:

<pre class="code-snippet">
mongo mdbserver:27017/tutorial
</pre>

output:

    MongoDB shell version: 3.0.6
    connecting to: mdbserver:27017/tutorial
    mdbserver(mongod-3.0.6) tutorial>

<pre class="code-snippet">
show collections
</pre>

output:

    commits            → 0.097MB / 0.039MB
    zips               → 2.646MB / 1.422MB


## Running the REPL Console

If you haven't already, download and build the Quasar core target.  Find out
more by following the following Build doc link:

* [Building Quasar](/docs/buildingquasar)

Once the core project target is successfully built and running (as discussed
in the document above) you can begin querying the data source.  For the remainder
of the tutorial we will assume you will be using the `tutorial` database and either
the `zips` or `commits` collection.

Ensure you have a valid quasar-config.json file before starting the REPL console.
More information can be found in the
[Configuration section of the Building Quasar](/docs/buildingquasar/#configuration) document.

An example configuration follows:

    {
      "server": {
        "port": 8080
      },
      "mountings": {
        "/": {
          "mongodb": {
            "connectionUri": "mongodb://mdbserver/tutorial"
          }
        }
      }
    }


To connect to the data source with the REPL console, follow this example command,
changing `2.2.3` to the appropriate version if necessary

<pre class="code-snippet">
java -jar \
~/path/to/core_2.11-2.2.3-SNAPSHOT-one-jar.jar \
-c ~/quasar-config.json
</pre>

<div class="alert alert-warning">
  <span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Backslashes
<p>Note that when you encounter a backslash (\) character in this tutorial, it is provided
to allow copy and paste from the box above to your console.  When typing on one continuous
line there is no need for the backslash (\) character.</p>
</div>

You will be presented with the following prompt:

    💪 $

This is the REPL Console command prompt.  From here you can execute queries and
change databases and collections as if inside a file system.


## Changing Collections

Within the REPL Console, to switch collections within a database it's similar to
switching directories within a file system.  First, get a listing (ls) of the
collections that exist and your current location:

<pre class="code-snippet">
ls
</pre>

output:

    .trash/
    convert/
    demo/
    local/
    meteor/
    test/
    tutorial/
    💪 $


Change to the tutorial database and get a new listing:

<pre class="code-snippet">
cd tutorial
ls
</pre>

output:

    commits
    zips

At this point queries you can refer to collections without
providing a fully qualified path such as `commits`.  Collections can also be
referred to with the fully qualified path such as `/tutorial/commits` instead.


## Basic Queries

The most basic query is executed like this:

<pre class="code-snippet">
SELECT * FROM zips
</pre>

output:

    Mongo
    db.zips.find();


    Query time: 0.5s
     city          | loc[0]      | loc[1]     | pop    | state |
    ---------------|-------------|------------|--------|-------|
     AGAWAM        |  -72.622739 |  42.070206 |  15338 | MA    |
     BARRE         |  -72.108354 |  42.409698 |   4546 | MA    |
     BLANDFORD     |  -72.936114 |  42.182949 |   1240 | MA    |
     BRIMFIELD     |  -72.188455 |  42.116543 |   3706 | MA    |
     CHESTER       |  -72.988761 |  42.279421 |   1688 | MA    |
     CHESTERFIELD  |  -72.833309 |   42.38167 |    177 | MA    |
     CHICOPEE      |  -72.607962 |  42.162046 |  23396 | MA    |
     CUSHMAN       |   -72.51565 |  42.377017 |  36963 | MA    |
     CHICOPEE      |  -72.576142 |  42.176443 |  31495 | MA    |
     CUMMINGTON    |  -72.905767 |  42.435296 |   1484 | MA    |
    ...

As can be seen, Quasar provides the raw MongoDB query language (MQL) equivalent as
a convenience for you.  This is displayed but is not how Quasar actually executes
your query.  Quasar talks directly to the MongoDB API rather than the console.  It
is possible to copy and paste the generated MQL into a MongoDB shell.

To see data from the state of Washington, modify the query:

<pre class="code-snippet">
SELECT * FROM zips WHERE state='WA'
</pre>

output:

    Mongo
    db.zips.aggregate(
      [{ "$match": { "state": "WA" } }, { "$out": "tmp.gen_0" }],
      { "allowDiskUse": true });
    db.tmp.gen_0.find();


    Query time: 0.0s
     city           | loc[0]       | loc[1]     | pop    | state |
    ----------------|--------------|------------|--------|-------|
     AUBURN         |  -122.206741 |   47.30503 |  38163 | WA    |
     BELLEVUE       |  -122.166288 |  47.614961 |  14297 | WA    |
     BELLEVUE       |  -122.155179 |  47.561425 |  26775 | WA    |
     BELLEVUE       |  -122.142572 |  47.617443 |  21887 | WA    |
     BLACK DIAMOND  |  -122.005265 |  47.311372 |   1817 | WA    |
     BELLEVUE       |  -122.116173 |  47.611468 |  24046 | WA    |
     BOTHELL        |    -122.2159 |  47.749692 |  32985 | WA    |
     MILL CREEK     |  -122.206981 |  47.848941 |  19247 | WA    |
     CARNATION      |  -121.911095 |  47.638007 |   2808 | WA    |
     DUVALL         |  -121.936906 |  47.724987 |   7866 | WA    |
    ...

Note:  The generated MQL can be silenced by setting the debug level to 0 by
using the following command.  The rest of the tutorial will not include
generated MQL in output sections.

<pre class="code-snippet">
set debug = 0
</pre>

As would be expected from SQL, the desired field names (column names on relational databases)
can be specified to limit the results:

<pre class="code-snippet">
SELECT city, pop FROM zips WHERE state='WA'
</pre>

output:

    Query time: 0.0s
     city           | pop    |
    ----------------|--------|
     AUBURN         |  38163 |
     BELLEVUE       |  14297 |
     BELLEVUE       |  26775 |
     BELLEVUE       |  21887 |
     BLACK DIAMOND  |   1817 |
     BELLEVUE       |  24046 |
     BOTHELL        |  32985 |
     MILL CREEK     |  19247 |
     CARNATION      |   2808 |
     DUVALL         |   7866 |
    ...


If you need to reference anything in a different part of the query you can
use aliases, like this:

<pre class="code-snippet">
SELECT citydata.city, citydata.pop \
FROM zips AS citydata WHERE state='WA'
</pre>


## String and Math Operations

The `||` operator can be used to concatenate both strings and arrays. In this query,
the city and state name are concatenated so that they appear in one column:

<pre class="code-snippet">
SELECT city || ', ' || state, pop FROM zips
</pre>

output:

    Query time: 0.6s
     pop    | 0                 |
    --------|-------------------|
      15338 | AGAWAM, MA        |
       4546 | BARRE, MA         |
       1240 | BLANDFORD, MA     |
       3706 | BRIMFIELD, MA     |
       1688 | CHESTER, MA       |
        177 | CHESTERFIELD, MA  |
      23396 | CHICOPEE, MA      |
      36963 | CUSHMAN, MA       |
      31495 | CHICOPEE, MA      |
       1484 | CUMMINGTON, MA    |
    ...


You can have math operations as part of your selection as well. For example, you
can modify the above query so that the population number represents the number
of thousands of people.

<pre class="code-snippet">
SELECT city || ', ' || state, pop / 1000 FROM zips
</pre>

output:

    Query time: 0.6s
     0                 | 1       |
    -------------------|---------|
     AGAWAM, MA        |  15.338 |
     BARRE, MA         |   4.546 |
     BLANDFORD, MA     |    1.24 |
     BRIMFIELD, MA     |   3.706 |
     CHESTER, MA       |   1.688 |
     CHESTERFIELD, MA  |   0.177 |
     CHICOPEE, MA      |  23.396 |
     CUSHMAN, MA       |  36.963 |
     CHICOPEE, MA      |  31.495 |
     CUMMINGTON, MA    |   1.484 |
    ...


Use the COUNT operator to count the number of rows. For example, this query
counts the number of distinct states (51, which is the number of U.S. states
plus the District of Columbia).

<pre class="code-snippet">
SELECT COUNT(*) FROM (SELECT DISTINCT t.state FROM zips AS t) AS s
</pre>

output:

    Query time: 0.0s
     0   |
    -----|
      51 |


## Grouping Data

Use the SUM operator to add up data. For example, this query returns the total 
population, summing up the population of each city.

<pre class="code-snippet">
SELECT SUM(pop) FROM zips
</pre>

output:

     0          |
    ------------|
      248408400 |



Use the GROUP BY operator to group results. For example, this query returns
a table of the total population of each state.

<pre class="code-snippet">
SELECT SUM(pop), state FROM zips GROUP BY state
</pre>

output:

    Query time: 0.0s
     0         | state |
    -----------|-------|
       4866692 | WA    |
       1108229 | HI    |
      29754890 | CA    |
       2842321 | OR    |
       1515069 | NM    |
       1722850 | UT    |
       3145585 | OK    |
       4217595 | LA    |
       1578139 | NE    |
      16984601 | TX    |
    ...


## String Matching

For the rest of the tutorial, we will use the `commits` (or `slamengine_commits`) collection
that was imported earlier.

#### LIKE

Use the [LIKE](http://www.w3schools.com/sql/sql_like.asp) 
operator to match strings using patterns. Use the percentage sign (`%`)
to indicate a "wildcard", which means any text. Try the following query, which will
return any commit message that starts with the text "Merge". 

<pre class="code-snippet">
SELECT commit.message FROM commits WHERE commit.message LIKE 'Merge%'
</pre>

output:

    Query time: 0.0s
     message                                                                         |
    ---------------------------------------------------------------------------------|
     Merge remote-tracking branch 'upstream/master' into ready/445                   |
     Merge remote-tracking branch 'upstream/master' into ready/445                   |
     Merge remote-tracking branch 'upstream/master' into ready/407-parallel-flatten  |
     Merge remote-tracking branch 'upstream/master' into ready/565                   |
     Merge remote-tracking branch 'upstream/master' into ready/537                   |


The percentage sign can be used in other positions in the string. For example, 
try this query, which returns any message that contains the text "branch" followed
by the text "ready":

<pre class="code-snippet">
SELECT commit.message FROM commits \
WHERE commit.message LIKE '%branch%ready%'
</pre>

output:

    Query time: 0.0s
     message                                                                         |
    ---------------------------------------------------------------------------------|
     Merge remote-tracking branch 'upstream/master' into ready/445                   |
     Merge remote-tracking branch 'upstream/master' into ready/445                   |
     Merge remote-tracking branch 'upstream/master' into ready/407-parallel-flatten  |
     Merge remote-tracking branch 'upstream/master' into ready/565                   |
     Merge remote-tracking branch 'upstream/master' into ready/537                   |


#### Regular expressions

[Regular expressions](https://en.wikipedia.org/wiki/Regular_expression) allow you to do 
very sophisticated pattern matching. Use the tilde (`~`) character to indicate that the
literal is a regular expression. For example, try this query, which
returns any commit message that starts with the word Kill.

<pre class="code-snippet">
SELECT commit.message FROM commits \
WHERE commit.message ~ '^Kill'
</pre>

output:

    Query time: 0.0s
     message                               |
    ---------------------------------------|
     Kill ~200 lines of unnecessary code.  |


## Date and Time Data

Queries can be created that make use of date and time data.  In the following queries
you will also note that the word `date` is in quotations, as in `"date"`.  This is
because this particular dataset uses the `date` keyword that is normally reserved for SQL.

Try this following query, which returns all of the dates that are later than January
17, 2015.

<pre class="code-snippet">
SELECT commit.committer."date" FROM commits \
WHERE commit.committer."date" > DATE '2015-01-17'
</pre>

output:

    Query time: 0.0s
     date                  |
    -----------------------|
      2015-01-28T04:57:24Z |
      2015-01-28T16:27:52Z |
      2015-01-28T16:18:53Z |
      2015-01-29T00:23:14Z |
      2015-01-28T04:16:18Z |
      2015-01-28T03:42:38Z |
      2015-01-29T15:52:37Z |
      2015-01-26T23:55:52Z |
      2015-01-27T23:10:43Z |
      2015-01-29T00:05:07Z |
    ...


To add a time, making it a full timestamp, try this query which also lists the
results in descending chronological order:

<pre class="code-snippet">
SELECT commit.committer."date" FROM commits \
WHERE commit.committer."date" > TIMESTAMP '2015-01-17T08:00:00Z' \
ORDER BY commit.committer."date" DESC
</pre>

output:

    Query time: 0.0s
     date                  |
    -----------------------|
      2015-01-29T15:52:37Z |
      2015-01-29T00:23:14Z |
      2015-01-29T00:05:07Z |
      2015-01-28T16:27:52Z |
      2015-01-28T16:20:27Z |
      2015-01-28T16:18:53Z |
      2015-01-28T04:57:24Z |
      2015-01-28T04:16:18Z |
      2015-01-28T03:42:38Z |
      2015-01-27T23:38:13Z |
    ...



Now, try something more complex, such as counting the number of commits for each 
day of the week by using DATE_PART and the argument `'dow'`, which stands for 
"day of week".

<pre class="code-snippet">
SELECT DATE_PART('dow', commit.committer."date") AS day, \
COUNT(*) AS count FROM commits \
GROUP BY DATE_PART('dow', commit.committer."date")
</pre>

output:

    Query time: 0.0s
     day | count |
    -----|-------|
       5 |     7 |
       6 |     4 |
       2 |     2 |
       1 |     3 |
       4 |     5 |
       3 |     9 |



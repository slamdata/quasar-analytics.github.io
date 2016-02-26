---
layout: docs
title: REST API
permalink: /docs/restapi/
docs_navbar: true
---

# Quasar REST API

This section contains the reference material for the Quasar API. 

* [Executing a small query](#small-query)
* [Executing a large query](#large-query)
* [Compiling a query](#compile)
* [Retrieving data](#retrieve-data)
* [Replacing data](#replace-data)
* [Appending data](#append-data)
* [Deleting data](#delete-data)
* [Moving data](#move-data)
* [Retrieving a mount](#retrieve-mount)
* [Deleting a mount](#delete-mount)
* [Changing the port](#change-port)
* [Setting the port to the default](#default-port)

<a id="small-query"></a>
## Executing a Small Query

Executes a SQL<sup>2</sup> query where the results and computation are expected to be relatively small.
Pagination and some filtering are supported.

### URL

    /query/fs/{path}

where `{path}` is an optional path to the data. If included, then all paths used in the
query are relative to the `{path}` parameter, unless they begin with a `/`.

### Method

`GET` 

### Query parameters

| Parameter | Description | Required | Default | 
| --------- | ----------- | -------- | ------ | 
| q | The SQL query | Required |  |
| offset | The starting index of the results to return | Optional | 0 |
| limit | The number of results to return | Optional | All results | 
| var | Specifies variables in the query. See Note below.| Optional | None | 

**Note:** The `var` parameter takes the format:

    var.{name}={value}

where `{name}` is the name of the variable and `{value}` is the value of the variable.
For example, the query might contain the variable `cutoff`:

    SELECT * WHERE pop < :cutoff

Then the `cutoff` variable is assigned a value in the parameter `var.cutoff-1000`.

Failure to specify valid values for all variables used inside a query will result in an error. 
These values use the same syntax as the query itself; notably, strings should be surrounded by single quotes. Some acceptable values are `123`, `'CO'`, and `DATE '2015-07-06'`.

### Headers

| Header | Description | Required | Default |
| ------ | ----------- | -------- | ------- |
| Accept | Specifies the format of the response body. | Optional | `application/ldjson;mode=precise` |
| Accept-Encoding | Use the value `gzip` to compress the output. | Optional | No compression |

The following values are supported for the `Accept` header:

| Value | Description | 
| ----- | ----------- | 
| None | "Human-Readable" results, one result per line. Note: not parseable as a single JSON object. |
| application/json | Nicely formatted JSON array |
| application/ldjson;mode=precise | One result per line |
| text/csv | Comma-separated results. See Note below. |

**Note:** The formatting of CSV output can be controlled with an extended media type with parameters
for `columnDelimeter`, `quoteChar` and `escapeChar`. For example:

    Accept: text/csv; columnDelimiter="|"&rowDelimiter=";"&quoteChar="'"&escapeChar="\".

### Example 

The following example returns data for the query:

    SELECT * from "/sample/data/SampleJSON" WHERE state='WA'

**Note**: The URL must be encoded: spaces as %20 and the quotes as %22, etc. The URL below does not show this.

#### Request

    GET http://localhost:20223/query/fs?q=SELECT * from "/sample/data/SampleJSON" WHERE state='WA'

    Headers:
      Accept: application/json

#### Response

    [
      {
        "city": "ALGONA",
        "state": "WA",
        "pop": 22846,
        "loc": [
          -122.270057,
          47.316339
        ]
      },
      {
        "city": "AUBURN",
        "state": "WA",
        "pop": 22846,
        "loc": [
          -122.206741,
          47.30503
        ]
      },
      ...
    ]

<a id="large-query"></a>
## Executing a Large Query

Executes a SQL<sup>2</sup> query where the results or computation are expected to be relatively large. 
The results are stored in an output path that is specified in the `Destination` header.
Pagination and some filtering are supported.

### URL

    /query/fs/{path}

 where `{path}` is an optional path to the data. If included, then all paths used in the
 query and the output path are relative to the `{path}` parameter, unless they begin with a `/`.

### Method

`POST` 

### Query parameters

| Parameter | Description | Required | Default | Method |
| --------- | ----------- | -------- | ------ | ------ |
| offset | The starting index of the results to return | 0 | Optional | GET |
| limit | The number of results to return | All results | GET |
| var | Specifies variables in the query. See Note below.| Optional | None | GET and POST |

**Note:** The `var` parameter takes the format:

    var.{name}={value}

where `{name}` is the name of the variable and `{value}` is the value of the variable.
For example, the query might contain the variable `cutoff`:

    SELECT * WHERE pop < :cutoff

Then the `cutoff` variable is assigned a value in the parameter `var.cutoff=1000`.

Failure to specify valid values for all variables used inside a query will result in an error. 
These values use the same syntax as the query itself; notably, strings should be surrounded by 
single quotes. Some acceptable values are `123`, `'CO'`, and `DATE '2015-07-06'`.

### POST body

The POST body contains the query.

### Headers

| Header | Description | Required | 
| ------ | ----------- | -------- | 
| Destination | The URL of the output path, where the results of the query will become available if this API successfully completes. | Required | 


### Response

The following response elements are returned in JSON format:

| Element | Description | Notes | 
| ------- | ----------- | -------- | 
| out | Path to the query results | Element returned if request is successful |
| error | Error text | Element is returned if request is not successful |
| phases | An array containing a sequence of objects containing the result from each phase of the query compilation process | See note below |

**Note:** Phase objects have three possible forms. All phase objects have a "name" element with the phase
name.

A phase may contain a "tree" element with "type", "label" and optional "children" elements, such as:


    {
      ...,
      "phases": [
        ...,
        {
          "name": "Logical Plan",
          "tree": {
            "type": "LogicalPlan/Let",
            "label": "'tmp0",
            "children": [
              {
                "type": "LogicalPlan/Read",
                "label": "./zips"
              },
              ...
            ]
          }
        },
        ...
      ]
    }


Or a phase may contain a "detail" element with some kind of text, such as:

    {
      ...,
      "phases": [
        ...,
        {
          "name": "Mongo",
          "detail": "db.zips.aggregate([\n  { \"$sort\" : { \"pop\" : 1}}\n])\n"
        }
      ]
    }

If an error occurs, then the phase contains an "error" element with the error message. 
Typically the  error phase is the last phase in the array. For example:


    {
      ...,
      "phases": [
        ...,
        {
          "name": "Physical Plan",
          "error": "Cannot compile ..."
        }
      ]
    }

**Note:** The error is also included at the top level of the response, as described in the
elements table.

### Example 

The following example returns data for the query:

    SELECT * from "/sample/data/SampleJSON" WHERE state='WA'

It puts the result in a new file called `sampleResults` in the path `/sample/data/`.

#### Request

    POST http://localhost:20223/query/fs

    POST body:
      SELECT * from "/sample/data/SampleJSON" WHERE state='WA'

    Headers:
      Destination: /sample/data/sampleResults
      Accept: application/json

#### Response

    {
      "out": "/sample/data/sampleResults",
      "phases": [
        {
          "name": "SQL AST",
          "tree": {
            "type": "AST/Select",
            "label": null,
            "children": [
              {
                "type": "AST/Proj",
                "label": null,
                "children": [
                  {
                    "type": "AST/Splice",
                    "label": null
                  }
                ]
              },
              ...
            ]
          }
        },
        ...
      ]
    }

<a id="compile"></a>
## Compiling a Query

Compiles, but does not execute a SQL<sup>2</sup> query.

### URL

    /compile/fs/{path}

 where `{path}` is an optional path to the data. If included, then all paths used in the
 query are relative to the `{path}` parameter, unless they begin with a `/`.

 The GET method has the SQL<sup>2</sup> query as a query parameter and the POST method
 has the SQL<sup>2</sup> query in the POST body.

### Method

`GET` or `POST`

### Query parameters

| Parameter | Description | Required | Default | Method |
| --------- | ----------- | -------- | ------ | ------ |
| q | The SQL query | Required | | GET only |
| var | Specifies variables in the query. See Note below.| Optional | None | GET and POST |

**Note:** The `var` parameter takes the format:

    var.{name}={value}

where `{name}` is the name of the variable and `{value}` is the value of the variable.
For example, the query might contain the variable `cutoff`:

    SELECT * WHERE pop < :cutoff

Then the `cutoff` variable is assigned a value in the parameter `var.cutoff=1000`.

Failure to specify valid values for all variables used inside a query will result in an error. 
These values use the same syntax as the query itself; notably, strings should be surrounded by single quotes. Some acceptable values are `123`, `'CO'`, and `DATE '2015-07-06'`.

### POST body

For the POST request, use the SQL query as the POST body.

### Response

If the query compiles successfully, then the query plan is returned. If an error occurs, then JSON
with an "error" element with message is returned, such as:

    {
      "error": "operator ';' expected; ErrorToken(unclosed string literal)"
    }

### Example 

The following example returns the plan for the query:

    SELECT * from "/sample/data/SampleJSON" WHERE state='WA'

Note that you may need to encode the spaces as %20 and the quotes as %22.

#### Request

    GET http://localhost:20223/compile/fs?q=SELECT * from "/sample/data/SampleJSON" WHERE state='WA'

#### Response

    Mongo
    db.getCollection("SampleJSON\.json").aggregate(
      [{ "$match": { "state": "WA" } }, { "$out": "tmp.gen_0" }],
      { "allowDiskUse": true });
    db.tmp.gen_0.find();


<a id="retrieve-data"></a>
## Retrieving Data

Retrieves data from the specified path. Pagination is supported.

### URL

    /data/fs/{path}

 where `{path}` is a path to the data to retreive. 

### Method

`GET` 

### Headers

| Header | Description | Required | Default |
| ------ | ----------- | -------- | ------- |
| Accept | Specifies the format of the response body. | Optional | `application/ldjson;mode=precise` |
| Accept-Encoding | Use the value `gzip` to compress the output. | Optional | No compression |

The following values are supported for the `Accept` header:

| Value | Description | 
| ----- | ----------- | 
| None | "Human-Readable" results, one result per line. Note: not parseable as a single JSON object. |
| application/json | Nicely formatted JSON array |
| application/ldjson;mode=precise | [Precise JSON]{#precise-json}, one result per line |
| text/csv | Comma-separated results. See Note below. |

### Example 

The following example returns data at the path `/sample/data/SampleJSON`. Data
for the 10th and 11th items are returned.

#### Request

    GET http://localhost:20223/data/fs/sample/data/SampleJSON?offset=10&limit=2

    Headers:
      Accept: application/json

#### Response

    [
      {
        "city": "WESTOVER AFB",
        "state": "MA",
        "pop": 1764,
        "loc": [
          -72.558657,
          42.196672
        ]
      },
      {
        "city": "CUMMINGTON",
        "state": "MA",
        "pop": 1484,
        "loc": [
          -72.905767,
          42.435296
        ]
      }
    ]

Note that if you remove the `Accept` header, then you will receive Precise JSON, which is
the default format. The response would then look like this:

    { "city": "WESTOVER AFB", "state": "MA", "pop": 1764, "loc": [ -72.558657, 42.196672 ] }
    { "city": "CUMMINGTON", "state": "MA", "pop": 1484, "loc": [ -72.905767, 42.435296 ] }


<a id="replace-data"></a>
## Replacing Data

Replaces data from the specified path. 

Data is placed in the PUT body in the format of one JSON object per line. If successful, it 
replaces the existing data with the new data. If unsuccessful, it returns an error and the 
existing data is unchanged.

**Note:** An error will be returned if the path is a path to a view rather than a file.

### URL

    /data/fs/{path}

 where `{path}` is a path to the data to replace. 

### Method

`PUT` 

### Headers

| Header | Description | 
| ------ | ----------- | 
| Content-Type | Specifies the format of the PUT body. Set to `application/ldjson;mode=precise` |

### PUT body

The data to replace, one JSON object per line.

### Example 

The following example replaces the data at the path `/sample/data/SampleJSON` with two 
items.

#### Request

    PUT http://localhost:20223/data/fs/sample/data/SampleJSON

    Headers:
      Content-Type: application/ldjson;mode=precise

#### Response

Status code 200 if successful. No response body.

If unsuccessful, then JSON is returned with two elements: "error", which contains a short description
of the error, and "detail", which contains more detailed information. For example:

    {
      "error": "some uploaded value(s) could not be processed",
      "details": [
        {
          "detail": "JSON contains invalid suffix content: ,\r; value: Str(parse error: { \"city\": \"NEVERLAND\", \"state\": \"ZZ\", \"pop\": 2354, \"loc\": [ -73.658, 41.443 ] },\r)"
        }
      ]
    }

<a id="append-data"></a>
## Appending Data

Appends data at the specified path. 

Data is placed in the POST body in the format of one JSON object per line. If successful, it 
appends the existing data with the new data. If unsuccessful, it returns an error and the 
existing data is unchanged.

**Note:** An error will be returned if the path is a path to a view rather than a file.

### URL

    /data/fs/{path}

 where `{path}` is a path to the data to be appended. 

### Method

`POST` 

### Headers

| Header | Description | 
| ------ | ----------- | 
| Content-Type | Specifies the format of the PUT body. Set to `application/ldjson;mode=precise` |


### Example 

The following example appends one item to the data at the path 
`/sample/data/SampleJSON`.

#### Request

    POST http://localhost:20223/data/fs/sample/data/SampleJSON

    Headers:
      Content-Type: application/ldjson;mode=precise

#### Response

Status code 200 if successful. No response body.

If unsuccessful, then JSON is returned with two elements: "error", which contains a short description
of the error, and "detail", which contains more detailed information. For example:

    {
      "error": "some uploaded value(s) could not be processed",
      "details": [
        {
          "detail": "JSON contains invalid suffix content: ,; value: Str(parse error: { \"city\": \"UTOPIA\", \"state\": \"ZZ\", \"pop\": 2354, \"loc\": [ -75.757, 40.941 ] },)"
        }
      ]
    }

 <a id="delete-data"></a>
## Deleting Data

Removes all data at the specified path. 

**Note:** An error will be returned if the path is a path to a view rather than a file. Views
may be added or deleted using the `/mount` API requests.

**Note:** Single files are deleted atomically, meaning that the equivalent MongoDB collection is removed,
rather than a collection's documents being removed individually until the collection is empty. 

### URL

    /data/fs/{path}

 where `{path}` is a path to the data to be deleted. 

### Method

`DELETE` 


### Example 

The following example deletes all data at the path `/sample/data/SampleJSON`.

#### Request

    DELETE http://localhost:20223/data/fs/sample/data/SampleJSON

#### Response

Status code 200 if successful. No response body.

If unsuccessful, then JSON is returned with two elements: "error", which contains a short description
of the error, and optionally "detail", which contains more detailed information. For example:

    {
      "error": "./BadPath: doesn't exist"
    }

<a id="move-data"></a>
## Moving Data

Moves data from one path to another. The origin path is specified in the URL and the 
desitnation path is specified in the `Destination` header. Single files are moved atomically.

**Note:** An error will be returned if either the origin or destination path is a 
path to a view rather than a file. Views may be moved using the `/mount` API requests.

**Note:** Single files are moved atomically, meaning that the equivalent MongoDB collection is moved,
rather than a collection's documents being moved individually. 

### URL

    /data/fs/{path}

 where `{path}` is a path to the data to be moved. 

### Method

`MOVE` 

### Headers

| Header | Description | 
| ------ | ----------- | 
| Destination| Path to the new location of the data |

### Example 

The following example moves all data at the path `/sample/data/SampleJSON`
to `/sample/data/SampleJSON2`.

#### Request

    MOVE http://localhost:20223/data/fs/sample/data/SampleJSON

    Headers:
      Destination: /sample/data/SampleJSON2

#### Response

Status code 200 if successful. No response body.


<a id="retrieve-mount"></a>
## Retrieving a Mount

Retrieves the configuration for the mount point at the specified path.


### URL

    /mount/fs/{path}/

 where `{path}` is a path for the mount to retrieve. 

 **Note:** Be sure to end with a slash.

### Method

`GET` 

### Example 

The following example returns mount at the path `/quasar1/`. 

#### Request

    GET http://localhost:20223/mount/fs/quasar1/

#### Response

    {
      "mongodb":
      {
        "connectionUri":"mongodb://exampleaccount:examplepass@ds031253.mongolab.com:31253/quasarone"
      }
    }

<a id="delete-mount"></a>
## Deleting a Mount

Deletes the MongoDB mount point at the specified path.

If there is no mount at the specified path, the request succeeds, but with no response.


### URL

    /mount/fs/{path}/

 where `{path}` is a path for the mount to delete. 

 **Note:** Be sure to end with a slash.

### Method

`DELETE` 

### Response

Returns the text "`deleted {path}`", where `{path}` is the path to the deleted mount.

### Example 

The following example deletes mount at the path `/quasar1/`. 

#### Request

    DELETE http://localhost:20223/mount/fs/quasar1/

#### Response

    deleted /quasar1/

<a id="change-port"></a>
## Changing the Port

Shuts down the running instance and restarts the server on the specified port.

The port is specified in the PUT body.


### URL

    /server/port

### Method

`PUT` 

### Response

Returns the text "`changed port to {port-number}`", where `{port-number}` is the new port number.

### Example 

The following example changes the port number from 20223 to 20224.

#### Request

    PUT http://localhost:20223/server/port

    PUT body:
      20224

#### Response

changed port to 20224

<a id="default-port"></a>
## Setting the Port to the Default Value

Shuts down the running instance and restarts the server on the default port, which is 20223.

### URL

    /server/port

### Method

`DELETE` 

### Response

None

### Example 

The following example sets the port number from 20224 back to the default.

#### Request

    DELETE http://localhost:20224/server/port



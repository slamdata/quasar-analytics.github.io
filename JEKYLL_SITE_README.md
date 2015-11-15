##QUASAR Jekyll Website Documentation


###How to update the documentation:

####Add a new documentation page

Add a markdown file to the `_docs` folder with a Front Matter that looks as follow:
```
---
layout: docs
docs_navbar: true
title: Installation
permalink: /docs/installation/

---

```

Please make sure to update the title and the permalink accordingly. Please make sure the permalink has the form `/docs/{name-of-the-doc-section-without-space}`

Then update `_data/docs.yml ` with `title` set to `{name-of-the-doc-section-without-space}`

After that the sidebar will be updated automaticaly. 

####Code syntax highlighting

Just use the `pre` tag with the class `.code-snippet`. For example:

```
<pre class="code-snippet">

    items = [1, 2, 3, 4, 5]
    squared = []
    for i in items:
        squared.append(i**2)
          
</pre>
```


####Sentsitive Data Alert

Just use a `div` with the class atribute set to `alert alert-warning`. For example

```

<div class="alert alert-warning">
 <span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Sensitive data
<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod</p>
<p>tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo</p>
</div>

```
---
title: The State of State in the Browser
date: '2015-07-12'
author: binarymax
template: article.jade
tags: [state,javascript]
---

The mechanisms for storing data in the client are inadequate and unprepared for the next generation of web applications.  A new solution for persistent state management in the client is needed that is based on well understood foundations long prevalent on the desktop and server.

---

###Background
I had the privilege of attending the yearly Edge conference in London the last weekend of June.  It was one of the best conferences I have ever attended.  The topics were well chosen and the format was geared towards discussion instead of lectures.

One of the topics I felt I had a strong stake in was Front End Data.  There was a panel discussion with audience interaction, and then breakout session for folks interested in talking more directly about the subject.  A goal of each breakout session was to have actions for the market (mostly browser vendors and spec writers), to guide future implementation.

I singled out Front End Data for this post which I will elaborate on here, since the vision for 'Front End Data' seems narrow and based on limited ambition.  Possibly due to disjointed growth coupled with shortsightedness.  We left the breakout session with no goals in mind, or even any real ideas on what we should be doing to further the technology.  I will point out examples that display this and propose a basic solution.

###What is 'Front End Data'?
This is the single most important question we need to be asking in the web development community.  Because to break from the reactionary and parasitic path of state always being kept in the DOM, the current solutions have not lived up to the task.  'Front End Data' is any state that is kept in the browser, either persistent or transient.  Browser state can be kept in a variety of either too-basic or too-specific implementations.  In fact, the entire availability of state storage in the browser is based on new custom implementations of the concept, and none of the historically valid and well suited ways that computing has taught us over the years.

Persisting state in the browser has always been ill conceived because of the false assumption that the server will eventually be there to keep our data.  What happens when your data becomes huge and your browser application platform becomes more than a toy?

##Software and State
Software is a tool for the manipulation of state.  State being memory or data, and manipulation being a transformation from one form to another.

Some examples of transitions are state being captured through an interface, stored on a disk or in memory, or visually displayed through a GUI.  State can come from a server or other external environment (such as sensors), or be fabricated entirely from procedural code.  The software is the glue that takes the state through these many paths.  Software without state is like pipes without water.

In the context of a web page or web app, software has grown not in a traditional sense but rather as a side effect of a content delivery platform (the WWW).  Javascript was created for the most basic of tasks for interacting with the DOM.  The mindset of how to keep browser state has not kept up with the pace of web application development, which is now a mature field and has brilliant minds and innovations pushing it forward.

###What is missing?
Imagine, for a moment, you are about to write some software.  You want to keep data for your software, and you want that data to live on for a while, since that is the purpose of the software.  You don't want to rely on a 3rd party to keep it for you (like a server or peer), and you want it to be reasonably fast.  These are not outrageous demands.  Perhaps the data is private and you don't want to trust it to 3rd parties, or perhaps it is too large for a transfer over a network in a reasonable time.

You are now only given three options to store your persistent state: (1) A limited size place for data that was originally meant for state communication over a network (a cookie), (2) a basic synchronous key value store without any obvious way to organize hierarchy or relationships (localStorage), or (3) IndexedDB/WebSQL.

What is IndexedDB?
>a database of records holding simple values and hierarchical objects. Each record consists of a key and some value. Moreover, the database maintains indexes over records it stores. An application developer directly uses an API to locate records either by their key or by using an index. A query language can be layered on this API. An indexed database can be implemented using a persistent B-tree data structure. [1]

What is WebSQL?
>an API for storing data in databases that can be queried using a variant of SQL.

...with the caveat

>"Beware. This specification is no longer in active maintenance and the Web Applications Working Group does not intend to maintain it further."

Writing any meaningful state software that is not predicated on the above 3 options is not tenable.  Also, while it is not obvious up front, for the options above the transmission of data is all-or-nothing.  Meaning that to write any state, you must give the entirety of the state over to the system in the form of a value or record.  The transaction operation may be asynchronous once the API has the data, but you still need to give it the whole thing all at once.

Why does that matter?  Because for anyone who wants to write software that processes state efficiently, we don't have the equivalent of stdin/stdout or stream in a browser state context.  This is a bigger deal than it sounds, because while basic uses for state are mostly covered, anything sufficiently complex is unaddressed.  It is also worth noting that none of the above make any guarantees that the state will persist indefinitely until a decision is made by the user to explicitly delete it.

As a good example I will single out Lucene, because I have a professional stake in making sure people can find things easily [2].  There is a great post by the folks at Parse.ly on how Lucene works [3], and there is a good section on how state is covered.  The most important points being:

>We store all the document values in a simple format on-disk. Basically, in flat files.

>...

>when you read a 100-megabyte file twice, once after the other, the second access will be quicker, because the file blocks come directly from the page cache in memory and do not have to be read from the hard disk again.

It is not possible to port Lucene in a way that works well in a browser context.  I challenge anyone to port Lucene or to write any other reasonably complicated data storage and query device beyond the available KVM/NoSQL with an optional B-Tree index.

###File API
So what about File API?!  I purposefully left off File API above, because while it currently is on track to support reading of files, the File *Writer* API specification is dead[4].  Chrome supports a version that is being used for chrome apps[5], but wider support is not going to happen without a specification.  Additionally, File API is a difficult sell, because Web Apps should be conceptually removed from the file system that is in direct control of the user.  Many mobile devices do not implement the concept of a traditional file system, and web app state should be kept as a construct of the isolated browser sandbox.  Having the user shuffle around files for your web application is an insurmountable barrier.

Let's ask some more important questions, and give some answers while we're at it:

> <strong>Q: Why does the browser need to encapsulate its own file system?</strong>

> A: To maintain the same standards and ideals of historically successful application development.

> <strong>Q: Are you really going to use files as big as 100MB in a browser? </strong>

> A: yes.

> <strong>Q: What kind of applications do you think you will need to support?</strong>
 
> A: Any that are currently made untenable by the existing browser storage options.

###Enter WebAssembly
Not having a well designed layer for state persistence negates all the benefits of having a mature software stack.

WebAssembly is just around the corner.  The answer that vendors have agreed upon to run mature software in a browser, with support for a variety of languages beyond Javascript. 

We need a sane way to keep application state for WebAssembly applications.

###Security
Having any sort of proposal on file storage and interaction with users would be a waste if there were no security considerations involved.  We need to address some basic expectations on security and keep an open conversation going with any implications that will arise.

The good news is that all of these questions are already addressed in other specifications for both web and desktop.  We can borrow from experience and good existing practices to have a workable solution, when creating a specification.

Standards such as CORS and built in protocols and restrictions around MIME types should be used.

Considerations:
> <strong>Q: Who should be able to access the data for an application?  This includes users and other local web applications.</strong>

> In the context of the application, the data can be abstracted from the user any way the application deems appropriate.  Using a hostname restricted approach and CORS should dictate how other local web applications can access the data.

> Local non-web applications separate from the browser, should be able to access the data while in the filesystem, constrained by userspace permissions.

> <strong>Q: Who can transfer data between the browser and the local filesystem, for example by 'save-as' functionality?</strong>

> An authorised device user, and only an authorised device user, should be able to transfer data from the browser to the local filesystem.  Browsers should rely on MIME-types to trigger appropriate applications for any 'open with' operations.

> <strong>Q: How to trust the data generated in the browser?</strong>

> Entire fields have been created in the search for trust between data and machine.  The browser should use existing trust mechanisms that would normally be associated with data coming from a server for a specific domain.

> <strong>Q: How to limit the amount of data one application is able to create?</strong>

> User experience research should be driving the answer to this question, but in other contexts, the consensus is allowing for a small initial 'default' amount without permission from the user.  Allowing the application to exceed that amount should be requested from the user where appropriate.

###Proposal

To avoid the sin of complaining without presenting any solution, I propose a new API named "Application State" or AppState for short.

AppState is a sandboxed file space in the persistent filesystem allocated exclusively by the browser.  It has a global object exposed to the scripting layer that allows interaction with the sandboxed files (or 'blobs').


####Structure
Each application has access context identified by domain.

The structure of the AppState for an application is a hierarchy of nodes, where each node has a key, an optional blob, and zero or more child nodes.  Nodes can be easily accessed by concatenating one or more keys, separated by the delimiter '/'.  Glob syntax[6] can be used to return zero or more nodes.

If you think this almost looks like a file system you are right.  The difference being that each node (perhaps analogous to a folder) can also have a blob.  This simplifies things by not needing different concepts for a folder or file.

####Storage
For each node an optional blob of arbitrary length can be allocated and resized.  A blob is an ArrayBuffer object[6].  The difference being that the ArrayBuffer is always persisted to disk.  Writing to the node's blob via a TypedArray is guaranteed to be persisted.

To keep with existing conventions, when new to a browser, the application will only have permission to keep a small size of AppState.  When AppState is first accessed, if the size exceeds this small default, the application must prompt with the amount of storage being requested.  If an application exhausts its allowed storage amount, it must request more.  An initial default of 50MB is proposed.

To make use of the benefits and abstractions provided by the OS kernel and userspace, the browser will keep the AppState blobs in a location of its choice on the device's file system (to which the browser already has access).

Arranging and naming individual blobs in the file system, and keeping a map or index of the nodes to their blobs, must be maintained by the browser.

Importantly, the browser must not alter the blobs themselves in any way.  For example: compressing, splitting, or concatenating node blobs by the browser in the filesystem must not be allowed.

####Access
There must exist the ability for synchronous reading and writing of the ArrayBuffer object through a TypedArray, and asynchronous access via a new abstraction.

###Example API
This section contains a proposed API for illustration purposes only.  It is minimal and does not cover many details and edge cases that need to be worked out.  Hopefully, at the very least, it begins a discussion for future possibilities.

The API below covers the ApplicationState, Node, Blob, and TypedStream objects.

####Node

#####Properties: 

All properties are readonly getters, and can only be altered by prototype methods.

>*<strong>key</strong> : string*

>*<strong>size</strong> : int32*

>*<strong>blob</strong> : ArrayBuffer*

>*<strong>childNodes</strong> : Array*

><strong>*path*</strong> : Returns the full path of the node in the AppState hierarchy, using the root '$' and delimiter '/' and no trailing slash.  For example: "$/path/to/node"


#####Methods:

><strong>*getNodes(string glob)*</strong> : Returns an array of nodes matching the glob syntax, searching the node and all levels of children stemming from the node.

><strong>*createNode(string key [, int32 size])*</strong> : Creates a new child node with name key and an optional blob of size bytes, and appends it to the childNodes array.

><strong>*resize(int32 size)*</strong> : if size is greater than the existing blob size, the blob is grown to the new size with 0's filling the new space.  if size is less than the existing blob size, the blob is truncated to the new size and the truncated data will be deleted.

><strong>*delete()*</strong> : Deletes the node and all of its child nodes.  This cannot be undone.

#####Blob:

A blob is a binary ArrayBuffer, but it must be kept synchronous with the persistent storage at all times by the browser.  A node of size 1 has a blob formed of one octet (8 bits).  A node of size 20 has a blob formed of 20 octets (160 bits).

#####TypedStream:

The TypedStream is based on the familiar TypedArray, that abstracts a sized interactive array over a binary blob.  Its purpose is to enable asynchronous get and set access to the blob.

Syntax

>new TypedStream(blob)

The TypedStream has the same conceptual property, method, and prototypal definitions as the Uint8ClampedArray object.

TypedStream, however, when using bracket notation for index read and write, triggers events after the get and set operations.  Subscribing to these events allow for the asynchronous stream nature of working with objects on disk.

For synchronous operation with the blob object, a classic TypedArray should be used to wrap the ArrayBuffer blob.

####ApplicationState

The ApplicationState is a property of the global object (similar to localStorage) and can be accessed as such:

>window.ApplicationState

ApplicationState does not allocate any space by default. This applies to when the application has never called the create method in the current session or any past sessions.  To check if any ApplicationState space has been allocated, check the size property.

When the application loads in the browser, if any sessions prior had allocated space, then the ApplicationState initializes with all the nodes and blobs previously created.


#####Properties

All properties are readonly getters, and can only be altered by prototype methods.

>*<strong>key</strong> : string*

>*<strong>size</strong> : int32*

>*<strong>childNodes</strong> : Array*

><strong>*path*</strong> : Always returns the string '$'*

#####Methods:
><strong>*create(int32 size)*</strong>: Creates the AppState with size of length bytes.  If the size given is greater than the default size, it may need to ask permission from the user.  If the ApplicationState has already been created and this method is called, an exception will be thrown.

><strong>*getNodes(string glob)*</strong> : Returns an array of nodes matching the glob syntax, searching all levels of children.

><strong>*resize(int32 size)*</strong> : If size is greater than the existing filespace size, the filespace is allowed to fill to the new size with node blobs.  If size is less than the sizes of existing blob size already in the filespace, an exception is thrown.

>*<strong>create(int32 size)</strong>: Creates the AppState with size of length bytes*


#####Examples
```javascript
var AppState = window.ApplicationState;

//Allocates 50MB for the entire ApplicationState.  This will not prompt the user.
if(!AppState.size) AppState.create(50000000);

//Allocates 200MB for the entire ApplicationState.  This will prompt the user.
AppState.resize(2e8);

//Create a node with no blob allocated
var node0 = AppState.createNode('node0');

//Create one hundred children of node0, each with a 20k blob
for(var i=0;i<100;i++) {
	node0.createNode('child'+i,2e4);
}

//Outputs 2000000
console.log(node0.size);

var child50 = AppState.getNode('$/node0/child50');

//Outputs 20000
console.log(child50.size);

//Resizes the child to 30k
child50.resize(30000);

//Outputs 2010000
console.log(node0.size);

//Set each bit in the binary blob of child50 to 1
var array = new Uint8ClampedArray(child50.blob);
for(i=0;i<child50.size;i++) {
	array[i] = 0xff;
}

//Deletes node0 and all its children
node0.delete();

//Outputs 200000000
console.log(AppState.size);
```

###Footnotes

And there you have it.  Simple, powerful, and a good start for web applications needing to keep data persisted in the client.  I would be more than happy to discuss further details, please feel free to contact me on twitter [@binarymax][10]


*"AppState" is not to be confused with and has no relation to the deprecated Android AppState interface, nor any other existing construct with the AppState name.*

-

###References
- [1] http://www.w3.org/TR/IndexedDB/#abstract
- [2] I'm into search technology at Wolters Kluwer.
- [3] http://blog.parsely.com/post/1691/lucene/
- [4] http://www.w3.org/TR/file-writer-api/
- [5] https://groups.google.com/a/chromium.org/forum/#!topic/chromium-apps/k39Lb1VYWEI
- [6] https://en.wikipedia.org/wiki/Glob_%28programming%29
- [7] http://www.ecma-international.org/ecma-262/6.0/#sec-arraybuffer-constructor

[10]:https://twitter.com/binarymax
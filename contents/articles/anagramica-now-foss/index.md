---
title: Anagramica is now FOSS
author: binarymax
date: '2013-08-03'
template: article.pug
tags: [FOSS,games,projects]
---

I've finally open sourced Anagramica (http://anagramica.com/) 

The code is now available under the MIT license at https://github.com/binarymax/anagramica

I'm not entirely sure why I never open sourced it in the first place.  After 25 years of coding I've only recently become active in opening my code for others to see and use.  I have a cathartic story to tell about a previous project, which I've never told anyone about, and silently open sourced this past winter.

---

#### KeepAware
One minor regret I have, is holding on to a project called KeepAware[1] when I should have just opened the darn thing and let others use it and grow it.  In the beginning of July 2011, Node.js hit v0.5.0.  A huge milestone for that release was the port for Node.js to run on Windows.  I remember seeing the post[2] on a Wednesday, and spent most of that Saturday and Sunday writing KeepAware, thinking that I would be able to sell it.

The premise was simple - KeepAware would load a Node.js project as a Windows service so it could run in the background, and not as a console application, and send all console output into the Windows Event Log.  Also, similar to nodemon, the service would restart every time a file in the project was changed, to allow seamless editing and previewing.  I thought these were great ideas, and also thought that folks who used Windows were no strangers to paying for stuff.  And, since I've never made any money from an independent project (or even tried), maybe I could finally get in on that sweet gravy train.

After the project itself was finished, I started work on an ill-conceived website to allow folks to download it under a tiered license - free for non-commerial use, $20 for a commercial license, and $Zillions for an enterprise license.  I eventually ran out of steam late that Sunday and never finished or published the site, and KeepAware grew cobwebs as a private and unused repo in github.  I wasn't even using it myself, since I had no desire to return to coding on Windows (I had switched to Linux 6 months beforehand and was not interested in turning back).

Two months after I wrote KeepAware, I saw a post that someone at Microsoft coded a way for Node.js to play nice with IIS, and that was that.  I regret not just opening it up and posting it on HN the weekend I wrote it.  I was never a fan of IIS (but really enjoyed .NET otherwise).  In arrogant retrospect I still think the approach I had was better, keeping it as a separate service rather than piggy backing on IIS, since Node is much more than just a web app server.  Oh well.  On January 20th 2013, I silently opened up KeepAware and renamed it KeepAware-old, it is mostly useless now, but has some interesting bits in there - like automatically restarting a windows service when a file changes, and sending console output to the EventLog.  I also still have the domain keepaware.com, its always just been a 301 to binarymax.com, and maybe I will use it someday.  I still love the name.

#### Lessons Learned
So back to the original story - Anagramica has a couple hardcore fans, and it averages about 10 plays per week, mostly through those finding it organically (I don't advertise or market anything I make, other than a facebook or twitter post).  I never planned to make any money from it so I'm not sure why I kept it locked down for so long.  It may have to do with a mild case of imposter sydrome[3], as sometimes I am afraid of people in the outside world seeing my code and being critical.  So I'm trying to get over all that by coding out in the open and learning from those who do the same.  After I left Windows behind, I have been using some of the most amazing software ever written, and its free (as in beer and freedom), and even though my stuff is not nearly as amazing, I hope to give back what I can to the most revolutionary community in the world.  The world today runs on FOSS, and I am deeply grateful.

[1] https://github.com/binarymax/KeepAware-old

[2] http://blog.nodejs.org/2011/07/06/node-v0-5-0-unstable/

[3] https://en.wikipedia.org/wiki/Impostor_syndrome
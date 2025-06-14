---
type: "external"
title: "Surviving the AI Mandate | LinkedIn"
template: "external.pug"
external_url: "https://www.linkedin.com/pulse/surviving-ai-mandate-max-irwin-ll2xc/"
author: "Edit article"
description: "It happened.  The decision was made, and the directive has 
come.  You have to ship “AI” in the next quarter or two, and you have to
 do it right.  So now what?"
date: "
                      April 2, 2025
                    "
---

It happened.  The decision was made, and the directive has 
come.  You have to ship “AI” in the next quarter or two, and you have to
 do it right.  So now what?

---

Surviving the AI Mandate | LinkedIn
It happened. The decision was made, and the directive has 
come. You have to ship “AI” in the next quarter or two, and you have to
 do it right. So now what?
It happened. The decision was made, and the directive has
come. You have to ship “AI” in the next quarter or two, and you have to
do it right. So now what?
Good News! You’re not alone, and I’m here to help. This
is happening to product teams everywhere, and your predicament is no
different than theirs. I talk to lots of teams, at least 2 per week,
and every single one of them is working on an AI initiative. Also,
every single one of them is confused and struggling.
So, the question you should be asking yourself is this: “how can we not fail?”
Notice the phrasing of that question. Success is something
different. Time for the harsh truth: few teams these days are shipping
AI features that (a) are based on corporate mandates, (b) offer serious
value for customers, and (c) don’t break the bank.
You can get there, success can come! But first, you need
to not fail. So here you are, dear reader, and I’m going to show you
how.
Overview/TL;DR
You need to find a good set of data, leverage it to build a
simple and basic RAG or Agent, and spend a good amount of time on
measuring quality. Once you’ve done that and you’ve launched to
customers, you measure in the field and can iterate and succeed by
adding more complicated use cases.
What is AI anyway?
This is your first problem. You’ve seen the news. Here
you are reading a blog on the subject. So I’ll educate you in two
sentences.
- Fundamentally: AI is software that uses lots of data, to learn a repeatable task, using a metric to measure improvement.
- Practically these days:
“AI” is integrating your data with an OpenAI/Anthropic/Gemini model to
do something that would be nigh impossible if you had to code it as a
regular software feature.
Data (Step 1)
AI works well for the data it has seen. This is a truism I
have to state. There is no magic in AI. If you show a model
something, that’s how it learns. The model hasn’t seen your data when
training, so you need to show it some when prompting.
“Your data”. That’s the crux. Look at your product. Look
at what your customers are doing there, look at your arsenal of
content. This is your oil. Your gold. Your advantage. If you’ve got a
fighting chance at this thing, you need to figure what your data is and
how you can leverage it.
So first, make a catalog of your data. When you’re
building an AI feature, you’re going to have to show some examples of
this data to the model. We call this “few-shot” prompting. Chatty
McChatface hasn’t been exposed to your data before, so when you ask it
to do something, you need to seed it with context. Afterwards it will
probably do fine.
When cataloging, make a list of what the data is, what
features or fields it has, some examples of each field, and a short note
on what it’s used for. Believe it or not, this isn’t just for you to
understand the data - you’ll also use this as some of context for the AI
model!
Task (Step 2)
Choose your use case. If the mandate is for a feature that
isn’t backed by any data, go back to the stakeholders and point this
out and pick a new feature. Practical AI features these days can be
boiled down into two classes: RAG and Agents. Let’s spend a moment
defining these.
Retrieval Augmented Generation (“RAG”)
This is, simply, showing the customer a summary of data
from their query. This is where most teams start. You can’t get to
building agents if you don’t understand RAG and its concepts. Here’s a
picture of a RAG system:
Common RAG workflow
You can get a bit fancier with RAG. Maybe you have a database with some information that the customer wants to query:
Natural language database querying
The summary must be accurate, consistently formatted, and
it must cite the data sources from which it drew information. If any of
these go wrong, your customers will become frustrated and the feature
will fail. You will need to spend time on prompt engineering, and you
will need to iterate with a good set of test data, which we will cover
later in step 3 (Metrics).
I recommend starting here, and getting RAG to work, before jumping into Agents.
Agents
I define agents as software workflows using AI models at
one or more steps in the workflow. Here are some examples of agents, in
order of complexity:
A feature that accepts a customer’s natural
language query, and outputs a report with charts. This is similar to
the second RAG, with one or two additional steps.A
background process that downloads some news items every hour,
summarizes, classifies and filters them, and sends an email alert based
on a user profile. This requires several calls to AI models.An
SMS service that accepts an incoming text message from a user, and
schedules an appointment in a calendar after some back and forth. This
requires complicated tracking of the conversation integrated with a
calendar system, and solid defense against bad actors.
The ultimate “agent” is a system that takes any request and
will perform any conceivable action by going off and doing things you
would be able to do. There are attempts at this such as Anthropic’s
Computer Use, and OpenAI’s Operator. Don’t try to build something like
this. Do try to build a simple workflow that is predictable and useful for your customers.
Metric (Step 3)
Non-failure can’t come unless you know how well the feature
is working, and to do that you need to measure outcomes. One big
problem with generative AI is that, commonly, the output is a big blob
of text. Interpreting whether a blob of text is correct is cumbersome,
manual, and subjective. You will need to approach the problem
differently by measuring objectively so you can repeat and iterate
quickly to improve the feature. For instance, many AI benchmarks do
this by giving things like multiple choice tests to models and measuring
the correctness of the choices, this is a straightforward objective
measurement.
How can we objectively measure RAG or Agents? Let's start
with RAG. You must have a good understanding of which cited documents
should be included in the summary. A simple objective RAG metric is to
measure the overlap of which documents you decide to be cited against
what the LLM cites. This is a challenge, because you will need to
manually label these documents, but there is no way around this. Also,
while it's typically fine to create your own measurements when getting
started, I recommend a framework such as Ragas (https://docs.ragas.io/en/stable/) or DeepEval (https://github.com/confident-ai/deepeval). Spend the time to become familiar with one of these tools, and use them to objectively measure outcomes.
Costs (Step 4)
I always log costs for every request so that I can do
internal reporting and analysis. You should be able to identify which
users are costing you the most money, and also which are finding the
most value from the feature. Use this as a budgeting and sales tool.
None of this will work if you spend more money than you
make (unless you’ve got VC or a good R&D budget to subsidize the
costs to getting traction and becoming profitable). So you will need a
way to measure how much the system costs. If you use large
state-of-the-art models, the costs are more expensive than decent
well-established models. For example, a model that has been available
for 6 months that many are using, will often be cheaper than the latest
release that the company claims finally hit AGI and can do your taxes.
Companies such as OpenAI, Anthropic, Google, etc all offer
dashboards showing costs, but those are typically rolled up per API key
or project in place. Ideally, you need to track costs per customer and
user, which are not available in the 3rd party dashboards.
Launch and Grow (Step 5)
Like all software projects, when you have everything in
place, try the feature out with select customers. Carefully monitor
use, and quickly figure out gaps in the implementation to bolster
accuracy and utility. Done right, you should have something simple that
customers enjoy and does not break the bank. From there, you can grow
the capability and gain maturity as an AI backed business.
Try it out!
Before launching into the actual feature, maybe get your feet wet, have some fun, and learn some basics.
Recently, I ran an evening hackathon with RIT's AI Club.
Given my initial guidance, we attempted to build an agent in an hour.
We had almost 40 people, who merged 12 pull requests, with 59 commits.
At the end we had a script that takes a dataset and converts it to a SQL
table, a data dictionary, a working web app, a database module, a
couple LLM modules, two prompts, some safety checks, and a controller
that ties it all together. It wasn't ready for use, but it was a
fantastic learning experience for the group.
I’m working with Bonsai to help teams solve problems on scalable search and AI solutions. Get in touch with me (max@onemorecloud.com), and I'll help your team get started!
Resources
Ragas https://docs.ragas.io/en/stable/DeepEval https://github.com/confident-ai/deepeval
AI-Powered Search https://aipoweredsearch.com/Prompt Engineering for LLMs https://www.oreilly.com/library/view/prompt-engineering-for/9781098156145/

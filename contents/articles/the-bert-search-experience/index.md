---
source: "external"
title: "The BERT Search Experience"
template: "external.pug"
type: "blog"
external_url: "https://opensourceconnections.com/blog/2021/09/01/the-bert-search-experience/"
author: "Max Irwin"
description: "All the areas of a complete search experience that are being improved, and sometimes even replaced, by solutions using large-language models."
image: "https://opensourceconnections.com/wp-content/uploads/2021/08/g1907.png"
date: "2021-09-01T13:46:51+00:00"
---

All the areas of a complete search experience that are being improved, and sometimes even replaced, by solutions using large-language models.

---

All the areas of a complete search experience that are being improved, and sometimes even replaced, by solutions using large-language models.
Welcome back, dear reader, to the BERT search experience!  The thing on most people’s minds when they think about search using BERT is “semantic search”.  But search is more than just showing results in a list.  There’s a whole jungle out there of all the important search experience tools that make the search workflow easier.  Like spellcheck!  And highlighting!
In this series of posts we’ll talk about all the areas in search that are being improved, and sometimes even replaced, by solutions using large-language models.
The phases of a robust search experience
Let’s start with a pretty picture of search.  I’ve broken it up into three phases:  Prediction, Execution, and Communication.
Since search is a complex problem, and each step in a search workflow is an entirely separate problem space.  For each phase, we will:
Dive into specific areas of the search experience,Describe how they work when using Elasticsearch and SolrShow how new NLP technology is changing the featureGive references and materials for you to explore and learn more
The Prediction Phase
Prediction is what happens before the search is executed by the engine. This phase is all about guiding the person searching to enable exploration, reduce friction, and mitigate backtracking.  I’ve chosen three stages of the phase to illustrate how this happens in most mature search applications: Autocomplete, Spellcheck, and Query Rewriting
Autocomplete
Sometimes known as autosuggest, or query completion, this suggests completions as you type for full terms, related concepts, titles, or other items.
Traditionally, autocomplete has worked by taking what the person has already typed into the search bar, and matching it to prefixes of terms or phrases based on content in the index.  Parts of phrases can be matched effectively with a specialized search field.  By tuning how the field is constructed, and how to weight the ranking, you can get a good list of phrases that match the query text.
In Solr and Elasticsearch, this is done by enabling one or more “suggest“ components, and returning results for a tuned configuration of those components.  Suggesters work by using occurrences or co-occurrences of terms together, and finding the most appropriate suggestion based on statistics in the index and configuration of parameters.
How it’s changing: instead of matching strings, what if you could match meaning and intent?  For example, if I type ‘dehyd’ I would expect suggestions such as “dehydrated” or “dehydration”.  But I may also be interested in concepts such as “rehydration” or “hydration pack”.  In Solr or Elasticsearch, this would need to be done on a case-by-case basis, and constantly managing a large synonyms list to cover all the possibilities.  By leveraging concept embeddings from semantic similarity models and nearest-neighbor search, the solution becomes much more powerful, requiring less rules and less gardening in the long term.
If you want to learn how to implement an accurate and effective AI-driven autocomplete (and semantic search in general), I covered the steps extensively in Chapter 13 for the book AI-Powered Search (http://aipoweredsearch.com) “Semantic Search with Dense Vectors”.
Here are some examples from one of the labs in the chapter!
Suggestions for: mountain hike
mountain hiking 0.9756487607955933
mountain trail 0.8470598459243774
mountain guides 0.7870422601699829
mountain terrain 0.7799180746078491
mountain climbing 0.7756213545799255
mountain ridge 0.7680723071098328
winter hikes 0.754130899906158
Suggestions for: campfire
camp fire 0.9566243886947632
campfire impacts 0.9282976388931274
camping fuels 0.8655523061752319
camping stoves 0.8239544630050659
camp stove 0.7969684600830078
cooking fires 0.7753304839134216
campground 0.7744450569152832
fireplace 0.7649710774421692
camping area 0.759651124477386
Aside from that chapter, the entire book teaches powerful techniques such as Knowledge Graph extraction, Learning to Rank, Personalized Search, and other topics by Trey Grainger and Doug Turnbull. Pick up a MEAP copy today!
Spellcheck:
Spellcheck picks up on query terms that are spelled incorrectly, and shows you the corrected terms (or sometimes just automatically corrects them for you before searching).  Like autocomplete, spellchecking in Elasticsearch or Solr is typically done with a suggest component, to produce a Did-You-Mean style spell correction suggestion in the search interface.  This works well to a certain point, but lacks context of what the searcher may be typing.  Want to tune a suggester?  This handy tweet gives a good overview:
Spellcheck for #solr or #elasticsearch: Get lots of queries Configure a spellchecker Run spellcheck for all queries Correct results by hand Measure F1 for accuracy GoTo to improve F1 Deploy to prod as Did-You-Mean A/B test & goto You're "done"— Max Irwin (@binarymax) March 11, 2021
How it’s changing: it is slowly becoming common to leverage seq2seq (sequence-to-sequence) architectures to build a robust large-language model that will learn how to correct accurately.  An excellent example has been outlined here: https://towardsdatascience.com/creating-a-spell-checker-with-tensorflow-d35b23939f60
One challenge that has been a bottleneck with spelling correction, is tokenization and vocabularies.  With pre-trained transformer models there is a limited vocabulary (in bert-base-uncased, there are only 30,000 word pieces).  Correcting one misspelled term in a long query will likely work, but finding the nearest candidate in a spellchecker based on one or two query terms is hampered by the incorrect terms not being in vocabulary and not being contextually obvious.
Here’s a manifestation of the limited vocabulary problem. These models are tricky, and they can go wrong in strange ways.  Here’s an actual example that is reproducible in Bing.com:
Notice anything odd?
So, for short queries, a well tuned Solr or Elasticsearch suggester using the technique from the tweet above gets you pretty far.  However, we may see an improvement on short queries when tokenless transformer models improve and become mainstream:
Query rewriting:
In Solr or Elasticsearch, query rewriting is usually limited to synonyms, stopwords, and other analysis tools in the Lucene toolbox. More robust solutions are performed via active search management (manual curation of rules) with a tool like Querqy.  Allowing for a high degree of accuracy and specificity, this will work for most teams with a manageable set of information needs and modifiers.
René Kriegler, our colleague and creator of Querqy, also discussed the specifics of query relaxation (a subdomain of query rewriting) using embeddings in this excellent Haystack talk: https://haystackconf.com/2019/query-relaxation/
To bolster active search management for complex needs of the long tail, in steps large language models again, where techniques have shown significant improvement. As an example, Few-Shot Generative Conversational Query Rewriting won the short paper award at SIGIR ‘20:
…We develop two methods, based on rules and self-supervised learning, to generate weak supervision data using large amounts of ad hoc search sessions, and to fine-tune GPT-2 to rewrite conversational queries. On the TREC Conversational Assistance Track, our weakly supervised GPT-2 rewriter improves the state-of-the-art ranking accuracy by 12%,….
We’re likely to see improvement on existing query rewriting techniques in the future, that use language models tuned on large numbers of search sessions and their workflow paths.
Also bonus points if you’ve spotted this, but did you know that spellcheck and autocomplete are a form of query rewriting?  Thought I’d mention it before closing out this post, and keep on BERTing!
Join us next time
…for part 2: the Execution Phase, where we’ll dive into the impacts AI is having on retrieval, ranking, and diversity.
In the meantime, sign up for Haystack 2021, and get in touch if you’d like to work with us to help solve your challenging search problems!
(Jimi Hendrix Vectors by Vecteezy)

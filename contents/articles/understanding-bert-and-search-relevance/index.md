---
source: "external"
title: "Understanding BERT and Search Relevance"
template: "external.pug"
type: "blog"
external_url: "https://opensourceconnections.com/blog/2019/11/05/understanding-bert-and-search-relevance/"
author: "Max Irwin"
description: "This article gives an overview into the opportunities and challenges when applying advanced transformer models such as BERT to search."
image: "https://opensourceconnections.com/images/complex-664440_1280.jpg"
date: "2019-11-05T10:00:00+00:00"
---

This article gives an overview into the opportunities and challenges when applying advanced transformer models such as BERT to search.

---

Understanding BERT and Search Relevance
There is a growing topic in search these days. The hype of BERT is all around us, and while it is an amazing breakthrough in contextual representation of unstructured text, newcomers to natural language processing (NLP) are left scratching their heads wondering how and why it is changing the field. Many of the examples are tailored for tasks such as text classification, language understanding, multiple choice, and question answering. So what about just plain-old findin’ stuff? This article gives an overview into the opportunities and challenges when applying advanced transformer models such as BERT to search.
What’s BERT and why is it important?
BERT, which stands for Bidirectional Encoder Representations from Transformers is a deep learning architecture developed by Google for NLP. It is one of several approaches that leverages transformer architecture. Transformers address a gap in previous architectures such as recurrent and long short-term memory neural networks, with the key difference being the focus on maintaining attention during training using a bidirectional encoder. Plenty of articles have been written about this recently. So, I won’t dive into the details of how or why this works, but I’ve added links at the bottom for further reading if you want to learn more. The important part for the practitioner is that pre-trained models and open source libraries have been released to the public for use by anyone. You don’t need to train your own model and you can use these as they are, or for transfer learning (referred to as fine-tuning in BERT).
What happens when you use these models is what we’ll focus on here. When you, for example, pass a document’s text through a pre-trained model using a transformer network, you get back a tensor, which is comprised of a vector representation for each token. One pre-trained large uncased model for BERT uses a feature vector of 768 floating point values. 768 features for a token, yielded from such a sophisticated model, contains a highly accurate dense contextual representation of the meaning of that token that can be further used. Also importantly, if the document has 234 words in it, you’ll get a tensor with the dimension of 234×768. If your document has 172 words, your tensor is 172×768, and so on.
Traditional search in inverted indexes such as Lucene maintains zero context for each token – as all the words are all usually analyzed in isolation. Relevance engineers spend lots of time working around this problem. Without linguistic context, it is very difficult to associate any meaning to the words, and so search becomes a manually tuned matching system, with statistical tools for ranking.
How can we use BERT for search?
So what can you do with this tensor information? Well that’s the question at hand for many search engineers these days. We’ve been given this immensely powerful tool, and are trying to figure out how we can apply it to make relevance tuning easier and less prone to silly language issues we commonly face. Before you jump out of your chair shouting this is a solution looking for a problem, remember, the problem is that search in its current form has no connection to language and meaning. So we need to see how these two match up for a better future together.
The main area of exploration for search with BERT is similarity. Similarity between documents for recommendations, and similarity between queries and documents for returning and ranking search results. Why? Because search relevance can be phrased as a similarity problem. What documents are most similar to what the user is trying to convey with their query? If you can use similarity to solve this problem with highly accurate results, then you’ve got a pretty great search for your product or application.
Commonly, the approach is to use a nearest neighbor algorithm. This takes two or more vectors, and calculates the distance (or similarity) between them in an efficient manner. To use a simple example, let’s say we’ve got two people – Alice, standing 5 meters away from a water fountain, and Bob, standing 7 meters away from the water fountain. Who is standing closest to the fountain? Alice of course. Now Carrie joins the group and stands 8 meters from the fountain. So who is Carrie standing closest to? Alice or Bob? Well, that’s easy – it’s Bob. That’s similarity with a vector of one feature. We can also have a vector of two features, such as latitude and longitude coordinates, and use that calculate who is standing closest to the fountain and who are standing in groups close to each other.
When we need to do this with more features, such as 3, 10, or even 768, across thousands or millions of words and documents, things get complicated. So we turn to approximate nearest neighbor algorithms to efficiently calculate this similarity as fast as possible across all these dimensions.
And that brings us to where much of the recent practical development has been focusing on: Efforts to apply this type of nearest neighbor calculation to documents that we index in a search engine, and also the queries that people use in the search bar. Because if you can represent all your documents as rich sets of vectors that contain embedded meaning, and cross reference those with a query also represented by a rich set of vectors, you can see which documents are most similar to the query!
Making progress, with some obstacles
There’s some great stuff happening to make the above nearest neighbor tools available for use inside of search engines. Several approaches are being built to allow arbitrary vectors to be indexed inside of Lucene, and Vespa already supports indexing vectors. However, the sizes noted above are not really practical. For example, vectorizing short (three or four sentence) overview text data from 28000 movie documents balloons the representative size from 5MB to 5GB! That’s a whopping 1000x increase in size! And 28000 really isn’t very many documents.
There are investigations underway to distill these huge document tensors into a more maintainable size. Areas of research include fine-tuning by using another model on top of BERT for a smaller representation, or just trying to average some of the dimensions together. The problem with these approaches is as you shrink or compress the size, you lose more of the context that the original model provided. So careful testing for each dataset needs to be performed to ensure the accuracy stays reasonable as the representation is compressed.
This is also a very different way of doing things than most search teams are used to. Handling large models that need GPUs for effective speed, and querying across vectors instead of terms, requires a shift in technology, infrastructure, and practice. Also, debugging such a system becomes exceedingly difficult. These models are black boxes, and explainable AI is an open area of research that is out of reach for most practitioners. When you get a strange result from Lucene, you can dig down and see exactly why the result was returned. But when a document or query yields a tensor, knowing why that tensor was produced and what it means is more or less impossible.
The problem with queries
All the above is wonderful, but there’s another problem – how people search. Think yourself about how you search, when approached with a need to get information from a website or from a web search engine like Google. Do you type an elaborately crafted sentence as if you were asking another person? Of course not. You type one or two words, typically a noun phrase, for what you want to find. Don’t feel bad – everyone does this, even me! People usually don’t give enough context to search engines for most of their queries. But you can’t blame people for this problem – we’ve been doing this for years because that’s how search engines usually work.
When you perform a similarity between those short queries and lots of documents, you are faced with the same age-old information retrieval problem: ambiguity. No matter how advanced your technology is, if people don’t provide enough context to search on, your engine is going to have a difficult time returning exactly what they were thinking. You will get documents back that reflect the meaning of the terms better, but they might not be ranked the way you expect.
Tradeoffs and next steps
Search is full of trade-offs. How much time can you reasonably spend to get search right? How much money is worth improving search for 10% of your queries? Everyone has deadlines. Everyone has budgetary restrictions. Lots of smart people are working hard to make this technology cheaply available and accessible to search teams who can use it to benefit customers. Keep an eye out for more updates, as this represents the biggest shift search has seen in years, so you’re likely to see many more articles, tutorials, software, and training soon.
If you’re interested in learning about and potentially applying some of the techniques described above to empower your search team, please contact us!
Further reading
These links below provide more in depth information for the concepts explained above.
Academic papers on BERT and attention models
BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding
Attention Is All You Need
The Annotated Transformer
Articles explaining BERT in simpler overviews
BERT explained
Demystifying BERT
Understanding searches better than ever before
Libraries for using BERT and other transformers
Huggingface Transformers
Investigations of BERT’s true practicality
NLP’s Clever Hans Moment Has Arrived
Arbitrarily dense vector search
https://github.com/o19s/hangryhttps://github.com/castorini/anserini/blob/master/docs/approximate-nearestneighbor.md
https://arxiv.org/abs/1910.10208
https://github.com/jobergum/dense-vector-ranking-performance
Tensors in Vespa
Attributions
Image by Pete Linforth

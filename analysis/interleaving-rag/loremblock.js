const str=`What kinds of search results work best for an LLM?  When asking this question the first thing that jumps into most minds is that of relevance. But the answer is more complex.

When exploring the best solution to the above, comparing outcomes of retrieval engine configurations one at a time poses significant challenges. This is because A/B testing and contrasting metrics robs you of understanding true comparative preference.

Interleaving, the process of blending the query results of two or more engines into the same result set, gives us easy to obtain insights into the behavior of LLMs for knowledge summaries, and allows us to craft our results to align better with these behaviors.  This also avoids error prone independent comparisons.

Indeed, interleaving results for LLMs presents a comprehensive solution to not only tune actual relevance, but also tune perceived relevance.

The difference between actual vs perceived relevance is fascinating. The former is the empirical truth of whether or not the result contains the information necessary to satisfy the query.  Perceived relevance on the other hand, is whether or not the person looking at a search result can tell whether or not it likely contains the answer.  It's easy to understand when we're shown a picture.

Before we were all spoon fed summaries en masse at the top of our results, we actually had to look at results and make decisions with our brains.  Optimizing perceived relevance is key to making this easy for us by showing concise information about the results so we can decide what to click.

To illustrate the benefits of perceived relevance, consider an extreme example: imagine you are only presented with a list of page links as search results with no other data. Assume these are in varying order of relevance with at least one or more containing the information you need.  How can you tell which are relevant? You have to click on every result until you see the answer. This example has poor perceived relevance.

Now another extreme: each result in the list shows the entire document and you are presented with thousands of sentences to exhaustingly scroll through while hunting for what you need. This is also poor perceived relevance because again, it is difficult to tell immediately and requires significant effort.

Compare these extremes with what is typically presented: a title, a url, a short contextual snippet, and perhaps a date of publication. This allows one to scan the results and make a very quick decision on which is best before continuing further:

Google, Bing, and Brave all provide clear information that gives you enough information to make a decision on whether to click on the result. Only two snippets provide exactly the definition for the term, and only two provide extra text.  You can already see where this is going.  In this case, Bing's snippet will be useless to an LLM for summarization.

LLMs behave differently than people. And while we can drop entire documents into an LLM for a summary, it’s unnecessary and expensive, and will add noise and irrelevant information - especially for trivial queries.  So we look to optimize what to gather for context when summarizing a list of results.  In essence we need a concept of perceived relevance for LLMs.

In general, the following holds: longer snippets yield better summaries.  They reduce hallucinations and improve coverage of the answer.  However if the snippets are too long, noisy tangential or irrelevant information can creep into the summary.

Additionally, while there are plenty of LLM-as-a-judge theses out there, I posit that doing this separately is a waste of time for RAG.  LLM summaries work perfectly fine over dozens of results en lieu of a well tuned top list of 4 or 5.  In effect, extreme relevance tuning becomes less important when a summary is presented, because the LLM skips the irrelevant results for you. Thus, when validating the quality of a RAG summary with citations, you also get judgements as a bonus.

We consider these two areas: optimizing context and tuning result relevance, by interleaving results and scoring the summary. This yields important information and enables you to naturally gravitate to the best retrieval configuration.`

console.log(str.replace(/[a-z\d]/ig,'⌻'))
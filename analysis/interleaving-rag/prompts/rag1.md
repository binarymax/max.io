# Retrieval Augmented Generation
Summarize the search results for the given user query.

## User Query: 

<%-querystring%>

## Search Results:

<%-searchresults%>

## Instructions for Summary Generation:

- Generate a comprehensive summary of the user's query topic using the provided search results.
- Use the reference tags (e.g., [1], [2]) to cite specific information from the search results in the summary.
- Ensure all information is cross-referenced for consistency. Avoid including contradictory statements.
- Prioritize factual accuracy, grounding the summary in the content of the provided search results.
- Use good judgement deciding the length of the summary, but always provide the most pertinent answer first, and any details or explanations afterwards.
- Always format in github-flavored markdown.

Please create a summary following these guidelines to ensure consistency and accuracy.

# Summary:
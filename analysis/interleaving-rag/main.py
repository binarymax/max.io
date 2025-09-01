import os
import re
import html
import json
import pickle
import jsonlines
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

import spacy
nlp = spacy.load('en_core_web_lg')

def makerecallplot(data):
    # Prepare long-form DataFrame for seaborn (model, recall)
    recall_rows = []
    for model, values in data.items():
        for _, r in values:
            name = model.replace('-20241022','').replace('-20250514','')
            recall_rows.append({"model": name, "recall": 1-r})
    recall_df = pd.DataFrame(recall_rows)
    # Create violin plot
    fig = plt.figure(figsize=(10, 6))
    sns.violinplot(x="model", y="recall", data=recall_df, inner="quartile", palette="Set2")
    plt.title("Recall Distribution per Model")
    plt.xticks(rotation=25)
    plt.tight_layout()
    fig.savefig("recall2.png")

def makeprecisionplot(data):
    # Prepare long-form DataFrame for seaborn (model, recall)
    precision_rows = []
    for model, values in data.items():
        for p, _ in values:
            name = model.replace('-20241022','').replace('-20250514','')
            precision_rows.append({"model": name, "precision": p})
    precision_df = pd.DataFrame(precision_rows)
    # Create violin plot
    fig = plt.figure(figsize=(10, 6))
    sns.violinplot(x="model", y="precision", data=precision_df, inner="quartile", palette="Set2")
    plt.title("Precision Distribution per Model")
    plt.xticks(rotation=25)
    plt.tight_layout()
    fig.savefig("precision2.png")

def makef1plot(data):
    # Prepare long-form DataFrame for seaborn (model, recall)
    f1_rows = []
    for model, values in data.items():
        for p, r in values:
            name = model.replace('-20241022','').replace('-20250514','')
            f1 = 2*((p*(1-r))/(p+(1-r)))
            f1_rows.append({"model": name, "f1": f1})
    f1_df = pd.DataFrame(f1_rows)
    # Create violin plot
    fig = plt.figure(figsize=(10, 6))
    sns.violinplot(x="model", y="f1", data=f1_df, inner="quartile", palette="Set2")
    plt.title("F1 Distribution per Model")
    plt.xticks(rotation=25)
    plt.tight_layout()
    fig.savefig("f1.png")

citations = re.compile(r"\[[\d]+\]")
def getcites(summary):
    cites = set()
    matches = [int(m.replace('[','').replace(']','')) for m in citations.findall(summary)]
    [cites.add(m-1) for m in matches]
    return list(cites)

def getnouns(text):
    nouns = set()
    text = html.unescape(re.sub(r"<.*?>", "", text))
    doc = nlp(text)
    lemmas = [token.lemma_.lower() for token in doc if token.pos_ in ("NOUN", "PROPN")]
    [nouns.add(lemma) for lemma in lemmas]
    return nouns

def getsummary(obj):
    if(obj["model"][:6]=="claude"):
        text = obj["message"]["content"][0]["text"]
    elif (obj["model"][:3]=="gpt"):
        text = obj["summary"]
    return text    

def summarynouns(obj):
    summary = getsummary(obj)
    return getnouns(summary)

def hitnouns(obj,cites):
    texts = []
    for (i,o) in enumerate(obj["search"]["data"]["hits"]["hits"]):
        if i in cites:
            if "title" in o and "description" in o:
                texts.append(f'{o["title"]}.  {o["description"]}.')
            elif "title" in o:
                texts.append(o["title"])
            elif "description" in o:
                texts.append(o["description"])
    return getnouns('\n\n'.join(texts))

def load():
    models = {}
    with jsonlines.open('interleaving-summaries.jsonl','r') as jl:
        lst = [obj for obj in jl]
    for obj in lst:
        if(obj["model"] not in models.keys()):
            models[obj["model"]] = []
        cites = getcites(getsummary(obj))
        hn = hitnouns(obj,cites)
        if len(hn)>0:
            sn = summarynouns(obj)
            if len(sn)>0:
                precision = 1-(len(sn-hn)/len(sn)) #inverse of included nouns
                recall = 1-(len(hn-sn)/len(hn)) #inverse of missing nouns
                models[obj["model"]].append((recall,precision))
                print(precision,recall)
    
    makerecallplot(models)
    makeprecisionplot(models)

    with open('concept_f1.pickle', 'wb') as handle:
        pickle.dump(models, handle, protocol=pickle.HIGHEST_PROTOCOL)

def report():
    with open('concept_f1.pickle', 'rb') as handle:
        models = pickle.load(handle)
    
    #makerecallplot(models)
    #makeprecisionplot(models)
    makef1plot(models)


def main():
    print("Hello from interleaving-rag!")
    #load()
    report()


if __name__ == "__main__":
    main()

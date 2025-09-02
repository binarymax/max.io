import fs from 'fs';
//import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import {alpha} from 'krippendorff';

import {histogram} from './histogram.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models = [
  "claude-3-5-haiku-20241022",
  "gpt-4.1",
  "gpt-4.1-mini",
  "claude-sonnet-4-20250514"
]

const pairs = [
  ["claude-3-5-haiku-20241022","claude-sonnet-4-20250514"],
  ["gpt-4.1-mini","gpt-4.1"],
  ["claude-3-5-haiku-20241022","gpt-4.1-mini"],
  ["claude-sonnet-4-20250514","gpt-4.1"]
]


// Matches “[digits]”
const regex = /\[(\d+)\]/g;

const metrics = {

  "jaccard": function jaccard(list1, list2, _p) {
    const set1 = new Set(list1);
    const set2 = new Set(list2);

    const intersectionSize = [...set1].filter(x => set2.has(x)).length;
    let unionSize = new Set([...set1, ...set2]).size;

    let score = unionSize === 0 ? 0 : intersectionSize / unionSize;
    score = Math.round(score*1000)/1000;
    return score;

  },

  "rbo": function rbo(list1, list2, p) {
    p = p || 0.9;
    const set1 = new Set();
    const set2 = new Set();
    let agreement = 0;
    let cumulative = 0;
    const depth = Math.max(list1.length, list2.length);

    for (let d = 1; d <= depth; d++) {
      if (d <= list1.length) set1.add(list1[d - 1]);
      if (d <= list2.length) set2.add(list2[d - 1]);

      const intersection = new Set([...set1].filter(x => set2.has(x)));
      agreement = intersection.size;

      const weight = Math.pow(p, d - 1);
      cumulative += (agreement / d) * weight;
    }

    let score = (1 - p) * cumulative;
    score = Math.round(score*1000)/1000;
    return score;
  },

  "alpha": alpha


}

//Returns array of citations maintaining order of appearance in a summary
const getCitedOrder = function(body) {
  const citations = [];
  let match;
  while ((match = regex.exec(body)) !== null) {
    let val = parseInt(match[1])-1;
    if(citations.indexOf(val)<0) citations.push(val)
  }
  return citations;
}

//Returns binary relevance array of citations in order of position
const getCitedBinary = function(body,len) {
  const citations = new Array(len).fill(0);
  let match;
  while ((match = regex.exec(body)) !== null) {
    let val = parseInt(match[1])-1;
    citations[val]=1;
  }
  return citations;
}

function tally(rows,getCited) {
  const searches = rows.length;
  let interleaves = {};
  let positions = {};
  for(var i=0;i<rows.length;i++) {
    const row = rows[i];
    const summary = row.model.indexOf('gpt')==0 ? row.summary : row.message.content[0].text;
    const cited = getCited(summary);
    const length = row.search.data.hits.hits;
    cited.forEach(c=>{
      const h = hits[c];
      if(h && h.source) {
        const s = h.source;
        interleaves[s]=interleaves[s]||{"count":0,"len":0,"avg":0};
        interleaves[s].count++;
        if(h.description) {
          interleaves[s].len+=h.description.length;
        }
        positions[c] = positions[c]||0;
        positions[c]++;
      }
    });
    for(var key in interleaves) {
      if (interleaves.hasOwnProperty(key)) {
        interleaves[key].avg = interleaves[key].len/interleaves[key].count;
      }
    }
  }
  return {searches,interleaves,positions};
}

function aggregate(data) {

  const groups = {};
  data.forEach(row=>{
      const summary = row.model.indexOf('gpt')==0 ? row.summary : row.message.content[0].text;
      const length = row.search.data.hits.hits.length;
      const citations = getCitedOrder(summary);
      const ratings = getCitedBinary(summary,length);
      groups[row.id]=groups[row.id]||{};
      groups[row.id][row.model] = {citations,ratings};
    });
  const ids = Object.keys(groups);
  
  const report = {};

  const alphas = [];

  for(var id of ids) {
    for(var pair of pairs) {
      const pairid = pair.join('|');
      report[pairid] = report[pairid]||{jaccard:[],rbo:[],alpha:[]};
      const ac = groups[id][pair[0]].citations;
      const bc = groups[id][pair[1]].citations;
      const ar = groups[id][pair[0]].ratings;
      const br = groups[id][pair[1]].ratings;
      const jaccard = metrics.jaccard(ac,bc);
      const rbo = metrics.rbo(ac,bc);
      const alpha = metrics.alpha([ar,br]);
      report[pairid].jaccard.push(jaccard||0)
      report[pairid].rbo.push(rbo||0)
      report[pairid].alpha.push(alpha||0);
    }

    let ratingarr = []
    for(var m of models) {
      if(!groups[id][m].ratings) console.log(id,m);
      //else console.log(groups[id][m].ratings.length);
      ratingarr.push(groups[id][m].ratings.map(r=>r||0));
    }
    
    const ka = metrics.alpha(ratingarr)
    if(!ka) {
      console.log(id,ratingarr[0],ratingarr[1],ratingarr[2],ratingarr[3])
    }
    alphas.push(metrics.alpha(ratingarr));
    //break;
  }

  report.alphas = alphas;

  return report;
}

function loadData() {
  const data = fs.readFileSync('interleaving-summaries.jsonl','utf8')
    .split('\n')
    .filter(l=>l&&l.length)
    .map(l=>JSON.parse(l))
    .sort((a,b)=>{
      if(a.id<b.id) {
        return -1;
      } else if(a.id>b.id) {
        return 1;
      }
      return a.model<b.model?-1:1;
    })
  return data
}

function avg(arr) {
  return arr.reduce((a, c)=>a+c,0)/arr.length;
}

function toCSV(report) {

  const header = [];
  let firstpair = null;
  for(let pair of pairs) {
    const pairid=pair.join('|');
    firstpair = firstpair||pairid;
    header.push(`${pairid}_jaccard`);
    header.push(`${pairid}_rbo`);
    header.push(`${pairid}_alpha`);
  }

  console.log(header.join(','));
  const len = report[firstpair].jaccard.length;
  for(var i=0;i<report[firstpair].jaccard.length;i++) {
    const row = [];
    for(let pair of pairs) {
      const pairid=pair.join('|');
      row.push(report[pairid].jaccard[i]);
      row.push(report[pairid].rbo[i]);
      row.push(report[pairid].alpha[i]);
    }
    console.log(row.join(','));
  }

}

function toAlphaCSV(report) {
  const alphacsv = "alpha\n" + report.alphas.join("\n");
  fs.writeFileSync('alpha.csv',alphacsv,'utf8');
}

function main() {
  const data = loadData();
  const report = aggregate(data);
  //const rows = getCSV(report);
  //console.log(report["gpt-4.1-mini|gpt-4.1"]);
  const gpt = report["gpt-4.1-mini|gpt-4.1"]
  const claude = report["claude-3-5-haiku-20241022|claude-sonnet-4-20250514"]
  const fast = report["claude-3-5-haiku-20241022|gpt-4.1-mini"]
  const big = report["claude-sonnet-4-20250514|gpt-4.1"]

  const gpt_rbo_avg = avg(gpt.rbo);
  const claude_rbo_avg = avg(claude.rbo);
  const fast_rbo_avg = avg(fast.rbo);
  const big_rbo_avg = avg(big.rbo);

  const gpt_jaccard_avg = avg(gpt.jaccard);
  const claude_jaccard_avg = avg(claude.jaccard);
  const fast_jaccard_avg = avg(fast.jaccard);
  const big_jaccard_avg = avg(big.jaccard);

  const gpt_alpha_avg = avg(gpt.alpha);
  const claude_alpha_avg = avg(claude.alpha);
  const fast_alpha_avg = avg(fast.alpha);
  const big_alpha_avg = avg(big.alpha);

 //---

  /*
  console.log("gpt_rbo_avg",gpt_rbo_avg);
  console.log("claude_rbo_avg",claude_rbo_avg);
  console.log("fast_rbo_avg",fast_rbo_avg);
  console.log("big_rbo_avg",big_rbo_avg);

  console.log("gpt_jaccard_avg",gpt_jaccard_avg);
  console.log("claude_jaccard_avg",claude_jaccard_avg);
  console.log("fast_jaccard_avg",fast_jaccard_avg);
  console.log("big_jaccard_avg",big_jaccard_avg);

  console.log("gpt_alpha_avg",gpt_alpha_avg);
  console.log("claude_alpha_avg",claude_alpha_avg);
  console.log("fast_alpha_avg",fast_alpha_avg);
  console.log("big_alpha_avg",big_alpha_avg);
  */

  //toCSV(report)
  toAlphaCSV(report);


}

main();


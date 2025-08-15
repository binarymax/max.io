import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Matches “[digits]”
const regex = /\[(\d+)\]/g;

const citationTypes = {
  "getCitedAll":function(body) {
    const citations = [];  
    let match;
    while ((match = regex.exec(body)) !== null) {
      let val = parseInt(match[1]);
      citations.push(val-1);
    }
    return citations;
  },

  "getCitedNoRefs":function(body) {
    //Find and remove anything from the '# Reference' or '# Citation' sections
    let refpoint = body.indexOf(/(\n)(#+\s*)?(reference|citation)(s)?\n/i);
    body = body.substr(0,refpoint>0?refpoint:body.length);
    const citations = [];
    let match;
    while ((match = regex.exec(body)) !== null) {
      let val = parseInt(match[1]);
      citations.push(val-1);
    }
    return citations;
  },

  "getCitedOnce":function(body) {
    const citations = new Set();
    let match;
    while ((match = regex.exec(body)) !== null) {
      let val = parseInt(match[1]);
      citations.add(val-1);
    }
    return Array.from(citations);
  },

  "getCitedFirst":function(body) {
    const citations = [];
    let match;
    while ((match = regex.exec(body)) !== null) {
      let val = parseInt(match[1]);
      citations.push(val-1);
      return citations;
    }
    return citations;
  }
}

function getMissing(data) {
  const total = 974;
  const check = Array.from({ length: total }, () => 0)
  let i;
  for(i=0;i<data.length;i++) {
    let id = data[i].id
    check[id]++;
  }
  const missing = [];
  for(i=0;i<total;i++) {
    if(check[i]<4) {
      missing.push(i);
    }
  }
  for(i=0;i<missing.length;i++) {
    for(var d=0;d<data.length;d++) {
      if(data[d].id==missing[i]) {
        console.error(missing[i],data[d].model);
      }
    }
  }
  return missing;
}

function tally(rows,getCited) {
  const searches = rows.length;
  let interleaves = {};
  let positions = {};
  for(var i=0;i<rows.length;i++) {
    const row = rows[i];
    const summary = row.model.indexOf('gpt')==0 ? row.summary : row.message.content[0].text;
    const cited = getCited(summary);
    const hits = row.search.data.hits.hits;
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

  const missing = getMissing(data);
  if (missing && missing.length) {
    console.log(missing)
    console.error('Found missing, exiting');
    process.exit(1);
  }

  const groups = {};
  data.forEach(row=>{
      groups[row.model]=groups[row.model]||[];
      groups[row.model].push(row);
    });
  const models = Object.keys(groups);
  //console.log(models);
  
  const report = {};

  for(var model of models) {
    report[model] = {}
    for(let type of Object.keys(citationTypes)) {
      if(type!='getCitedNoRefs') {
        const results = tally(groups[model],citationTypes[type]);
        report[model][type] = results;
      }
    }
  }
  //console.log(JSON.stringify(report,null,2));
  return report;
}

function getCSV(obj) {

  const rows = [];
  const headerSet = new Set(['model', 'citationType', 'searches']);

  // First pass: gather all possible headers
  for (const model in obj) {
    for (const citationType in obj[model]) {
      const entry = obj[model][citationType];
      if (entry.interleaves) {
        for (const provider in entry.interleaves) {
          headerSet.add(`${provider}_cited`);
          headerSet.add(`${provider}_char_len`);
          headerSet.add(`${provider}_char_len_avg`);
        }
      }
      if (entry.positions) {
        for (const pos in entry.positions) {
          headerSet.add(`pos_${pos}`);
        }
      }
    }
  }

  const headers = Array.from(headerSet);
  rows.push(headers);

  // Second pass: build rows
  for (const model in obj) {
    for (const citationType in obj[model]) {
      const entry = obj[model][citationType];
      const row = {};
      row.model = model;
      row.citationType = citationType;
      row.searches = entry.searches ?? '';

      if (entry.interleaves) {
        for (const provider in entry.interleaves) {
          const p = entry.interleaves[provider];
          row[`${provider}_cited`] = p.count ?? '';
          row[`${provider}_char_len`] = p.len ?? '';
          row[`${provider}_char_len_avg`] = p.avg ?? '';
        }
      }

      if (entry.positions) {
        for (const pos in entry.positions) {
          row[`pos_${pos}`] = entry.positions[pos] ?? '';
        }
      }

      rows.push(headers.map(h => row[h] ?? ''));
    }
  }

  return rows.map(r => Array.isArray(r) ? r : r.map(String)).map(r =>
    r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  return rows;
}

function loadData() {
  const data = fs.readFileSync('interleaving-summaries.jsonl','utf8')
    .split('\n')
    .filter(l=>l&&l.length)
    .map(l=>JSON.parse(l))
    .sort((a,b)=>{
      if(a.model<b.model) {
        return -1;
      } else if(a.model>b.model) {
        return 1;
      }
      return a.id<b.id?-1:1;
    })
    return data;
}

function main() {
  const data = loadData();
  const report = aggregate(data);
  const rows = getCSV(report);
  console.log(rows);
}

main();


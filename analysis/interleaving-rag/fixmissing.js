import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import LLM from 'llm-primitives';
import Anthropic from '@anthropic-ai/sdk';
import pLimit from 'p-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const out = fs.openSync('interleaving-summaries.jsonl','a');

async function getClaudeSummary(data) {

  const client = new Anthropic({apiKey: process.env['ANTHROPIC_API_KEY']});
  const message = await client.messages.create({
    max_tokens: 1024,
    messages: [{ role: 'user', content: data.context }],
    model: data.model
  });
  data.message = message;
  return data;
  
}

async function getGPTSummary(data) {

  const llm = new LLM({
    apiKey:process.env.OPENAI_API_KEY,
    model:data.model,
    userid:`Interleaving RAG Analysis :: ${data.model}`
  });

  data.summary = await llm.string(data.context);
  return data;
  
}

function getContext(search) {
  const llm = new LLM({apiKey:process.env.OPENAI_API_KEY,model:"gpt-4o-mini",prompts:path.join(__dirname,"prompts")});
  const hits = search.data?.hits;
  if (hits && hits.hits && hits.hits.length) {
    let idx = 0;
    const querystring = search.query;
    const searchresults = hits.hits.map(h=>` [${++idx}] ${h.title}: ${h.description}`).join('\n');
    const context = llm.render('rag1',{querystring,searchresults});
    return context;
  }
  return null;
}


async function getRows() {
  const d = JSON.parse(fs.readFileSync('./all-search-rows-dev.json','utf8'));
  const p = JSON.parse(fs.readFileSync('./all-search-rows-prod.json','utf8'));
  const q = new Set();
  const rows = [];
  p.concat(d).forEach(r=>{
    if(!q.has(r.query)) {
      rows.push({...r});
      q.add(r.query);
    }
  });
  return rows;
}

async function infer(querydata) {

  const models = [
    'claude-sonnet-4-20250514',
    'claude-3-5-haiku-20241022',
    'gpt-4.1',
    'gpt-4.1-mini'
  ];

  const limit = pLimit(1);
  let requests = [];

  let total = querydata.length*models.length;
  let done = 0;
  async function getSummary(data) {
    let row = null;
    if(data.model.indexOf('claude')>-1) {
      row = await getClaudeSummary(data);
    } else {
      row = await getGPTSummary(data);
    }
    done++;
    console.log(done,total,parseInt(done/total*100));
    if(row) {
      fs.writeSync(out,JSON.stringify(row)+'\n','utf8');
      return true;
    }
    return false;
  }

  const missing = [
    {"id":65,"model":"gpt-4.1-mini"},
    {"id":67,"model":"claude-sonnet-4-20250514"},
    {"id":328,"model":"gpt-4.1"}
  ]

  for(var i=0;i<missing.length;i++) {
    const id=missing[i].id;
    const model=missing[i].model;
    const search = querydata[id]
    const context = getContext(search);
    const data = {id,search,context,model};
    requests.push(limit(()=>getSummary(data)));
  }
  const result = await Promise.all(requests);
  console.log(result);

  /*
  for(var id=329;id<querydata.length;id++) {
      const search = querydata[id];
      const context = getContext(search);
      const obj = {id,search,context};
      models.forEach(model=>{
          const data = {...obj}
          data.model = model;
          requests.push(limit(()=>getSummary(data)));
      });
  }
  const result = await Promise.all(requests);
  console.log(result);
  */
}

async function main() {
  const rows = await getRows();
  const querydata = rows.map(r=>{return {query:r.query,data:r.data}});
  await infer(querydata);
  fs.closeSync(out);  
  process.exit(0);
}

main();
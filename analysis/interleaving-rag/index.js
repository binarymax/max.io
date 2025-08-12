import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import LLM from 'llm-primitives';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

function getCited(body) {
  const citations = [];

  // Matches “[digits]”
  const regex = /\[(\d+)\]/g;
  
  let match;
  while ((match = regex.exec(body)) !== null) {
    let val = parseInt(match[1]);
    citations.push(val-1);
  }
  return citations;
}

async function getSummaries(model,querydata) {

  const llm = new LLM({
    apiKey:process.env.OPENAI_API_KEY,
    model:model,
    prompts:path.join(__dirname,"prompts"),
    userid:`Interleaving RAG Analysis :: ${model}`
  });

  //for(var i=0;i<querydata.length;i++) {
  for(var i=0;i<1;i++) {
    const search = querydata[i];
    const hits = search.data?.hits;
    if (hits && hits.hits && hits.hits.length) {
      let idx = 0;
      const querystring = search.query;
      const searchresults = hits.hits.map(h=>` [${++idx}] ${h.title}: ${h.description}`).join('\n');
      const context = llm.render('rag1',{querystring,searchresults});
      const summary = await llm.string(context);
      console.log(`\n\n------------------${model}--------------------`)
      console.log(summary);
      console.log(`/------------------${model}-------------------\n\n`)

    }
  }

  //console.log(await llm.costs());

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

async function main() {
  const rows = await getRows();
  const querydata = rows.map(r=>{return {query:r.query,data:r.data}});
  await getSummaries('gpt-4o',querydata);
  await getSummaries('gpt-4.1',querydata);
  await getSummaries('gpt-4.1-mini',querydata);
  await getSummaries('gpt-4.1-nano',querydata);
  process.exit(0);
}

main();
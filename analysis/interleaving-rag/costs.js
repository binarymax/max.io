import fs from 'fs';

const pricesPerMillion = {
    "claude-3-5-haiku-20241022": { input: 0.80, output: 4.00 },
    "claude-sonnet-4-20250514": { input: 3.00, output: 15.00 }
};

function InferenceCost(response,ppm,inputs,outputs) {
    let modelVersion = response.model;
    if (!ppm) { 
      if (!(modelVersion in pricesPerMillion)) {
          modelVersion="";
          Object.keys(pricesPerMillion).forEach(m=>{
            if(response.model.indexOf(m) && m.length>modelVersion.length) {
              modelVersion = m;
            }
          })
      }
      if (!(modelVersion in pricesPerMillion)) {
        console.error(`WARNING! Pricing information for model '${modelVersion}' is not available. Provide pricing by setting {input:X, output:Y} as the ppm (prices per million) value when instantiating LLM`);
        return 0;
      } else {
        ppm = pricesPerMillion[modelVersion];
      }
    }
    const inputPricePerMillion = ppm.input;
    const outputPricePerMillion = ppm.output;

    const promptTokens = response.usage[inputs];
    const completionTokens = response.usage[outputs];

    const inputCost = (promptTokens / 1_000_000) * inputPricePerMillion;
    const outputCost = (completionTokens / 1_000_000) * outputPricePerMillion;
    return (Math.round((inputCost + outputCost)*10000000))/10000000;
}

function aggregate(data) {

  const amounts = {};
  data.forEach(row=>{
      if (row.model.indexOf('claude')==0) {
        if(!amounts[row.model]) amounts[row.model] = [];
        amounts[row.model].push(InferenceCost(row.message,null,'input_tokens','output_tokens'));
      }
  });
  return amounts;
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

function main() {
  const data = loadData();
  const amount = aggregate(data);
  console.log(amount);
}

main();
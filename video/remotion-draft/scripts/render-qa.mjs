import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const serveUrl = await bundle({entryPoint:path.resolve('src/index.ts')});
for (const id of ['Opening','Architecture','Status','Sources','Trend','Fleet','Memory','Closing']) {
  const composition=await selectComposition({serveUrl,id});
  await renderStill({serveUrl,composition,output:path.resolve(`out/qa/${id.toLowerCase()}.png`),frame:90});
  console.log(`Rendered QA still: ${id}`);
}

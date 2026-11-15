import {publicationRows,assertPlacement} from '../../lib/ai-and-jobs.mjs';
export function GET() {
 const snapshots=Object.values(import.meta.glob('../../../data/ai-and-jobs/*.json',{eager:true,import:'default'})) as any[];
 snapshots.sort((a,b)=>b.retrieved_at.localeCompare(a.retrieved_at));
 return new Response(JSON.stringify({section:'happening',rows:assertPlacement(publicationRows(snapshots[0],'happening'),'happening')}),{headers:{'Content-Type':'application/json'}});
}

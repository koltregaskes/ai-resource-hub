import {validateJobs} from '../../../lib/ai-and-jobs.mjs';
export function getStaticPaths() {
 return Object.values(import.meta.glob('../../../../data/ai-and-jobs/*.json',{eager:true,import:'default'})).map((s:any)=>({params:{date:s.retrieved_at},props:{snapshot:validateJobs(s)}}));
}
export function GET({props}:any) {return new Response(JSON.stringify(props.snapshot),{headers:{'Content-Type':'application/json'}});}

export function getStaticPaths() {
 const files=import.meta.glob('../../../../../../data/lab-standings/rescored/*/*.json',{eager:true,import:'default'});
 return Object.values(files).map((snapshot:any)=>({params:{method:snapshot.method,date:snapshot.date},props:{snapshot}}));
}
export function GET({props}:any) { return new Response(JSON.stringify(props.snapshot),{headers:{'Content-Type':'application/json'}}); }

export function getStaticPaths() {
 const files=import.meta.glob('../../../../data/lab-standings/snapshots/*.json',{eager:true,import:'default'});
 return Object.values(files).map((snapshot:any)=>({params:{date:snapshot.date},props:{snapshot}}));
}
export function GET({props}:any) { return new Response(JSON.stringify(props.snapshot),{headers:{'Content-Type':'application/json'}}); }
